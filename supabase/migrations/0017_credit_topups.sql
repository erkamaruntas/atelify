-- 0017_credit_topups.sql
-- Aboneliğe EK manuel kredi yükleme (top-up). Abonelik kredisi aylık RESETLENİR
-- (ff_user_credits.balance), o yüzden satın alınan top-up kredileri AYRI bir kovada
-- (ff_credit_topups), her batch 90 GÜN geçerli. Harcamada önce abonelik bakiyesi,
-- bitince en yakın expire olacak top-up batch'inden (FIFO) düşülür.
-- Yalnızca aktif aboneler satın alabilir (server tarafında kontrol edilir).

-- Satın alınan top-up batch'leri. Her satır bir ödeme = bir kredi partisi.
create table if not exists public.ff_credit_topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_total integer not null check (amount_total > 0),
  amount_remaining integer not null check (amount_remaining >= 0),
  expires_at timestamptz not null,
  provider text not null default 'iyzico',
  order_ref text not null,
  label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotency: aynı ödeme (provider+token) iki kez kredi yazmasın.
create unique index if not exists ff_credit_topups_provider_ref_uidx
  on public.ff_credit_topups (provider, order_ref);
-- Harcama/okuma için aktif batch taraması (expiry sırası).
create index if not exists ff_credit_topups_user_active_idx
  on public.ff_credit_topups (user_id, expires_at)
  where amount_remaining > 0;

-- Ödeme başlatıldığında token→(user,pack) eşlemesi; callback'te oturum yok.
create table if not exists public.ff_topup_intents (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  pack_key text not null,
  credits integer not null,
  price_try integer not null,
  created_at timestamptz not null default now()
);

alter table public.ff_credit_topups enable row level security;
alter table public.ff_topup_intents enable row level security;

drop policy if exists "users read own topups" on public.ff_credit_topups;
create policy "users read own topups"
  on public.ff_credit_topups for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.ff_credit_topups from anon, authenticated;
revoke all on public.ff_topup_intents from anon, authenticated;
grant select on public.ff_credit_topups to authenticated;
grant select, insert, update on public.ff_credit_topups to service_role;
grant select, insert, delete on public.ff_topup_intents to service_role;

-- Başarılı ödeme sonrası top-up batch'i ekler. order_ref (iyzico token) ile idempotent.
-- Döner: true = eklendi, false = bu ödeme zaten işlenmişti (no-op).
create or replace function public.ff_add_credit_topup(
  p_user_id uuid,
  p_amount integer,
  p_expires_at timestamptz,
  p_provider text,
  p_order_ref text,
  p_label text default 'Ek kredi paketi'
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_provider text := coalesce(nullif(p_provider, ''), 'iyzico');
begin
  if p_user_id is null then
    raise exception 'Kullanıcı kimliği gerekli.';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Geçersiz kredi miktarı.';
  end if;
  if p_order_ref is null or p_order_ref = '' then
    raise exception 'Sipariş referansı gerekli.';
  end if;
  if p_expires_at is null then
    raise exception 'Geçerlilik tarihi gerekli.';
  end if;

  perform public.ff_ensure_user_credits(p_user_id);

  insert into public.ff_credit_topups (user_id, amount_total, amount_remaining, expires_at, provider, order_ref, label)
  values (p_user_id, p_amount, p_amount, p_expires_at, v_provider, p_order_ref, coalesce(nullif(p_label,''), 'Ek kredi paketi'))
  on conflict (provider, order_ref) do nothing;

  if not found then
    return false;
  end if;

  -- Denetim/ledger kaydı. balance_after top-up'ta anlamsız (ayrı kova) → null.
  insert into public.ff_credit_transactions (user_id, amount, balance_after, type, stage, label)
  values (p_user_id, p_amount, null, 'grant', 'topup', coalesce(nullif(p_label,''), 'Ek kredi paketi'));

  return true;
end;
$$;

-- ff_spend_credits'i top-up farkında hale getir: önce abonelik bakiyesi, bitince
-- geçerli (expire olmamış) top-up batch'lerinden en yakın expire'a göre (FIFO) düş.
-- ÖNEMLİ: top-up yoksa davranış eski sürümle BİREBİR aynıdır.
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
  v_topup_available integer;
  v_total integer;
  v_from_sub integer;
  v_from_topup integer;
  v_remaining integer;
  v_batch record;
  v_new_sub_balance integer;
  v_balance_after integer;
begin
  if p_amount is null or p_amount <= 0 then
    return query select false, 0, false, 'Geçersiz kredi miktarı.'::text;
    return;
  end if;

  perform public.ff_ensure_user_credits(p_user_id);
  -- Kullanıcı satırını kilitle: bu, aynı kullanıcının eşzamanlı harcamalarını
  -- (ve top-up batch'lerini) serileştirir; batch toplamı yarışsız okunur.
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

  select coalesce(sum(amount_remaining), 0) into v_topup_available
    from public.ff_credit_topups
   where user_id = p_user_id
     and amount_remaining > 0
     and expires_at > now();

  v_total := v_row.balance + v_topup_available;
  if v_total < p_amount then
    return query select false, v_total, false, 'Yetersiz kredi.'::text;
    return;
  end if;

  -- Önce abonelik bakiyesinden.
  v_from_sub := least(v_row.balance, p_amount);
  v_from_topup := p_amount - v_from_sub;
  v_new_sub_balance := v_row.balance - v_from_sub;

  update public.ff_user_credits
     set balance = v_new_sub_balance,
         spent = spent + p_amount,
         updated_at = now()
   where user_id = p_user_id;

  -- Kalanı top-up batch'lerinden expiry-FIFO ile düş.
  if v_from_topup > 0 then
    v_remaining := v_from_topup;
    for v_batch in
      select id, amount_remaining
        from public.ff_credit_topups
       where user_id = p_user_id
         and amount_remaining > 0
         and expires_at > now()
       order by expires_at asc, created_at asc
       for update
    loop
      exit when v_remaining <= 0;
      if v_batch.amount_remaining <= v_remaining then
        update public.ff_credit_topups
           set amount_remaining = 0, updated_at = now()
         where id = v_batch.id;
        v_remaining := v_remaining - v_batch.amount_remaining;
      else
        update public.ff_credit_topups
           set amount_remaining = amount_remaining - v_remaining, updated_at = now()
         where id = v_batch.id;
        v_remaining := 0;
      end if;
    end loop;
  end if;

  v_balance_after := v_new_sub_balance + (v_topup_available - v_from_topup);

  insert into public.ff_credit_transactions (user_id, amount, balance_after, type, stage, label, job_id)
  values (p_user_id, p_amount, v_balance_after, 'spend', coalesce(p_stage,''), coalesce(p_label,''), v_job_id);

  return query select true, v_balance_after, false, ''::text;
end;
$$;

revoke all on function public.ff_add_credit_topup(uuid, integer, timestamptz, text, text, text) from public, anon, authenticated;
grant execute on function public.ff_add_credit_topup(uuid, integer, timestamptz, text, text, text) to service_role;

-- ff_spend_credits imzası değişmedi; create or replace grant'ları korur, yine de garanti:
revoke all on function public.ff_spend_credits(uuid, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.ff_spend_credits(uuid, integer, text, text, text) to service_role;

notify pgrst, 'reload schema';
