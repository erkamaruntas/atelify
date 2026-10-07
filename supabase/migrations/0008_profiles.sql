-- 0008_profiles.sql
-- User profile records and role metadata.
--
-- Profiles are created automatically from auth.users. Regular users can read
-- and update only their own profile fields; users with role='admin' can read
-- all profiles.

create schema if not exists private;
revoke all on schema private from public;

do $$
begin
  if not exists (
    select 1
      from pg_type t
      join pg_namespace n on n.oid = t.typnamespace
     where n.nspname = 'public'
       and t.typname = 'profile_role'
  ) then
    create type public.profile_role as enum ('user', 'admin');
  end if;
end $$;

alter type public.profile_role add value if not exists 'user';
alter type public.profile_role add value if not exists 'admin';

create table if not exists public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text not null default '',
  display_name text not null default '',
  brand_name   text not null default '',
  role         public.profile_role not null default 'user',
  created_at   timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email        text not null default '',
  add column if not exists display_name text not null default '',
  add column if not exists brand_name   text not null default '',
  add column if not exists role         public.profile_role not null default 'user',
  add column if not exists created_at   timestamptz not null default now();

create index if not exists profiles_role_idx
  on public.profiles (role)
  where role = 'admin';

create or replace function private.ff_current_user_is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
      from public.profiles
     where user_id = (select auth.uid())
       and role = 'admin'::public.profile_role
  );
$$;

create or replace function private.ff_handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
  v_brand_name text;
begin
  v_display_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    ''
  );
  v_brand_name := coalesce(nullif(new.raw_user_meta_data ->> 'brand_name', ''), '');

  insert into public.profiles (user_id, email, display_name, brand_name, role, created_at)
  values (
    new.id,
    coalesce(new.email, ''),
    v_display_name,
    v_brand_name,
    'user'::public.profile_role,
    coalesce(new.created_at, now())
  )
  on conflict (user_id) do update
     set email = excluded.email
   where public.profiles.email is distinct from excluded.email;

  return new;
end;
$$;

drop trigger if exists ff_profiles_after_auth_user_insert on auth.users;
create trigger ff_profiles_after_auth_user_insert
  after insert on auth.users
  for each row execute function private.ff_handle_new_auth_user_profile();

insert into public.profiles (user_id, email, display_name, brand_name, role, created_at)
select
  users.id,
  coalesce(users.email, ''),
  coalesce(
    nullif(users.raw_user_meta_data ->> 'display_name', ''),
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    nullif(users.raw_user_meta_data ->> 'name', ''),
    ''
  ),
  coalesce(nullif(users.raw_user_meta_data ->> 'brand_name', ''), ''),
  'user'::public.profile_role,
  coalesce(users.created_at, now())
from auth.users as users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;

drop policy if exists "profiles select own or admin" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;

create policy "profiles select own or admin"
  on public.profiles for select to authenticated
  using (
    (select auth.uid()) = user_id
    or private.ff_current_user_is_admin()
  );

create policy "profiles update own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.profiles from anon, authenticated;
grant usage on schema public to authenticated, service_role;
grant usage on schema private to authenticated, service_role;
grant select on public.profiles to authenticated;
grant update (display_name, brand_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;
revoke all on function private.ff_current_user_is_admin() from public;
revoke all on function private.ff_handle_new_auth_user_profile() from public;
grant execute on function private.ff_current_user_is_admin() to authenticated, service_role;
grant execute on function private.ff_handle_new_auth_user_profile() to service_role;

notify pgrst, 'reload schema';
