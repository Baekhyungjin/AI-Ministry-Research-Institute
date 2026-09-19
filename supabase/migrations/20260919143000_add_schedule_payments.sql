-- 공개 세미나 참가비 설정과 신청별 입금 관리

alter table public.schedules
  add column if not exists payment_type text not null default 'free',
  add column if not exists fee_amount integer not null default 0,
  add column if not exists minimum_amount integer not null default 1000,
  add column if not exists chat_url text;

alter table public.schedules
  drop constraint if exists schedules_payment_type_check,
  add constraint schedules_payment_type_check check (payment_type in ('free', 'fixed', 'voluntary')),
  drop constraint if exists schedules_fee_amount_check,
  add constraint schedules_fee_amount_check check (fee_amount >= 0),
  drop constraint if exists schedules_minimum_amount_check,
  add constraint schedules_minimum_amount_check check (minimum_amount >= 0);

alter table public.applications
  add column if not exists depositor_name text,
  add column if not exists payment_amount integer,
  add column if not exists payment_status text not null default 'not_required',
  add column if not exists chat_joined boolean not null default false;

alter table public.applications
  drop constraint if exists applications_payment_amount_check,
  add constraint applications_payment_amount_check check (payment_amount is null or payment_amount >= 0),
  drop constraint if exists applications_payment_status_check,
  add constraint applications_payment_status_check check (payment_status in ('not_required', 'pending', 'confirmed', 'cancelled'));

create index if not exists applications_payment_status_index
  on public.applications (payment_status, created_at desc);

-- 기존 9월 바이브 코딩 세미나는 기존 Google Form과 같은 자율후원 방식으로 전환합니다.
update public.schedules
set payment_type = 'voluntary',
    minimum_amount = 1000,
    fee_amount = 0,
    chat_url = 'https://invite.kakao.com/tc/u98FaSRLHE'
where id = 'schedule-57c15b3a-bb8b-46ea-9aa0-2e1940e2094d'
   or title = '바이브 코딩을 통한 교회 앱 만들기';
