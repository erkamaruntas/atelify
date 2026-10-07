-- 0019_designs_manken_stage.sql
-- Manken (4. aşama) çıktıları kalıcı tasarım arşivine yazılamıyordu: ff_designs
-- stage kısıtı yalnızca sketch/finish/mockup kabul ediyordu (0006). 0012 aynı
-- düzeltmeyi yalnızca ff_generation_jobs için yapmıştı.

do $$
begin
  alter table public.ff_designs
    drop constraint if exists ff_designs_stage_check;

  alter table public.ff_designs
    add constraint ff_designs_stage_check
    check (stage in ('sketch', 'finish', 'mockup', 'manken'));
end $$;

-- Aynı üretim işinin iki kez arşivlenip arşivlenmediğini hızlı kontrol etmek için.
create index if not exists ff_designs_user_client_job_idx
  on public.ff_designs (user_id, client_job_id)
  where client_job_id is not null;

notify pgrst, 'reload schema';
