-- 0018_signup_credit_default.sql
-- Açılış (signup) kredisi 15 → 10. UI her yerde "Ücretsiz 10 kredi" diyordu
-- (index.html, paketler.html, SUBSCRIPTION_PLANS.free.creditAmount = 10) ama
-- 0002'deki tablo default'u 15'te kalmıştı; yeni kayıtlar 15 kredi alıyordu.
-- ff_ensure_user_credits insert'i kolon default'larına dayandığı için burada
-- default'u değiştirmek yeni hesapları 10 krediye çeker.
--
-- plan_key default'u da ölü 'temel' değerinden SUBSCRIPTION_PLANS ile uyumlu
-- 'free'e çekiliyor (kodda 'temel' okuyan yer yok).
--
-- MEVCUT cüzdanlara DOKUNULMAZ: 15 ile açılmış hesapların bakiyesi/harcaması
-- olduğu gibi kalır, geriye dönük düzeltme kasıtlı olarak yapılmıyor.

alter table public.ff_user_credits
  alter column balance set default 10,
  alter column total_granted set default 10,
  alter column plan_key set default 'free';

notify pgrst, 'reload schema';
