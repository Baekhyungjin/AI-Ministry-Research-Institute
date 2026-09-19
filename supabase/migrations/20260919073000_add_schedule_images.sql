-- 일정별 대표 이미지를 관리자에서 등록하고 공개 화면에 노출합니다.

alter table public.schedules
  add column if not exists image_url text;

update public.schedules
set image_url = '/images/schedule/seminar-campus-mission-horizontal.png'
where id = 'schedule-2026-09-15-campus-mission'
  and image_url is null;

update public.schedules
set image_url = '/images/archive/2026-09/programs/ministry-app-seminar.png'
where id = 'schedule-57c15b3a-bb8b-46ea-9aa0-2e1940e2094d'
  and image_url is null;
