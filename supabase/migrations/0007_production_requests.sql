-- 0007_production_requests.sql
-- User-submitted physical production requests for a final design.
--
-- Workflow:
--   user creates request (status='pending')
--     → service role / admin moves through:
--       confirmed → in_production → shipped → completed
--   user can cancel while still pending.
--
-- Design linkage: design_ref is the client-side saved design id (text), and
-- design_snapshot is a JSONB capture of what the user actually requested at
-- submit time (image url, product, shape, mode, etc.). design_id (uuid) is
-- optional and reserved for the future when ff_designs is populated; not a
-- foreign key today to avoid blocking on the relational migration.

create table if not exists public.ff_production_requests (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  design_id       uuid,
  design_ref      text        not null default '',
  design_snapshot jsonb       not null default '{}'::jsonb,
  status          text        not null default 'pending',
  product         text        not null default '',
  product_shape   text        not null default '',
  metal           text        not null default '',
  size_key        text        not null default '',
  size_label      text        not null default '',
  quantity        integer     not null default 1,
  customer_note   text        not null default '',
  contact_info    jsonb       not null default '{}'::jsonb,
  internal_note   text        not null default '',
  metadata        jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Idempotent column adds for re-runs / upgrades.
alter table public.ff_production_requests
  add column if not exists design_ref      text  not null default '',
  add column if not exists design_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists size_label      text  not null default '';

-- If an earlier draft of this migration created design_id as NOT NULL with an
-- FK to ff_designs, relax it here so the feature isn't blocked by ff_designs
-- being unpopulated.
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name = 'ff_production_requests'
       and column_name = 'design_id'
       and is_nullable = 'NO'
  ) then
    alter table public.ff_production_requests alter column design_id drop not null;
  end if;
end $$;

alter table public.ff_production_requests
  drop constraint if exists ff_production_requests_design_id_fkey;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ff_production_requests_status_check') then
    alter table public.ff_production_requests
      add constraint ff_production_requests_status_check
      check (status in ('pending', 'confirmed', 'in_production', 'shipped', 'completed', 'cancelled'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_production_requests_quantity_positive') then
    alter table public.ff_production_requests
      add constraint ff_production_requests_quantity_positive
      check (quantity >= 1 and quantity <= 50);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_production_requests_contact_is_object') then
    alter table public.ff_production_requests
      add constraint ff_production_requests_contact_is_object check (jsonb_typeof(contact_info) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_production_requests_metadata_is_object') then
    alter table public.ff_production_requests
      add constraint ff_production_requests_metadata_is_object check (jsonb_typeof(metadata) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_production_requests_snapshot_is_object') then
    alter table public.ff_production_requests
      add constraint ff_production_requests_snapshot_is_object check (jsonb_typeof(design_snapshot) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_production_requests_customer_note_length') then
    alter table public.ff_production_requests
      add constraint ff_production_requests_customer_note_length check (length(customer_note) <= 2000);
  end if;
end $$;

create index if not exists ff_production_requests_user_idx
  on public.ff_production_requests (user_id, created_at desc);

create index if not exists ff_production_requests_status_idx
  on public.ff_production_requests (status, updated_at desc);

create index if not exists ff_production_requests_design_ref_idx
  on public.ff_production_requests (user_id, design_ref)
  where design_ref <> '';

drop trigger if exists ff_production_requests_touch_updated_at on public.ff_production_requests;
create trigger ff_production_requests_touch_updated_at
  before update on public.ff_production_requests
  for each row execute function public.ff_touch_updated_at();

alter table public.ff_production_requests enable row level security;

drop policy if exists "production requests select own"           on public.ff_production_requests;
drop policy if exists "production requests insert own"           on public.ff_production_requests;
drop policy if exists "production requests update while pending" on public.ff_production_requests;
drop policy if exists "production requests cancel own"           on public.ff_production_requests;

-- Read: only own rows.
create policy "production requests select own"
  on public.ff_production_requests for select to authenticated
  using ((select auth.uid()) = user_id);

-- Insert: only with own user_id, and only as status='pending'.
create policy "production requests insert own"
  on public.ff_production_requests for insert to authenticated
  with check (
    (select auth.uid()) = user_id and status = 'pending'
  );

-- Update: allowed only while still pending. User can edit their own order
-- details OR cancel (status='cancelled'); any forward transition must go
-- through service role.
create policy "production requests update while pending"
  on public.ff_production_requests for update to authenticated
  using (
    (select auth.uid()) = user_id and status = 'pending'
  )
  with check (
    (select auth.uid()) = user_id and status in ('pending', 'cancelled')
  );

-- No DELETE for end users; requests are records. Service role can delete.

grant usage on schema public to authenticated, service_role;
grant select, insert, update on public.ff_production_requests to authenticated;
grant select, insert, update, delete on public.ff_production_requests to service_role;

notify pgrst, 'reload schema';
