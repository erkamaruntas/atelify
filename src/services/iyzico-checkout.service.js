import { randomUUID } from "node:crypto";

import { iyzico } from "../providers/iyzico/client.js";
import { getPlan, isRecurringPlan } from "../config/plans.js";
import { applyPlanRenewal } from "./subscriptions.service.js";
import { getSupabaseAdminClient } from "../repositories/credits.repo.js";
import { loadConfig } from "../config/env.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("iyzico-checkout");
const Iyzipay = iyzico.constants;
const CONVERSATION_SEP = "|";

// conversationId, iyzico'ya gönderdiğimiz ve callback'te aynen geri aldığımız
// bağ kimliği. userId + planKey taşır (kullanıcı oturumu callback'te olmadığı için).
function encodeConversationId(userId, planKey) {
  return `${userId}${CONVERSATION_SEP}${planKey}${CONVERSATION_SEP}${randomUUID()}`;
}

function decodeConversationId(conversationId) {
  const parts = String(conversationId || "").split(CONVERSATION_SEP);
  return { userId: parts[0] || "", planKey: parts[1] || "" };
}

// iyzico token'ı ↔ (userId, planKey) eşlemesi. conversationId retrieve'de güvenilir
// dönmediği için (bad_conversation), init anında token'ı ff_subscriptions'a 'pending'
// satır olarak yaz; callback'te token (subscription_ref) ile kesin çöz. Ödeme başarılı
// olunca ff_apply_subscription_renewal aynı satırı 'active'e çevirir.
async function storeCheckoutIntent(token, userId, planKey) {
  try {
    const admin = getSupabaseAdminClient();
    await admin.from("ff_subscriptions").upsert(
      { provider: "iyzico", subscription_ref: token, user_id: userId, plan_key: planKey, status: "pending" },
      { onConflict: "provider,subscription_ref" }
    );
  } catch (error) {
    log.warn("checkout intent store failed", { error });
  }
}

async function resolveCheckoutIntent(token) {
  try {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("ff_subscriptions")
      .select("user_id, plan_key")
      .eq("provider", "iyzico")
      .eq("subscription_ref", token)
      .maybeSingle();
    if (error || !data) return null;
    return { userId: data.user_id, planKey: data.plan_key };
  } catch (error) {
    log.warn("checkout intent lookup failed", { error });
    return null;
  }
}

function buyerNameFrom(user) {
  const meta = user?.user_metadata || {};
  const full = String(meta.full_name || meta.name || "").trim();
  if (full) return full;
  const local = String(user?.email || "").split("@")[0] || "Atelify";
  return local.slice(0, 60);
}

function addMonthsIso(date, months) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

// iyzico Checkout Form başlatır. Plan fiyatı SERVER'dan (plans.js) alınır; istemciden
// gelen tutara güvenilmez. Dönen checkoutFormContent odeme.html'e gömülür.
export async function initPlanCheckout({ user, planKey, clientIp = "" }) {
  const plan = getPlan(planKey);
  if (!plan) {
    return { status: 400, payload: { error: "Geçersiz plan." } };
  }
  if (!isRecurringPlan(planKey)) {
    return { status: 400, payload: { error: "Bu plan ödeme gerektirmiyor." } };
  }
  const config = loadConfig();
  const priceStr = String(plan.priceTry);
  const conversationId = encodeConversationId(user.id, plan.key);
  const buyerName = buyerNameFrom(user);
  const address = "Atelify dijital hizmet";
  const callbackUrl = `${config.siteUrl || ""}/api/iyzico/callback`;

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId,
    price: priceStr,
    paidPrice: priceStr,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: `ff-${plan.key}-${Date.now()}`,
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
    shippingAddress: {
      contactName: buyerName,
      city: "Istanbul",
      country: "Turkey",
      address,
      zipCode: "34000",
    },
    billingAddress: {
      contactName: buyerName,
      city: "Istanbul",
      country: "Turkey",
      address,
      zipCode: "34000",
    },
    basketItems: [
      {
        id: plan.key,
        name: `Atelify ${plan.key.toUpperCase()} aylik kredi`,
        category1: "Abonelik",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: priceStr,
      },
    ],
  };

  try {
    const result = await iyzico.initCheckoutForm(request);
    if (result?.token) {
      await storeCheckoutIntent(result.token, user.id, plan.key);
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
    log.error("checkout init failed", { error, planKey: plan.key });
    return { status: 502, payload: { error: "Ödeme başlatılamadı. Lütfen tekrar dene." } };
  }
}

// iyzico callback'i: token ile sonucu çeker, doğrular, krediyi yükler.
// Döner: { ok, planKey, reason } — endpoint buna göre yönlendirir.
export async function handlePlanCheckoutCallback({ token }) {
  if (!token) return { ok: false, reason: "missing_token" };

  let result;
  try {
    result = await iyzico.retrieveCheckoutForm({ locale: Iyzipay.LOCALE.TR, token });
  } catch (error) {
    log.error("checkout retrieve failed", { error });
    return { ok: false, reason: "retrieve_failed" };
  }

  if (result?.paymentStatus !== "SUCCESS") {
    return { ok: false, reason: result?.paymentStatus || "not_success" };
  }

  // Önce token→intent (server saklaması, güvenilir); olmazsa conversationId yedeği.
  let resolved = await resolveCheckoutIntent(token);
  if (!resolved || !resolved.userId) {
    resolved = decodeConversationId(result.conversationId);
  }
  const userId = resolved.userId;
  const planKey = resolved.planKey;
  const plan = getPlan(planKey);
  if (!userId || !plan) {
    log.error("checkout callback resolve failed", {
      conversationId: result.conversationId,
      resolvedUserId: userId,
      resolvedPlan: planKey,
    });
    return { ok: false, reason: "bad_conversation" };
  }

  // Server-otoriter tutar doğrulaması: ödenen fiyat plan fiyatıyla eşleşmeli.
  if (Math.round(Number(result.paidPrice)) !== plan.priceTry) {
    log.error("checkout callback amount mismatch", {
      paidPrice: result.paidPrice,
      expected: plan.priceTry,
      planKey: plan.key,
    });
    return { ok: false, reason: "amount_mismatch" };
  }

  try {
    const renewal = await applyPlanRenewal({
      provider: "iyzico",
      eventId: String(result.paymentId),
      userId,
      subscriptionRef: token, // init'te 'pending' yazılan satır burada 'active'e döner
      planKey: plan.key,
      periodEnd: addMonthsIso(new Date(), 1),
      label: `${plan.key.toUpperCase()} aylık ödeme`,
    });
    return { ok: true, planKey: plan.key, applied: renewal.applied };
  } catch (error) {
    log.error("checkout renewal apply failed", { error, planKey: plan.key, userId });
    return { ok: false, reason: "apply_failed" };
  }
}
