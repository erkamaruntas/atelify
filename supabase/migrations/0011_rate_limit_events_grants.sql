-- 0011_rate_limit_events_grants.sql
-- 0008_rate_limit_events.sql tabloya/sequence'e grant vermeyi atlamıştı; bu
-- yüzden service_role (sunucu tarafı rate-limit kontrolü) tabloya yazamıyordu
-- ("permission denied for table ff_rate_limit_events"). Bu da rate-limit
-- gerektiren tüm uç noktaların (sipariş dahil) 500 dönmesine yol açıyordu.
--
-- RLS açık kalır; service_role zaten RLS'i bypass eder. Normal kullanıcılara
-- erişim verilmez (policy yok), önceki güvenlik modeli korunur.

grant select, insert, update, delete on public.ff_rate_limit_events to service_role;
grant usage, select on sequence public.ff_rate_limit_events_id_seq to service_role;

notify pgrst, 'reload schema';
