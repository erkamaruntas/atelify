-- Rate limit olay log'u. Service role bypass'ı RLS'i etkisiz kılar; normal
-- kullanıcılar için policy tanımlanmadığı için doğrudan erişim yoktur.
create table if not exists public.ff_rate_limit_events (
  id bigserial primary key,
  user_id uuid not null,
  scope text not null,
  created_at timestamptz not null default now()
);

create index if not exists ff_rate_limit_events_user_scope_time_idx
  on public.ff_rate_limit_events (user_id, scope, created_at desc);

alter table public.ff_rate_limit_events enable row level security;

-- Eski olayları temizlemek için yardımcı fonksiyon. pg_cron varsa günlük
-- çalıştırılabilir; yoksa edge function veya admin scriptinden çağrılabilir.
create or replace function public.ff_purge_rate_limit_events()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.ff_rate_limit_events
   where created_at < now() - interval '24 hours';
  get diagnostics removed = row_count;
  return removed;
end;
$$;
