import Iyzipay from "iyzipay";

import { loadConfig } from "../../config/env.js";

// Resmi iyzipay SDK callback-tabanlı; burada promise'e sarıp tek bir yerden
// yapılandırıyoruz. Anahtarlar yoksa (ödeme henüz bağlanmadıysa) net hata verir.
let cachedClient = null;

export function getIyzicoClient() {
  if (cachedClient) return cachedClient;
  const config = loadConfig();
  if (!config.iyzicoApiKey || !config.iyzicoSecretKey) {
    throw new Error(
      "iyzico anahtarları tanımlı değil (IYZICO_API_KEY / IYZICO_SECRET_KEY). .env veya hosting env ayarlarını kontrol et."
    );
  }
  cachedClient = new Iyzipay({
    apiKey: config.iyzicoApiKey,
    secretKey: config.iyzicoSecretKey,
    uri: config.iyzicoBaseUrl,
  });
  return cachedClient;
}

// SDK metodlarını (params, cb) -> Promise'e çevirir. iyzico "failure" status'unu da
// hataya yükseltir (errorCode/errorMessage taşır).
function callIyzico(invoke, params) {
  return new Promise((resolve, reject) => {
    try {
      invoke(params, (err, result) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(typeof err === "string" ? err : "iyzico isteği başarısız."));
          return;
        }
        if (result && result.status === "failure") {
          const error = new Error(result.errorMessage || "iyzico isteği reddedildi.");
          error.iyzicoErrorCode = result.errorCode;
          error.iyzicoResult = result;
          reject(error);
          return;
        }
        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export const iyzico = {
  // SDK sabitleri (LOCALE, CURRENCY, SUBSCRIPTION_PRICING_PLAN_INTERVAL, PLAN_PAYMENT_TYPE...)
  constants: Iyzipay,
  createSubscriptionProduct: (params) =>
    callIyzico((p, cb) => getIyzicoClient().subscriptionProduct.create(p, cb), params),
  createPricingPlan: (params) =>
    callIyzico((p, cb) => getIyzicoClient().subscriptionPricingPlan.create(p, cb), params),
  // --- Ücretli abonelik modülü (şimdilik kapalı; ileride kullanılabilir) ---
  initSubscriptionCheckoutForm: (params) =>
    callIyzico((p, cb) => getIyzicoClient().subscriptionCheckoutForm.initialize(p, cb), params),
  cancelSubscription: (params) =>
    callIyzico((p, cb) => getIyzicoClient().subscription.cancel(p, cb), params),
  // --- Standart Checkout Form (ücretsiz, sandbox'ta çalışıyor) — aylık tahsilatı
  //     bununla alıyoruz; recurring'i kendi tarafımızda yönetiyoruz. ---
  initCheckoutForm: (params) =>
    callIyzico((p, cb) => getIyzicoClient().checkoutFormInitialize.create(p, cb), params),
  retrieveCheckoutForm: (params) =>
    callIyzico((p, cb) => getIyzicoClient().checkoutForm.retrieve(p, cb), params),
};
