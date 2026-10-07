// iyzico abonelik ürününü + Go/Pro/Max aylık pricing-plan'lerini bir kez oluşturur
// ve referans kodlarını .env'e yapıştırmaya hazır biçimde yazar.
//
// Kullanım:  node scripts/iyzico-setup-plans.mjs
// Gerekli env: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL (sandbox default).
//
// NOT: Her çalıştırma YENİ kayıtlar oluşturur (iyzico tarafında idempotent değil).
// Sandbox'ta bir kez çalıştır, çıktı referans kodlarını env'e gir, tekrar çalıştırma.
import { randomUUID } from "node:crypto";

import { iyzico } from "../src/providers/iyzico/client.js";
import { SUBSCRIPTION_PLANS } from "../src/config/plans.js";

const Iyzipay = iyzico.constants;

async function main() {
  const product = await iyzico.createSubscriptionProduct({
    locale: Iyzipay.LOCALE.TR,
    conversationId: randomUUID(),
    name: "ff Studio Abonelik",
    description: "ff Studio aylık kredi aboneliği",
  });
  const productReferenceCode = product?.data?.referenceCode || product?.referenceCode;
  if (!productReferenceCode) {
    throw new Error(`Ürün oluşturulamadı: ${JSON.stringify(product)}`);
  }

  const out = { IYZICO_PRODUCT_REF: productReferenceCode };

  for (const key of ["go", "pro", "max"]) {
    const plan = SUBSCRIPTION_PLANS[key];
    const result = await iyzico.createPricingPlan({
      locale: Iyzipay.LOCALE.TR,
      conversationId: randomUUID(),
      productReferenceCode,
      name: `ff ${key.toUpperCase()}`,
      price: plan.priceTry,
      currencyCode: Iyzipay.CURRENCY.TRY,
      paymentInterval: Iyzipay.SUBSCRIPTION_PRICING_PLAN_INTERVAL.MONTHLY,
      paymentIntervalCount: 1,
      planPaymentType: Iyzipay.PLAN_PAYMENT_TYPE.RECURRING,
    });
    const ref = result?.data?.referenceCode || result?.referenceCode;
    if (!ref) {
      throw new Error(`Pricing plan (${key}) oluşturulamadı: ${JSON.stringify(result)}`);
    }
    out[`IYZICO_PLAN_${key.toUpperCase()}_REF`] = ref;
  }

  console.log("\n✅ iyzico ürün + planlar oluşturuldu. Şunları .env / Vercel env'e ekle:\n");
  for (const [envName, value] of Object.entries(out)) {
    console.log(`${envName}=${value}`);
  }
  console.log("");
}

main().catch((error) => {
  console.error("\n❌ iyzico setup hatası:", error?.iyzicoResult || error?.message || error);
  process.exit(1);
});
