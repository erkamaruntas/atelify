-- 0010_profile_contact_fields.sql
-- Store checkout-required contact and address details in public.profiles.

alter table public.profiles
  add column if not exists first_name   text not null default '',
  add column if not exists last_name    text not null default '',
  add column if not exists phone        text not null default '',
  add column if not exists address_line text not null default '',
  add column if not exists district     text not null default '',
  add column if not exists city         text not null default '',
  add column if not exists postal_code  text not null default '',
  add column if not exists country      text not null default 'Türkiye';

update public.profiles
   set first_name = split_part(display_name, ' ', 1),
       last_name = coalesce(nullif(regexp_replace(display_name, '^\S+\s*', ''), ''), '')
 where display_name <> ''
   and first_name = ''
   and last_name = '';

create or replace function private.ff_handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
  v_brand_name text;
  v_first_name text;
  v_last_name text;
begin
  v_display_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    ''
  );
  v_brand_name := coalesce(nullif(new.raw_user_meta_data ->> 'brand_name', ''), '');
  v_first_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(split_part(v_display_name, ' ', 1), ''),
    ''
  );
  v_last_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(regexp_replace(v_display_name, '^\S+\s*', ''), ''),
    ''
  );

  insert into public.profiles (
    user_id,
    email,
    display_name,
    brand_name,
    first_name,
    last_name,
    role,
    created_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    v_display_name,
    v_brand_name,
    v_first_name,
    v_last_name,
    'user'::public.profile_role,
    coalesce(new.created_at, now())
  )
  on conflict (user_id) do update
     set email = excluded.email
   where public.profiles.email is distinct from excluded.email;

  return new;
end;
$$;

grant update (
  display_name,
  brand_name,
  first_name,
  last_name,
  phone,
  address_line,
  district,
  city,
  postal_code,
  country
) on public.profiles to authenticated;

notify pgrst, 'reload schema';
