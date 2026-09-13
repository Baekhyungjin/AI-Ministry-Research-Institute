alter table public.replay_accesses
  add column if not exists depositor_name text not null default '',
  add column if not exists support_amount integer not null default 10000,
  add column if not exists payment_status text not null default 'pending';

update public.replay_accesses set depositor_name = name where depositor_name = '';

alter table public.replay_accesses
  drop constraint if exists replay_accesses_support_amount_check,
  add constraint replay_accesses_support_amount_check check (support_amount >= 10000),
  drop constraint if exists replay_accesses_payment_status_check,
  add constraint replay_accesses_payment_status_check check (payment_status in ('pending','confirmed','cancelled'));

drop index if exists public.replay_accesses_unique_email;
create index if not exists replay_accesses_payment_index on public.replay_accesses (payment_status, created_at desc);

grant update on public.replay_accesses to authenticated;

drop policy if exists "public submits replay access" on public.replay_accesses;
create policy "public submits replay access" on public.replay_accesses
for insert to anon, authenticated
with check (
  consent = true and support_amount >= 10000 and payment_status = 'pending'
  and length(trim(depositor_name)) > 0
);

drop policy if exists "admins update replay accesses" on public.replay_accesses;
create policy "admins update replay accesses" on public.replay_accesses
for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
