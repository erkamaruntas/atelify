-- 0015_drop_checkout_intents.sql
-- 0014'te eklenen ff_checkout_intents'ten vazgeçildi: checkout token ↔ (user, plan)
-- eşlemesi artık ff_subscriptions'ta 'pending' satır olarak tutuluyor (zaten PostgREST
-- şema cache'inde olan tablo; yeni tablo cache'e yansımıyordu). Kullanılmayan tabloyu
-- temizliyoruz.
drop table if exists public.ff_checkout_intents;
