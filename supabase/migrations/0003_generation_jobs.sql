-- 0003_generation_jobs.sql
-- Generation job persistence for fal.ai async jobs.
-- Single canonical definition; replaces duplicate from earlier user-studio-state setup.
-- All mutations execute via SUPABASE_SERVICE_ROLE_KEY; users can only read their own.

create table if not exists public.ff_generation_jobs (
  client_job_id  text        primary key,
  user_id        uuid        references auth.users(id) on delete cascade,
  stage          text        not null default '',
  status         text        not null default 'submitting',
  count          integer     not null default 1,
  credit_cost    integer     not null default 0,
  request_id     text        not null default '',
  error          text        not null default '',
  label          text        not null default '',
  project_id     text        not null default '',
  project_title  text        not null default '',
  metadata       jsonb       not null default '{}'::jsonb,
  result         jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  delivered_at   timestamptz
);

alter table public.ff_generation_jobs
  add column if not exists user_id       uuid        references auth.users(id) on delete cascade,
  add column if not exists stage         text        not null default '',
  add column if not exists status        text        not null default 'submitting',
  add column if not exists count         integer     not null default 1,
  add column if not exists credit_cost   integer     not null default 0,
  add column if not exists request_id    text        not null default '',
  add column if not exists error         text        not null default '',
  add column if not exists label         text        not null default '',
  add column if not exists project_id    text        not null default '',
  add column if not exists project_title text        not null default '',
  add column if not exists metadata      jsonb       not null default '{}'::jsonb,
  add column if not exists result        jsonb,
  add column if not exists created_at    timestamptz not null default now(),
  add column if not exists updated_at    timestamptz not null default now(),
  add column if not exists delivered_at  timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ff_generation_jobs_stage_check') then
    alter table public.ff_generation_jobs
      add constraint ff_generation_jobs_stage_check check (stage in ('sketch', 'finish', 'mockup'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_generation_jobs_status_check') then
    alter table public.ff_generation_jobs
      add constraint ff_generation_jobs_status_check
      check (status in ('submitting', 'queued', 'running', 'completed', 'failed', 'cancelled'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_generation_jobs_count_check') then
    alter table public.ff_generation_jobs
      add constraint ff_generation_jobs_count_check check (count in (1, 4));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_generation_jobs_credit_cost_nonneg') then
    alter table public.ff_generation_jobs
      add constraint ff_generation_jobs_credit_cost_nonneg check (credit_cost >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_generation_jobs_metadata_is_object') then
    alter table public.ff_generation_jobs
      add constraint ff_generation_jobs_metadata_is_object check (jsonb_typeof(metadata) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_generation_jobs_result_is_object') then
    alter table public.ff_generation_jobs
      add constraint ff_generation_jobs_result_is_object check (result is null or jsonb_typeof(result) = 'object');
  end if;
end $$;

create index if not exists ff_generation_jobs_recovery_idx
  on public.ff_generation_jobs (user_id, updated_at desc)
  where delivered_at is null;

create index if not exists ff_generation_jobs_delivered_idx
  on public.ff_generation_jobs (user_id, delivered_at)
  where delivered_at is not null;

create index if not exists ff_generation_jobs_request_id_idx
  on public.ff_generation_jobs (request_id)
  where request_id <> '';

create index if not exists ff_generation_jobs_user_status_idx
  on public.ff_generation_jobs (user_id, status, updated_at desc);

alter table public.ff_generation_jobs enable row level security;

drop policy if exists "users read own generation jobs" on public.ff_generation_jobs;
drop policy if exists "Users can read own generation jobs" on public.ff_generation_jobs;
create policy "users read own generation jobs"
  on public.ff_generation_jobs for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.ff_generation_jobs from anon, authenticated;
grant usage on schema public to authenticated, service_role;
grant select on public.ff_generation_jobs to authenticated;
grant select, insert, update on public.ff_generation_jobs to service_role;

notify pgrst, 'reload schema';
