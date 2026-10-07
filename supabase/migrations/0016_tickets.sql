-- 0016_tickets.sql
-- In-app destek (ticket) sistemi. Mail servisi/domain henüz yok; "gelen kutusu"
-- admin (Sahip) panelidir. Akış:
--   user ticket açar (status='open', son mesaj sahibi 'user')
--     → admin Sahip Paneli'nden okur ve cevaplar (status='answered', 'admin')
--     → user cevabı kendi listesinde görür, yeni mesaj yazabilir ('open','user')
--     → taraflardan biri kapatır (status='closed').
--
-- Tüm veri erişimi servis rolüyle (API katmanı) yapılır; RLS yalnızca derinlemesine
-- savunma içindir (ff_production_requests ile aynı yaklaşım). İleride mail gelince
-- bildirim bu çekirdeğin üstüne eklenir, şema değişmez.

create table if not exists public.ff_tickets (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  subject     text        not null default '',
  status      text        not null default 'open',
  last_sender text        not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.ff_ticket_messages (
  id         uuid        primary key default gen_random_uuid(),
  ticket_id  uuid        not null references public.ff_tickets(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  sender     text        not null default 'user',
  body       text        not null default '',
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ff_tickets_status_check') then
    alter table public.ff_tickets
      add constraint ff_tickets_status_check
      check (status in ('open', 'answered', 'closed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_tickets_last_sender_check') then
    alter table public.ff_tickets
      add constraint ff_tickets_last_sender_check
      check (last_sender in ('user', 'admin'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_tickets_subject_length') then
    alter table public.ff_tickets
      add constraint ff_tickets_subject_length check (length(subject) <= 200);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_ticket_messages_sender_check') then
    alter table public.ff_ticket_messages
      add constraint ff_ticket_messages_sender_check check (sender in ('user', 'admin'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ff_ticket_messages_body_length') then
    alter table public.ff_ticket_messages
      add constraint ff_ticket_messages_body_length check (length(body) >= 1 and length(body) <= 4000);
  end if;
end $$;

create index if not exists ff_tickets_user_idx
  on public.ff_tickets (user_id, updated_at desc);

create index if not exists ff_tickets_status_idx
  on public.ff_tickets (status, updated_at desc);

create index if not exists ff_ticket_messages_ticket_idx
  on public.ff_ticket_messages (ticket_id, created_at asc);

drop trigger if exists ff_tickets_touch_updated_at on public.ff_tickets;
create trigger ff_tickets_touch_updated_at
  before update on public.ff_tickets
  for each row execute function public.ff_touch_updated_at();

alter table public.ff_tickets         enable row level security;
alter table public.ff_ticket_messages enable row level security;

drop policy if exists "tickets select own"          on public.ff_tickets;
drop policy if exists "tickets insert own"          on public.ff_tickets;
drop policy if exists "ticket messages select own"  on public.ff_ticket_messages;
drop policy if exists "ticket messages insert own"  on public.ff_ticket_messages;

-- Read: only own tickets.
create policy "tickets select own"
  on public.ff_tickets for select to authenticated
  using ((select auth.uid()) = user_id);

-- Insert: only with own user_id and as status='open'.
create policy "tickets insert own"
  on public.ff_tickets for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'open');

-- Messages: read/write only within own tickets, and only as sender='user'.
create policy "ticket messages select own"
  on public.ff_ticket_messages for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "ticket messages insert own"
  on public.ff_ticket_messages for insert to authenticated
  with check ((select auth.uid()) = user_id and sender = 'user');

-- Status transitions and admin replies go through the service role.

grant usage on schema public to authenticated, service_role;
grant select, insert on public.ff_tickets               to authenticated;
grant select, insert on public.ff_ticket_messages       to authenticated;
grant select, insert, update, delete on public.ff_tickets         to service_role;
grant select, insert, update, delete on public.ff_ticket_messages to service_role;

notify pgrst, 'reload schema';
