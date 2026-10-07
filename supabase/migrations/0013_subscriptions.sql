-- 0013_subscriptions.sql
-- Aylık abonelik (Go/Pro/Max) için server-otoriter kayıt + yenileme.
-- Ödeme sağlayıcısından (iyzico) bağımsız çekirdek: her başarılı tahsilat webhook'u
-- ff_apply_subscription_renewal'i çağırır; cüzdan plan kredisine RESETLENİR
-- (use-it-or-lose-it). Free plan abonelik DEĞİL, burada işlenmez.

-- Kullanıcı ↔ sağlayıcı aboneliği eşlemesi.
create table if not exists public.ff_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'iyzico',
  subscription_ref text not null,
  plan_key text not null,
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ff_subscriptions_provider_ref_uidx
  on public.ff_subscriptions (provider, subscription_ref);
create index if not exists ff_subscriptions_user_idx
  on public.ff_subscriptions (user_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ff_subscriptions_status_check') then
    alter table public.ff_subscriptions
      add constraint ff_subscriptions_status_check
      check (status in ('active','past_due','canceled','expired','pending'));
  end if;
end $$;

-- Webhook idempotency/denetim: aynı tahsilat olayı iki kez kredi yüklemesin.
create table if not exists public.ff_subscription_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'iyzico',
  event_id text not null,
  received_at timestamptz not null default now()
);

create unique index if not exists ff_subscription_events_uidx
  on public.ff_subscription_events (provider, event_id);

alter table public.ff_subscriptions enable row level security;
alter table public.ff_subscription_events enable row level security;

drop policy if exists "users read own subscriptions" on public.ff_subscriptions;
create policy "users read own subscriptions"
  on public.ff_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.ff_subscriptions from anon, authenticated;
revoke all on public.ff_subscription_events from anon, authenticated;
grant select on public.ff_subscriptions to authenticated;
grant select, insert, update on public.ff_subscriptions to service_role;
grant select, insert on public.ff_subscription_events to service_role;

-- Atomik yenileme: olayı dedupe et, aboneliği güncelle/oluştur, cüzdanı resetle.
-- Döner: true = uygulandı, false = olay zaten işlenmişti (no-op).
create or replace function public.ff_apply_subscription_renewal(
  p_provider text,
  p_event_id text,
  p_user_id uuid,
  p_subscription_ref text,
  p_plan_key text,
  p_amount integer,
  p_period_end timestamptz default null,
  p_label text default 'Abonelik yenileme'
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
  if p_event_id is null or p_event_id = '' then
    raise exception 'Olay kimliği gerekli.';
  end if;
  if p_subscription_ref is null or p_subscription_ref = '' then
    raise exception 'Abonelik referansı gerekli.';
  end if;
  if p_amount is null or p_amount < 0 then
    raise exception 'Geçersiz kredi miktarı.';
  end if;

  -- Idempotency: olay daha önce işlendiyse hiçbir şey yapma.
  insert into public.ff_subscription_events (provider, event_id)
  values (v_provider, p_event_id)
  on conflict (provider, event_id) do nothing;

  if not found then
    return false;
  end if;

  -- Abonelik kaydını oluştur/güncelle.
  insert into public.ff_subscriptions (user_id, provider, subscription_ref, plan_key, status, current_period_end)
  values (p_user_id, v_provider, p_subscription_ref, p_plan_key, 'active', p_period_end)
  on conflict (provider, subscription_ref) do update
    set user_id = excluded.user_id,
        plan_key = excluded.plan_key,
        status = 'active',
        current_period_end = excluded.current_period_end,
        updated_at = now();

  -- Cüzdanı plan kredisine RESETLE (mevcut RPC; mode 'set' = tam değere ayarla).
  perform public.ff_admin_grant_credits(p_user_id, p_amount, p_label, 'set', p_plan_key, false);

  return true;
end;
$$;

revoke all on function public.ff_apply_subscription_renewal(text, text, uuid, text, text, integer, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.ff_apply_subscription_renewal(text, text, uuid, text, text, integer, timestamptz, text)
  to service_role;
