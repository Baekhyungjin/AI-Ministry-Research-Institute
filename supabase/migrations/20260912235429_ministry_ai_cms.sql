-- 목회AI연구소 홈페이지: 콘텐츠, 일정, 신청, 이미지 저장소

create table if not exists public.contents (
  id text primary key,
  kind text not null check (kind in ('column', 'notice')),
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  category text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  image_url text,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id text primary key,
  title text not null,
  category text not null default '',
  date date not null,
  time text not null default '',
  location text not null default '',
  capacity integer not null default 0 check (capacity >= 0),
  status text not null default 'open' check (status in ('open', 'closed')),
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id text primary key,
  kind text not null check (kind in ('inquiry', 'lecture', 'schedule')),
  name text not null,
  church text not null default '',
  role text not null default '',
  phone text not null,
  email text not null,
  message text not null default '',
  schedule_id text references public.schedules(id) on delete set null,
  schedule_title text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'closed')),
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);

create index if not exists contents_public_index on public.contents (kind, status, published_at desc);
create index if not exists schedules_date_index on public.schedules (status, date);
create index if not exists applications_created_index on public.applications (created_at desc);

alter table public.contents enable row level security;
alter table public.schedules enable row level security;
alter table public.applications enable row level security;

revoke all on public.contents, public.schedules, public.applications from anon, authenticated;
grant select on public.contents, public.schedules to anon, authenticated;
grant insert on public.applications to anon, authenticated;
grant insert, update, delete on public.contents, public.schedules to authenticated;
grant select, update, delete on public.applications to authenticated;

drop policy if exists "public reads published contents" on public.contents;
create policy "public reads published contents"
on public.contents for select to anon, authenticated
using (
  status = 'published'
  or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admins insert contents" on public.contents;
create policy "admins insert contents"
on public.contents for insert to authenticated
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins update contents" on public.contents;
create policy "admins update contents"
on public.contents for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins delete contents" on public.contents;
create policy "admins delete contents"
on public.contents for delete to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "public reads schedules" on public.schedules;
create policy "public reads schedules"
on public.schedules for select to anon, authenticated
using (true);

drop policy if exists "admins insert schedules" on public.schedules;
create policy "admins insert schedules"
on public.schedules for insert to authenticated
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins update schedules" on public.schedules;
create policy "admins update schedules"
on public.schedules for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins delete schedules" on public.schedules;
create policy "admins delete schedules"
on public.schedules for delete to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "public submits applications" on public.applications;
create policy "public submits applications"
on public.applications for insert to anon, authenticated
with check (status = 'new' and consent = true);

drop policy if exists "admins read applications" on public.applications;
create policy "admins read applications"
on public.applications for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins update applications" on public.applications;
create policy "admins update applications"
on public.applications for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins delete applications" on public.applications;
create policy "admins delete applications"
on public.applications for delete to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins read content images" on storage.objects;
create policy "admins read content images"
on storage.objects for select to authenticated
using (
  bucket_id = 'content-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admins upload content images" on storage.objects;
create policy "admins upload content images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'content-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

drop policy if exists "admins update content images" on storage.objects;
create policy "admins update content images"
on storage.objects for update to authenticated
using (
  bucket_id = 'content-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'content-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admins delete content images" on storage.objects;
create policy "admins delete content images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'content-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

insert into public.schedules (
  id, title, category, date, time, location, capacity, status, description, created_at
)
values (
  'schedule-2026-09-15-campus-mission',
  '캠퍼스 선교의 미래를 꿈꾼다',
  '온라인 세미나',
  '2026-09-15',
  '20:00–22:00',
  'Zoom 온라인',
  100,
  'open',
  '다음 세대를 위한 오늘의 헌신이 더 큰 내일을 만드는 캠퍼스 선교 세미나입니다.',
  '2026-09-01T09:00:00.000Z'
)
on conflict (id) do nothing;

-- Auth 대시보드에서 관리자 사용자를 만든 뒤, 아래의 이메일만 바꿔 별도로 실행하세요.
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = '관리자이메일@example.com';
