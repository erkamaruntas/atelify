-- 0002_credits.sql
-- Server-authoritative credit ledger.
-- All mutations execute via SUPABASE_SERVICE_ROLE_KEY through RPC functions below.
-- Users can only read their own wallet and transaction history.

create table if not exists public.ff_user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 15,
  plan_key text not null default 'temel',
  total_granted integer not null default 15,
  spent integer not null default 0,
  is_unlimited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ff_user_credits
  add column if not exists balance integer not null default 15,
  add column if not exists plan_key text not null default 'temel',
  add column if not exists total_granted integer not null default 15,
  add column if not exists spent integer not null default 0,
  add column if not exists is_unlimited boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.ff_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  balance_after integer,
  type text not null,
  stage text not null default '',
  job_id text not null default '',
  label text not null default '',
  created_at timestamptz not null default now()
);

alter table public.ff_credit_transactions
  add column if not exists amount integer not null default 0,
  add column if not exists balance_after integer,
  add column if not exists type text not null default 'adjust',
  add column if not exists stage text not null default '',
  add column if not exists job_id text not null default '',
  add column if not exists label text not null default '',
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ff_user_credits_balance_nonneg') then
    alter table public.ff_user_credits
      add constraint ff_user_credits_balance_nonneg check (balance >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_user_credits_spent_nonneg') then
    alter table public.ff_user_credits
      add constraint ff_user_credits_spent_nonneg check (spent >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_user_credits_total_granted_nonneg') then
    alter table public.ff_user_credits
      add constraint ff_user_credits_total_granted_nonneg check (total_granted >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_credit_transactions_type_check') then
    alter table public.ff_credit_transactions
      add constraint ff_credit_transactions_type_check
      check (type in ('grant','spend','refund','reset','adjust'));
  end if;
end $$;

create index if not exists ff_credit_transactions_user_idx
  on public.ff_credit_transactions (user_id, created_at desc);

create unique index if not exists ff_credit_transactions_spend_job_uidx
  on public.ff_credit_transactions (user_id, stage, job_id)
  where type = 'spend' and job_id <> '';

create unique index if not exists ff_credit_transactions_refund_job_uidx
  on public.ff_credit_transactions (user_id, stage, job_id)
  where type = 'refund' and job_id <> '';

alter table public.ff_user_credits enable row level security;
alter table public.ff_credit_transactions enable row level security;

drop policy if exists "users read own credits" on public.ff_user_credits;
create policy "users read own credits"
  on public.ff_user_credits for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own credit transactions" on public.ff_credit_transactions;
create policy "users read own credit transactions"
  on public.ff_credit_transactions for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.ff_user_credits from anon, authenticated;
revoke all on public.ff_credit_transactions from anon, authenticated;
grant usage on schema public to authenticated, service_role;
grant select on public.ff_user_credits to authenticated;
grant select on public.ff_credit_transactions to authenticated;
grant select, insert, update on public.ff_user_credits to service_role;
grant select, insert on public.ff_credit_transactions to service_role;

create or replace function public.ff_ensure_user_credits(p_user_id uuid)
returns public.ff_user_credits
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.ff_user_credits;
begin
  select * into v_row from public.ff_user_credits where user_id = p_user_id;

  if not found then
    insert into public.ff_user_credits (user_id) values (p_user_id)
    returning * into v_row;

    insert into public.ff_credit_transactions (user_id, amount, balance_after, type, stage, label)
    values (p_user_id, v_row.balance, v_row.balance, 'grant', 'signup', 'Açılış kredisi');
  end if;

  return v_row;
end;
$$;

create or replace function public.ff_spend_credits(
  p_user_id uuid,
  p_amount integer,
  p_stage text,
  p_label text,
  p_job_id text default ''
)
returns table (success boolean, balance integer, is_unlimited boolean, message text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.ff_user_credits;
  v_job_id text := coalesce(p_job_id, '');
  v_new_balance integer;
begin
  if p_amount is null or p_amount <= 0 then
    return query select false, 0, false, 'Geçersiz kredi miktarı.'::text;
    return;
  end if;

  perform public.ff_ensure_user_credits(p_user_id);
  select * into v_row from public.ff_user_credits where user_id = p_user_id for update;

  if v_job_id <> '' and exists (
    select 1
      from public.ff_credit_transactions
     where user_id = p_user_id
       and type = 'spend'
       and stage = coalesce(p_stage, '')
       and job_id = v_job_id
  ) then
    return query select true,
      case when v_row.is_unlimited then null else v_row.balance end,
      v_row.is_unlimited,
      ''::text;
    return;
  end if;

  if v_row.is_unlimited then
    insert into public.ff_credit_transactions (user_id, amount, balance_after, type, stage, label, job_id)
    values (p_user_id, p_amount, null, 'spend', coalesce(p_stage,''), coalesce(p_label,''), v_job_id);

    return query select true, null::integer, true, ''::text;
    return;
  end if;

  if v_row.balance < p_amount then
    return query select false, v_row.balance, false, 'Yetersiz kredi.'::text;
    return;
  end if;

  v_new_balance := v_row.balance - p_amount;

  update public.ff_user_credits
     set balance = v_new_balance,
         spent = spent + p_amount,
         updated_at = now()
   where user_id = p_user_id;

  insert into public.ff_credit_transactions (user_id, amount, balance_after, type, stage, label, job_id)
  values (p_user_id, p_amount, v_new_balance, 'spend', coalesce(p_stage,''), coalesce(p_label,''), v_job_id);

  return query select true, v_new_balance, false, ''::text;
end;
$$;

create or replace function public.ff_refund_credits(
  p_user_id uuid,
  p_amount integer,
  p_stage text,
  p_label text,
  p_job_id text default ''
)
returns table (balance integer, is_unlimited boolean)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.ff_user_credits;
  v_job_id text := coalesce(p_job_id, '');
  v_new_balance integer;
begin
  perform public.ff_ensure_user_credits(p_user_id);
  select * into v_row from public.ff_user_credits where user_id = p_user_id for update;

  if p_amount is null or p_amount <= 0 then
    return query select case when v_row.is_unlimited then null else v_row.balance end, v_row.is_unlimited;
    return;
  end if;

  if v_job_id <> '' and exists (
    select 1
      from public.ff_credit_transactions
     where user_id = p_user_id
       and type = 'refund'
       and stage = coalesce(p_stage, '')
       and job_id = v_job_id
  ) then
    return query select case when v_row.is_unlimited then null else v_row.balance end, v_row.is_unlimited;
    return;
  end if;

  if v_row.is_unlimited then
    insert into public.ff_credit_transactions (user_id, amount, balance_after, type, stage, label, job_id)
    values (p_user_id, p_amount, null, 'refund', coalesce(p_stage,''), coalesce(p_label,''), v_job_id);

    return query select null::integer, true;
    return;
  end if;

  v_new_balance := v_row.balance + p_amount;

  update public.ff_user_credits
     set balance = v_new_balance,
         spent = greatest(0, spent - p_amount),
         updated_at = now()
   where user_id = p_user_id;

  insert into public.ff_credit_transactions (user_id, amount, balance_after, type, stage, label, job_id)
  values (p_user_id, p_amount, v_new_balance, 'refund', coalesce(p_stage,''), coalesce(p_label,''), v_job_id);

  return query select v_new_balance, false;
end;
$$;

drop function if exists public.ff_admin_grant_credits(uuid, integer, text, text, boolean);
drop function if exists public.ff_admin_grant_credits(uuid, integer, text, text, text, boolean);

create function public.ff_admin_grant_credits(
  p_user_id uuid,
  p_amount integer,
  p_label text default 'Manuel yükleme',
  p_mode text default 'add',
  p_set_plan_key text default null,
  p_set_unlimited boolean default null
)
returns public.ff_user_credits
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.ff_user_credits;
  v_mode text := case when lower(coalesce(p_mode, 'add')) = 'set' then 'set' else 'add' end;
  v_new_balance integer;
  v_grant_delta integer;
begin
  if p_amount is null or p_amount < 0 then
    raise exception 'Geçersiz kredi miktarı.';
  end if;

  perform public.ff_ensure_user_credits(p_user_id);
  select * into v_row from public.ff_user_credits where user_id = p_user_id for update;

  if v_mode = 'set' then
    v_new_balance := p_amount;
    v_grant_delta := greatest(0, v_new_balance - v_row.balance);
  else
    v_new_balance := v_row.balance + p_amount;
    v_grant_delta := p_amount;
  end if;

  update public.ff_user_credits
     set balance = v_new_balance,
         total_granted = total_granted + v_grant_delta,
         plan_key = coalesce(nullif(p_set_plan_key, ''), plan_key),
         is_unlimited = coalesce(p_set_unlimited, is_unlimited),
         updated_at = now()
   where user_id = p_user_id
   returning * into v_row;

  insert into public.ff_credit_transactions (user_id, amount, balance_after, type, stage, label)
  values (
    p_user_id,
    p_amount,
    case when v_row.is_unlimited then null else v_new_balance end,
    case when v_mode = 'set' then 'reset' else 'grant' end,
    'admin',
    coalesce(nullif(p_label, ''), 'Manuel yükleme')
  );

  return v_row;
end;
$$;

revoke all on function public.ff_spend_credits(uuid, integer, text, text, text) from public, anon, authenticated;
revoke all on function public.ff_refund_credits(uuid, integer, text, text, text) from public, anon, authenticated;
revoke all on function public.ff_admin_grant_credits(uuid, integer, text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.ff_ensure_user_credits(uuid) from public, anon, authenticated;

grant execute on function public.ff_spend_credits(uuid, integer, text, text, text) to service_role;
grant execute on function public.ff_refund_credits(uuid, integer, text, text, text) to service_role;
grant execute on function public.ff_admin_grant_credits(uuid, integer, text, text, text, boolean) to service_role;
grant execute on function public.ff_ensure_user_credits(uuid) to service_role;

notify pgrst, 'reload schema';
