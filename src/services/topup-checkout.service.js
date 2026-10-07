import { iyzico } from "../providers/iyzico/client.js";
import { getTopupPack, TOPUP_VALID_DAYS } from "../config/topup-packs.js";
import { getSubscriptionSummary } from "./subscriptions.service.js";
import { getSupabaseAdminClient } from "../repositories/credits.repo.js";
import { loadConfig } from "../config/env.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("iyzico-topup");
const Iyzipay = iyzico.constants;

// token→(userId, packKey) eşlemesi. Callback'te oturum yok; init anında yazılır.
async function storeTopupIntent({ token, userId, pack }) {
  const admin = getSupabaseAdminClient();
  await admin.from("ff_topup_intents").upsert(
    { token, user_id: userId, pack_key: pack.key, credits: pack.credits, price_try: pack.priceTry },
    { onConflict: "token" }
  );
}

async function resolveTopupIntent(token) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("ff_topup_intents")
    .select("user_id, pack_key")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return null;
  return { userId: data.user_id, packKey: data.pack_key };
}

async function clearTopupIntent(token) {
  try {
    const admin = getSupabaseAdminClient();
    await admin.from("ff_topup_intents").delete().eq("token", token);
  } catch (error) {
    log.warn("topup intent cleanup failed", { error });
  }
}

function buyerNameFrom(user) {
  const meta = user?.user_metadata || {};
  const full = String(meta.full_name || meta.name || "").trim();
  if (full) return full;
  const local = String(user?.email || "").split("@")[0] || "Atelify";
  return local.slice(0, 60);
}

function addDaysIso(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// Yalnızca AKTİF ABONE olan kullanıcı top-up alabilir (dönem sonuna kadar geçerli
// iptal de aktif sayılır; free/aboneliksiz alamaz).
async function hasActiveSubscription(userId) {
  try {
    const summary = await getSubscriptionSummary({ userId });
    return Boolean(summary?.active) && summary.planKey !== "free";
  } catch (error) {
    log.warn("topup subscription check failed", { error });
    return false;
  }
}

// iyzico Checkout Form başlatır (tek seferlik kredi paketi). Fiyat SERVER'dan
// (topup-packs.js) alınır. callbackUrl top-up'a özel endpoint'e gider.
export async function initTopupCheckout({ user, packKey, clientIp = "" }) {
  const pack = getTopupPack(packKey);
  if (!pack) {
    return { status: 400, payload: { error: "Geçersiz kredi paketi." } };
  }
  if (!(await hasActiveSubscription(user.id))) {
    return { status: 403, payload: { error: "Ek kredi almak için önce bir abonelik planına geçmelisin." } };
  }

  const config = loadConfig();
  const priceStr = String(pack.priceTry);
  const buyerName = buyerNameFrom(user);
  const address = "Atelify dijital hizmet";
  const callbackUrl = `${config.siteUrl || ""}/api/iyzico/topup-callback`;

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: `topup${"|"}${user.id}${"|"}${pack.key}`,
    price: priceStr,
    paidPrice: priceStr,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: `ff-topup-${pack.key}-${Date.now()}`,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: user.id,
      name: buyerName,
      surname: "Atelify",
      gsmNumber: "+905350000000",
      email: user.email || "musteri@atelify.aruntas.com",
      identityNumber: "11111111111",
      registrationAddress: address,
      ip: clientIp || "85.34.78.112",
      city: "Istanbul",
      country: "Turkey",
      zipCode: "34000",
    },
    shippingAddress: { contactName: buyerName, city: "Istanbul", country: "Turkey", address, zipCode: "34000" },
    billingAddress: { contactName: buyerName, city: "Istanbul", country: "Turkey", address, zipCode: "34000" },
    basketItems: [
      {
        id: `topup-${pack.key}`,
        name: `Atelify ${pack.credits} kredi paketi`,
        category1: "Kredi",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: priceStr,
      },
    ],
  };

  try {
    const result = await iyzico.initCheckoutForm(request);
    if (result?.token) {
      await storeTopupIntent({ token: result.token, userId: user.id, pack });
    }
    return {
      status: 200,
      payload: {
        token: result.token,
        checkoutFormContent: result.checkoutFormContent,
        paymentPageUrl: result.paymentPageUrl || "",
      },
    };
  } catch (error) {
    log.error("topup checkout init failed", { error, packKey: pack.key });
    return { status: 502, payload: { error: "Ödeme başlatılamadı. Lütfen tekrar dene." } };
  }
}

// iyzico callback'i: token ile sonucu çeker, tutarı doğrular, top-up kovasına 90 gün
// geçerli kredi yazar. Döner: { ok, packKey, credits, reason }.
export async function handleTopupCheckoutCallback({ token }) {
  if (!token) return { ok: false, reason: "missing_token" };

  let result;
  try {
    result = await iyzico.retrieveCheckoutForm({ locale: Iyzipay.LOCALE.TR, token });
  } catch (error) {
    log.error("topup retrieve failed", { error });
    return { ok: false, reason: "retrieve_failed" };
  }

  if (result?.paymentStatus !== "SUCCESS") {
    return { ok: false, reason: result?.paymentStatus || "not_success" };
  }

  const intent = await resolveTopupIntent(token);
  if (!intent || !intent.userId) {
    log.error("topup callback resolve failed", { token });
    return { ok: false, reason: "bad_intent" };
  }
  const pack = getTopupPack(intent.packKey);
  if (!pack) {
    return { ok: false, reason: "bad_pack" };
  }

  // Server-otoriter tutar doğrulaması.
  if (Math.round(Number(result.paidPrice)) !== pack.priceTry) {
    log.error("topup callback amount mismatch", { paidPrice: result.paidPrice, expected: pack.priceTry, packKey: pack.key });
    return { ok: false, reason: "amount_mismatch" };
  }

  try {
    const admin = getSupabaseAdminClient();
    const expiresAt = addDaysIso(new Date(), TOPUP_VALID_DAYS);
    const { data, error } = await admin.rpc("ff_add_credit_topup", {
      p_user_id: intent.userId,
      p_amount: pack.credits,
      p_expires_at: expiresAt,
      p_provider: "iyzico",
      p_order_ref: token, // idempotency: aynı ödeme iki kez kredi yazmaz
      p_label: `${pack.credits} kredi paketi`,
    });
    if (error) throw new Error(error.message || "Kredi yüklenemedi.");
    await clearTopupIntent(token);
    return { ok: true, packKey: pack.key, credits: pack.credits, applied: data === true };
  } catch (error) {
    log.error("topup grant apply failed", { error, packKey: pack.key, userId: intent.userId });
    return { ok: false, reason: "apply_failed" };
  }
}
