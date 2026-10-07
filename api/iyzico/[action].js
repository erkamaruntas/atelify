// Hobby plan serverless function sınırı (12) için iyzico uç noktaları tek dinamik
// route altında toplandı. URL'ler aynı kalır: /api/iyzico/checkout,
// /api/iyzico/callback, /api/iyzico/topup-callback ve (vercel.json rewrite ile)
// /api/topup/checkout. Gerçek handler mantığı underscore dosyalarında.
import callbackHandler from "./_callback.js";
import checkoutHandler from "./_checkout.js";
import topupCallbackHandler from "./_topup-callback.js";
import topupCheckoutHandler from "./_topup-checkout.js";

// Callback'ler x-www-form-urlencoded ham gövdeyi kendisi okur; checkout'lar JSON'u
// readJsonRequestBody ile stream'den okur. İkisi de bodyParser kapalıyken çalışır.
export const config = {
  api: { bodyParser: false },
};

const HANDLERS = {
  callback: callbackHandler,
  checkout: checkoutHandler,
  "topup-callback": topupCallbackHandler,
  "topup-checkout": topupCheckoutHandler,
};

export default async function handler(request, response) {
  const value = request.query?.action;
  const action = Array.isArray(value) ? value[0] || "" : value || "";
  const target = HANDLERS[action];
  if (target) return target(request, response);

  response.setHeader("Access-Control-Allow-Origin", "*");
  return response.status(404).json({ error: "Not found" });
}
