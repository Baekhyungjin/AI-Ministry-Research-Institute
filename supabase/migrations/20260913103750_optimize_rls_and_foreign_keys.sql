-- 외래키 조회 성능과 관리자 RLS 평가 비용을 최적화한다.

create index if not exists applications_schedule_id_index
  on public.applications (schedule_id);

drop policy if exists "public reads published contents" on public.contents;
create policy "public reads published contents"
on public.contents for select to anon, authenticated
using (
  status = 'published'
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admins insert contents" on public.contents;
create policy "admins insert contents"
on public.contents for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins update contents" on public.contents;
create policy "admins update contents"
on public.contents for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins delete contents" on public.contents;
create policy "admins delete contents"
on public.contents for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

do $$
declare
  table_name text;
begin
  foreach table_name in array array['schedules', 'gpts', 'apps', 'replays'] loop
    execute format('drop policy if exists "admins insert %1$s" on public.%1$I', table_name);
    execute format('create policy "admins insert %1$s" on public.%1$I for insert to authenticated with check (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);

    execute format('drop policy if exists "admins update %1$s" on public.%1$I', table_name);
    execute format('create policy "admins update %1$s" on public.%1$I for update to authenticated using (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'') with check (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);

    execute format('drop policy if exists "admins delete %1$s" on public.%1$I', table_name);
    execute format('create policy "admins delete %1$s" on public.%1$I for delete to authenticated using (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
  end loop;

  foreach table_name in array array['gpts', 'apps', 'replays'] loop
    execute format('drop policy if exists "public reads published %1$s" on public.%1$I', table_name);
    execute format('create policy "public reads published %1$s" on public.%1$I for select to anon, authenticated using (status = ''published'' or ((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
  end loop;
end $$;

drop policy if exists "admins read applications" on public.applications;
create policy "admins read applications"
on public.applications for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins update applications" on public.applications;
create policy "admins update applications"
on public.applications for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins delete applications" on public.applications;
create policy "admins delete applications"
on public.applications for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins read partner applications" on public.partner_applications;
create policy "admins read partner applications"
on public.partner_applications for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins update partner applications" on public.partner_applications;
create policy "admins update partner applications"
on public.partner_applications for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins delete partner applications" on public.partner_applications;
create policy "admins delete partner applications"
on public.partner_applications for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins read replay accesses" on public.replay_accesses;
create policy "admins read replay accesses"
on public.replay_accesses for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins delete replay accesses" on public.replay_accesses;
create policy "admins delete replay accesses"
on public.replay_accesses for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins read content images" on storage.objects;
create policy "admins read content images"
on storage.objects for select to authenticated
using (
  bucket_id = 'content-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admins upload content images" on storage.objects;
create policy "admins upload content images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'content-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

drop policy if exists "admins update content images" on storage.objects;
create policy "admins update content images"
on storage.objects for update to authenticated
using (
  bucket_id = 'content-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'content-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admins delete content images" on storage.objects;
create policy "admins delete content images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'content-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);
