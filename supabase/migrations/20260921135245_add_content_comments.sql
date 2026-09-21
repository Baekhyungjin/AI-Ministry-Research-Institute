-- 칼럼·공지 댓글: 공개 열람, 댓글 비밀번호 기반 작성자 수정·삭제, 관리자 운영

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('column', 'notice')),
  content_id text not null references public.contents(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 30),
  body text not null check (char_length(body) between 2 and 2000),
  password_hash text not null,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_content_public_idx
  on public.comments (content_type, content_id, status, created_at);
create index if not exists comments_admin_created_idx
  on public.comments (created_at desc);

alter table public.comments enable row level security;

revoke all on table public.comments from public, anon, authenticated;
grant select (id, content_type, content_id, author_name, body, status, created_at, updated_at)
  on public.comments to anon, authenticated;
grant update (author_name, body, status) on public.comments to authenticated;
grant delete on public.comments to authenticated;

drop policy if exists "Public reads published comments" on public.comments;
create policy "Public reads published comments"
on public.comments for select to anon, authenticated
using (
  status = 'published'
  or (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
);

drop policy if exists "Admins update comments" on public.comments;
create policy "Admins update comments"
on public.comments for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins delete comments" on public.comments;
create policy "Admins delete comments"
on public.comments for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create or replace function private.set_comment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_comment_updated_at() from public, anon, authenticated;

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row execute function private.set_comment_updated_at();

-- 공개 댓글 변경은 이 세 함수로만 허용한다. 비밀번호 원문은 저장하지 않는다.
create or replace function public.create_public_comment(
  p_content_type text,
  p_content_id text,
  p_author_name text,
  p_body text,
  p_password text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_comment_id uuid;
begin
  p_content_type := btrim(coalesce(p_content_type, ''));
  p_content_id := btrim(coalesce(p_content_id, ''));
  p_author_name := btrim(coalesce(p_author_name, ''));
  p_body := btrim(coalesce(p_body, ''));

  if p_content_type not in ('column', 'notice')
    or char_length(p_content_id) < 1 or char_length(p_content_id) > 180
    or char_length(p_author_name) < 2 or char_length(p_author_name) > 30
    or char_length(p_body) < 2 or char_length(p_body) > 2000
    or char_length(coalesce(p_password, '')) < 4 or char_length(p_password) > 32 then
    raise exception using message = 'INVALID_COMMENT';
  end if;

  if not exists (
    select 1 from public.contents
    where id = p_content_id and kind = p_content_type and status = 'published'
  ) then
    raise exception using message = 'CONTENT_NOT_AVAILABLE';
  end if;

  insert into public.comments (content_type, content_id, author_name, body, password_hash)
  values (
    p_content_type,
    p_content_id,
    p_author_name,
    p_body,
    extensions.crypt(p_password, extensions.gen_salt('bf', 10))
  )
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

create or replace function public.update_public_comment(
  p_comment_id uuid,
  p_body text,
  p_password text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
begin
  p_body := btrim(coalesce(p_body, ''));
  if char_length(p_body) < 2 or char_length(p_body) > 2000
    or char_length(coalesce(p_password, '')) < 4 or char_length(p_password) > 32 then
    return false;
  end if;

  update public.comments
  set body = p_body
  where id = p_comment_id
    and password_hash = extensions.crypt(p_password, password_hash);
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

create or replace function public.delete_public_comment(
  p_comment_id uuid,
  p_password text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
begin
  if char_length(coalesce(p_password, '')) < 4 or char_length(p_password) > 32 then
    return false;
  end if;

  delete from public.comments
  where id = p_comment_id
    and password_hash = extensions.crypt(p_password, password_hash);
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

revoke all on function public.create_public_comment(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.update_public_comment(uuid, text, text) from public, anon, authenticated;
revoke all on function public.delete_public_comment(uuid, text) from public, anon, authenticated;
grant execute on function public.create_public_comment(text, text, text, text, text) to anon;
grant execute on function public.update_public_comment(uuid, text, text) to anon;
grant execute on function public.delete_public_comment(uuid, text) to anon;

comment on function public.create_public_comment(text, text, text, text, text)
  is 'Validated public comment creation; stores only a bcrypt password hash.';
comment on function public.update_public_comment(uuid, text, text)
  is 'Updates a comment only when the supplied writer password matches.';
comment on function public.delete_public_comment(uuid, text)
  is 'Deletes a comment only when the supplied writer password matches.';

-- 공개 댓글 요청도 기존 개인정보 비저장형 속도 제한을 함께 사용한다.
create or replace function public.consume_submission_rate_limit(p_scope text, p_key_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
  request_limit integer;
begin
  if p_scope not in ('application', 'partner', 'replay', 'comment')
    or length(p_key_hash) < 32
    or length(p_key_hash) > 128 then
    return false;
  end if;

  request_limit := case when p_scope = 'comment' then 12 else 5 end;

  insert into private.submission_rate_limits as limits (
    scope, key_hash, window_started_at, request_count
  ) values (
    p_scope, p_key_hash, now(), 1
  )
  on conflict (scope, key_hash) do update
    set request_count = case
          when limits.window_started_at < now() - interval '10 minutes' then 1
          else limits.request_count + 1
        end,
        window_started_at = case
          when limits.window_started_at < now() - interval '10 minutes' then now()
          else limits.window_started_at
        end
  returning request_count <= request_limit into allowed;

  delete from private.submission_rate_limits
  where window_started_at < now() - interval '2 days';

  return allowed;
end;
$$;

revoke all on function public.consume_submission_rate_limit(text, text) from public, anon, authenticated;
grant execute on function public.consume_submission_rate_limit(text, text) to anon;
