-- 0009_idempotency_keys.sql
-- 24-hour idempotency records for generation entrypoints.
--
-- Server-side generation services claim a client_job_id before spending
-- credits. Duplicate requests with the same key return the stored response or
-- a pending response instead of charging credits again.

create table if not exists public.idempotency_keys (
  key              text        primary key,
  user_id          uuid        not null references auth.users(id) on delete cascade,
  response_payload jsonb,
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default (now() + interval '24 hours')
);

alter table public.idempotency_keys
  add column if not exists user_id          uuid        references auth.users(id) on delete cascade,
  add column if not exists response_payload jsonb,
  add column if not exists created_at       timestamptz not null default now(),
  add column if not exists expires_at       timestamptz not null default (now() + interval '24 hours');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'idempotency_keys_key_format') then
    alter table public.idempotency_keys
      add constraint idempotency_keys_key_format
      check (key ~ '^[a-zA-Z0-9_.:-]{8,160}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'idempotency_keys_response_is_object') then
    alter table public.idempotency_keys
      add constraint idempotency_keys_response_is_object
      check (response_payload is null or jsonb_typeof(response_payload) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'idempotency_keys_expires_after_created') then
    alter table public.idempotency_keys
      add constraint idempotency_keys_expires_after_created
      check (expires_at > created_at);
  end if;
end $$;

create index if not exists idempotency_keys_user_idx
  on public.idempotency_keys (user_id, created_at desc);

create index if not exists idempotency_keys_expires_idx
  on public.idempotency_keys (expires_at);

alter table public.idempotency_keys enable row level security;

drop policy if exists "idempotency keys select own" on public.idempotency_keys;
create policy "idempotency keys select own"
  on public.idempotency_keys for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.idempotency_keys from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on public.idempotency_keys to service_role;

notify pgrst, 'reload schema';
