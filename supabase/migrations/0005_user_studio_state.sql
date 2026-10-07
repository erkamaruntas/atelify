-- 0005_user_studio_state.sql
-- Legacy per-user studio state stored as JSONB blobs (saved_designs, projects).
-- NOTE: New work should target ff_designs / ff_design_assets (0006). This table
-- is kept for backward compatibility while the application code transitions.

create table if not exists public.ff_user_studio_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  saved_designs jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ff_user_studio_state_saved_designs_is_array'
  ) then
    alter table public.ff_user_studio_state
      add constraint ff_user_studio_state_saved_designs_is_array
      check (jsonb_typeof(saved_designs) = 'array');
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'ff_user_studio_state_projects_is_array'
  ) then
    alter table public.ff_user_studio_state
      add constraint ff_user_studio_state_projects_is_array
      check (jsonb_typeof(projects) = 'array');
  end if;
end $$;

-- Drop legacy column that was migrated to ff_user_credits.
alter table public.ff_user_studio_state drop column if exists credit_wallet;

alter table public.ff_user_studio_state enable row level security;

create index if not exists ff_user_studio_state_updated_at_idx
  on public.ff_user_studio_state (updated_at desc);

drop policy if exists "Users can read own studio state" on public.ff_user_studio_state;
create policy "Users can read own studio state"
  on public.ff_user_studio_state for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own studio state" on public.ff_user_studio_state;
create policy "Users can insert own studio state"
  on public.ff_user_studio_state for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own studio state" on public.ff_user_studio_state;
create policy "Users can update own studio state"
  on public.ff_user_studio_state for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own studio state" on public.ff_user_studio_state;
create policy "Users can delete own studio state"
  on public.ff_user_studio_state for delete to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.ff_user_studio_state to authenticated, service_role;

notify pgrst, 'reload schema';
