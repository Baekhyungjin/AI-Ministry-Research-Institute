-- 운영 안정성: 공개 신청 속도 제한, 교육 정원 원자 처리, 확정 강의 날짜 자동 차단

create schema if not exists private;
revoke all on schema private from public;

alter table public.schedules
  add column if not exists capacity_reached boolean not null default false;

create table if not exists private.submission_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1,
  primary key (scope, key_hash)
);

revoke all on private.submission_rate_limits from public, anon, authenticated;

create or replace function public.consume_submission_rate_limit(p_scope text, p_key_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if p_scope not in ('application', 'partner', 'replay')
    or length(p_key_hash) < 32
    or length(p_key_hash) > 128 then
    return false;
  end if;

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
  returning request_count <= 5 into allowed;

  delete from private.submission_rate_limits
  where window_started_at < now() - interval '2 days';

  return allowed;
end;
$$;

revoke all on function public.consume_submission_rate_limit(text, text) from public;
grant execute on function public.consume_submission_rate_limit(text, text) to anon;

create or replace function private.enforce_schedule_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_capacity integer;
  target_status text;
  target_date date;
  active_count integer;
begin
  if new.kind <> 'schedule' then
    return new;
  end if;

  if new.schedule_id is null then
    raise exception using message = 'SCHEDULE_REQUIRED';
  end if;

  select capacity, status, date
    into target_capacity, target_status, target_date
  from public.schedules
  where id = new.schedule_id
  for update;

  if not found or target_status <> 'open'
    or target_date < (now() at time zone 'Asia/Seoul')::date then
    raise exception using message = 'SCHEDULE_NOT_OPEN';
  end if;

  select count(*)::integer into active_count
  from public.applications
  where schedule_id = new.schedule_id
    and status in ('new', 'contacted', 'confirmed');

  if active_count >= target_capacity then
    update public.schedules
      set status = 'closed', capacity_reached = true
    where id = new.schedule_id;
    raise exception using message = 'SCHEDULE_FULL';
  end if;

  if active_count + 1 >= target_capacity then
    update public.schedules
      set status = 'closed', capacity_reached = true
    where id = new.schedule_id;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_schedule_capacity() from public;

drop trigger if exists applications_enforce_schedule_capacity on public.applications;
create trigger applications_enforce_schedule_capacity
before insert on public.applications
for each row execute function private.enforce_schedule_capacity();

create or replace function private.sync_confirmed_lecture_schedule()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.kind <> 'lecture' or new.requested_date is null then
    return new;
  end if;

  if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    if exists (
      select 1 from public.schedules
      where date = new.requested_date
        and id <> 'confirmed-lecture-' || new.id
    ) then
      raise exception using message = 'DATE_ALREADY_BOOKED';
    end if;

    insert into public.schedules (
      id, title, category, date, time, location, capacity, status,
      capacity_reached, description, created_at
    ) values (
      'confirmed-lecture-' || new.id,
      '확정된 외부 강의 일정',
      '외부 강의',
      new.requested_date,
      '일정 확정',
      '외부 일정',
      1,
      'closed',
      false,
      '이미 확정된 일정으로 추가 신청할 수 없습니다.',
      now()
    )
    on conflict (id) do update set
      date = excluded.date,
      status = 'closed',
      description = excluded.description;
  elsif old.status = 'confirmed' and new.status in ('new', 'contacted') then
    delete from public.schedules where id = 'confirmed-lecture-' || new.id;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_confirmed_lecture_schedule() from public;

drop trigger if exists applications_sync_confirmed_lecture_schedule on public.applications;
create trigger applications_sync_confirmed_lecture_schedule
after update of status on public.applications
for each row execute function private.sync_confirmed_lecture_schedule();

create or replace function private.reopen_capacity_schedule()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_schedule_id text;
  active_count integer;
  target_capacity integer;
  was_capacity_reached boolean;
  target_date date;
begin
  affected_schedule_id := case when tg_op = 'DELETE' then old.schedule_id else old.schedule_id end;
  if affected_schedule_id is null then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  select capacity, capacity_reached, date
    into target_capacity, was_capacity_reached, target_date
  from public.schedules
  where id = affected_schedule_id
  for update;

  if not found or not was_capacity_reached then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  select count(*)::integer into active_count
  from public.applications
  where schedule_id = affected_schedule_id
    and status in ('new', 'contacted', 'confirmed')
    and id <> old.id;

  if active_count < target_capacity
    and target_date >= (now() at time zone 'Asia/Seoul')::date then
    update public.schedules
      set status = 'open', capacity_reached = false
    where id = affected_schedule_id;
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

revoke all on function private.reopen_capacity_schedule() from public;

drop trigger if exists applications_reopen_capacity_schedule_update on public.applications;
create trigger applications_reopen_capacity_schedule_update
after update of status, schedule_id on public.applications
for each row
when (
  old.kind = 'schedule'
  and old.schedule_id is not null
  and (
    old.status is distinct from new.status
    or old.schedule_id is distinct from new.schedule_id
  )
)
execute function private.reopen_capacity_schedule();

drop trigger if exists applications_reopen_capacity_schedule_delete on public.applications;
create trigger applications_reopen_capacity_schedule_delete
after delete on public.applications
for each row
when (old.kind = 'schedule' and old.schedule_id is not null)
execute function private.reopen_capacity_schedule();
