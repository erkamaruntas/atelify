-- 0006_designs.sql
-- Relational replacement for ff_user_studio_state.saved_designs / projects JSONB blobs.
-- ff_designs       = one row per design (sketch / finish / mockup stage output).
-- ff_design_assets = images attached to a design (input refs, generated outputs, previews).
--
-- Users own and fully manage their own rows. Service role can also write (for
-- server-side flows that persist generation results directly).

create table if not exists public.ff_designs (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  project_id       uuid,
  title            text        not null default '',
  product          text        not null default 'yuzuk',
  product_shape    text        not null default 'yuvarlak',
  design_mode      text        not null default 'engrave',
  stage            text        not null default 'sketch',
  source_design_id uuid        references public.ff_designs(id) on delete set null,
  client_job_id    text,
  options          jsonb       not null default '{}'::jsonb,
  metadata         jsonb       not null default '{}'::jsonb,
  archived_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ff_designs_product_check') then
    alter table public.ff_designs
      add constraint ff_designs_product_check check (product in ('yuzuk', 'kolye'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_designs_product_shape_check') then
    alter table public.ff_designs
      add constraint ff_designs_product_shape_check
      check (product_shape in ('dikdortgen', 'kare', 'oval', 'yuvarlak'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_designs_design_mode_check') then
    alter table public.ff_designs
      add constraint ff_designs_design_mode_check check (design_mode in ('engrave', 'emboss'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_designs_stage_check') then
    alter table public.ff_designs
      add constraint ff_designs_stage_check check (stage in ('sketch', 'finish', 'mockup'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_designs_options_is_object') then
    alter table public.ff_designs
      add constraint ff_designs_options_is_object check (jsonb_typeof(options) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_designs_metadata_is_object') then
    alter table public.ff_designs
      add constraint ff_designs_metadata_is_object check (jsonb_typeof(metadata) = 'object');
  end if;
end $$;

create index if not exists ff_designs_user_recent_idx
  on public.ff_designs (user_id, updated_at desc)
  where archived_at is null;

create index if not exists ff_designs_user_stage_idx
  on public.ff_designs (user_id, stage, updated_at desc);

create index if not exists ff_designs_project_idx
  on public.ff_designs (user_id, project_id)
  where project_id is not null;

create index if not exists ff_designs_source_idx
  on public.ff_designs (source_design_id)
  where source_design_id is not null;

create index if not exists ff_designs_client_job_idx
  on public.ff_designs (client_job_id)
  where client_job_id is not null;

create table if not exists public.ff_design_assets (
  id              uuid        primary key default gen_random_uuid(),
  design_id       uuid        not null references public.ff_designs(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  kind            text        not null default 'output',
  storage_bucket  text        not null default 'ff-design-assets',
  storage_path    text        not null,
  public_url      text        not null default '',
  content_type    text        not null default 'image/png',
  width           integer,
  height          integer,
  position        integer     not null default 0,
  metadata        jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ff_design_assets_kind_check') then
    alter table public.ff_design_assets
      add constraint ff_design_assets_kind_check
      check (kind in ('input', 'output', 'preview', 'composite'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_design_assets_storage_path_nonempty') then
    alter table public.ff_design_assets
      add constraint ff_design_assets_storage_path_nonempty check (length(storage_path) > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_design_assets_metadata_is_object') then
    alter table public.ff_design_assets
      add constraint ff_design_assets_metadata_is_object check (jsonb_typeof(metadata) = 'object');
  end if;
end $$;

create index if not exists ff_design_assets_design_idx
  on public.ff_design_assets (design_id, position);

create index if not exists ff_design_assets_user_idx
  on public.ff_design_assets (user_id, created_at desc);

create unique index if not exists ff_design_assets_storage_uidx
  on public.ff_design_assets (storage_bucket, storage_path);

-- updated_at trigger for ff_designs
create or replace function public.ff_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ff_designs_touch_updated_at on public.ff_designs;
create trigger ff_designs_touch_updated_at
  before update on public.ff_designs
  for each row execute function public.ff_touch_updated_at();

-- Row level security: full ownership model.
alter table public.ff_designs enable row level security;
alter table public.ff_design_assets enable row level security;

drop policy if exists "designs select own"  on public.ff_designs;
drop policy if exists "designs insert own"  on public.ff_designs;
drop policy if exists "designs update own"  on public.ff_designs;
drop policy if exists "designs delete own"  on public.ff_designs;

create policy "designs select own"
  on public.ff_designs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "designs insert own"
  on public.ff_designs for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "designs update own"
  on public.ff_designs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "designs delete own"
  on public.ff_designs for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "design assets select own"  on public.ff_design_assets;
drop policy if exists "design assets insert own"  on public.ff_design_assets;
drop policy if exists "design assets update own"  on public.ff_design_assets;
drop policy if exists "design assets delete own"  on public.ff_design_assets;

create policy "design assets select own"
  on public.ff_design_assets for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "design assets insert own"
  on public.ff_design_assets for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.ff_designs d
       where d.id = design_id and d.user_id = (select auth.uid())
    )
  );

create policy "design assets update own"
  on public.ff_design_assets for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "design assets delete own"
  on public.ff_design_assets for delete to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.ff_designs       to authenticated, service_role;
grant select, insert, update, delete on public.ff_design_assets to authenticated, service_role;

notify pgrst, 'reload schema';
