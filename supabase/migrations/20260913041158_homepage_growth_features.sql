-- 공개 GPT·앱·세미나 다시보기, 파트너 모집, 확장 공지

alter table public.contents
  add column if not exists notice_placement text check (notice_placement in ('strip', 'banner', 'popup')),
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists cta_label text,
  add column if not exists cta_url text,
  add column if not exists priority integer not null default 0;

create table if not exists public.gpts (
  id text primary key, title text not null, platform text not null check (platform in ('GPT','Gem')),
  category text not null default '', maker text not null default '', description text not null default '',
  plan text not null default 'free' check (plan in ('free','paid')), access_url text not null,
  price_label text, image_url text, featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);

create table if not exists public.apps (
  id text primary key, title text not null, category text not null default '', maker text not null default '',
  description text not null default '', access_url text not null, image_url text,
  featured boolean not null default false, status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);

create table if not exists public.replays (
  id text primary key, title text not null, description text not null default '', video_url text not null,
  thumbnail_url text, status text not null default 'draft' check (status in ('draft','published')),
  published_at date not null default current_date, created_at timestamptz not null default now()
);

create table if not exists public.partner_applications (
  id text primary key, partner_type text not null check (partner_type in ('church','individual')),
  name text not null, church text not null default '', role text not null default '', phone text not null,
  email text not null, message text not null default '', status text not null default 'new'
    check (status in ('new','contacted','confirmed','closed')),
  consent boolean not null check (consent = true), created_at timestamptz not null default now()
);

create table if not exists public.replay_accesses (
  id text primary key, replay_id text not null references public.replays(id) on delete cascade,
  replay_title text not null, name text not null, church text not null default '', phone text not null,
  email text not null, consent boolean not null check (consent = true), created_at timestamptz not null default now()
);

create index if not exists gpts_public_index on public.gpts (status, plan, featured, created_at desc);
create index if not exists apps_public_index on public.apps (status, featured, created_at desc);
create index if not exists replays_public_index on public.replays (status, published_at desc);
create index if not exists partner_applications_created_index on public.partner_applications (created_at desc);
create index if not exists replay_accesses_replay_index on public.replay_accesses (replay_id, created_at desc);
create unique index if not exists replay_accesses_unique_email on public.replay_accesses (replay_id, lower(email));

alter table public.gpts enable row level security;
alter table public.apps enable row level security;
alter table public.replays enable row level security;
alter table public.partner_applications enable row level security;
alter table public.replay_accesses enable row level security;

revoke all on public.gpts, public.apps, public.replays, public.partner_applications, public.replay_accesses from anon, authenticated;
grant select on public.gpts, public.apps, public.replays to anon, authenticated;
grant insert, update, delete on public.gpts, public.apps, public.replays to authenticated;
grant insert on public.partner_applications, public.replay_accesses to anon, authenticated;
grant select, update, delete on public.partner_applications, public.replay_accesses to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['gpts','apps','replays'] loop
    execute format('create policy "public reads published %1$s" on public.%1$I for select to anon, authenticated using (status = ''published'' or (select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
    execute format('create policy "admins insert %1$s" on public.%1$I for insert to authenticated with check ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
    execute format('create policy "admins update %1$s" on public.%1$I for update to authenticated using ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'') with check ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
    execute format('create policy "admins delete %1$s" on public.%1$I for delete to authenticated using ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
  end loop;
end $$;

create policy "public submits partner applications" on public.partner_applications for insert to anon, authenticated with check (status = 'new' and consent = true);
create policy "admins read partner applications" on public.partner_applications for select to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins update partner applications" on public.partner_applications for update to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins delete partner applications" on public.partner_applications for delete to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public submits replay access" on public.replay_accesses for insert to anon, authenticated with check (consent = true);
create policy "admins read replay accesses" on public.replay_accesses for select to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins delete replay accesses" on public.replay_accesses for delete to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
