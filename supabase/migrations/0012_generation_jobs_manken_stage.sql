-- 0012_generation_jobs_manken_stage.sql
-- Allow manken jobs to use the same durable generation recovery table.

do $$
begin
  alter table public.ff_generation_jobs
    drop constraint if exists ff_generation_jobs_stage_check;

  alter table public.ff_generation_jobs
    add constraint ff_generation_jobs_stage_check
    check (stage in ('sketch', 'finish', 'mockup', 'manken'));
end $$;

notify pgrst, 'reload schema';
