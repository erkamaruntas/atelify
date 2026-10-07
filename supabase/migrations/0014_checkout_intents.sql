-- 0014_checkout_intents.sql
-- iyzico Checkout Form'da conversationId, ödeme sonrası retrieve sonucunda her zaman
-- güvenilir geri dönmüyor (bad_conversation). Bu yüzden init anında iyzico token'ı ile
-- (userId, planKey) eşlemesini SERVER tarafında saklıyoruz; callback bu token ile
-- kullanıcıyı/planı kesin çözer. conversationId yalnızca yedek.

create table if not exists public.ff_checkout_intents (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists ff_checkout_intents_user_idx
  on public.ff_checkout_intents (user_id);

alter table public.ff_checkout_intents enable row level security;

-- Yalnızca service_role erişir (kullanıcıya açık değil).
revoke all on public.ff_checkout_intents from anon, authenticated;
grant select, insert, delete on public.ff_checkout_intents to service_role;
