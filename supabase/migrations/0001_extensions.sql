-- 0001_extensions.sql
-- Required PostgreSQL extensions for ff Studio.
-- Run first; everything else depends on these.

create extension if not exists pgcrypto;

notify pgrst, 'reload schema';
