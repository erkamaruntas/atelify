-- 0004_storage_bucket.sql
-- Persistent image archive for generated sketch / finish / mockup assets.
-- Bucket is public so archived design previews keep rendering from saved state
-- without refreshing signed URLs. For private galleries, change `public` to
-- false and serve short-lived signed URLs from server endpoints instead.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'ff-design-assets',
  'ff-design-assets',
  true,
  33554432,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant select on storage.objects to anon, authenticated;
grant select, insert, update, delete on storage.objects to service_role;

drop policy if exists "public read ff design assets" on storage.objects;
create policy "public read ff design assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'ff-design-assets');

drop policy if exists "service role manages ff design assets" on storage.objects;
create policy "service role manages ff design assets"
on storage.objects
for all
to service_role
using (bucket_id = 'ff-design-assets')
with check (bucket_id = 'ff-design-assets');

notify pgrst, 'reload schema';
