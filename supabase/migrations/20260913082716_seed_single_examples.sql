-- 관리자와 공개 페이지의 연결을 확인하기 위한 유형별 예시 1건
-- 실제 운영 데이터를 등록한 뒤 관리자에서 안전하게 수정하거나 삭제할 수 있습니다.

insert into public.contents (id, kind, title, excerpt, body, category, status, featured, image_url, published_at, created_at)
values ('example-column-field-ministry-ai', 'column', '[예시] 목회 현장에서 AI를 시작하는 세 가지 기준', '도구보다 목적, 자동화보다 책임, 속도보다 사람을 먼저 살피는 목회 AI 활용 기준입니다.', E'이 글은 관리자 등록과 공개 페이지 반영을 확인하기 위한 예시입니다.\n\n실제 칼럼을 작성할 때 제목, 요약, 본문, 분류, 대표 이미지와 공개 상태를 자유롭게 변경할 수 있습니다.', 'AI 목회', 'published', true, '/images/archive/2026-09/partner/bible-language-analysis.png', '2026-09-13', '2026-09-13T01:00:00.000Z')
on conflict (id) do nothing;

insert into public.contents (id, kind, title, excerpt, body, category, status, featured, published_at, created_at, notice_placement, priority, cta_label, cta_url)
values ('example-notice-operation', 'notice', '[예시] 홈페이지 운영 기능을 점검하고 있습니다', '공지 등록, 노출 위치, 수정과 삭제 기능을 확인하기 위한 예시 공지입니다.', '이 공지는 관리자에서 공지 등록과 공개 페이지 반영을 확인하기 위한 예시입니다.', '운영 안내', 'published', false, '2026-09-13', '2026-09-13T02:00:00.000Z', 'strip', 10, '전체 공지 보기', '/notices')
on conflict (id) do nothing;

insert into public.schedules (id, title, category, date, time, location, capacity, status, description, created_at)
values ('schedule-2026-09-15-campus-mission', '캠퍼스 선교의 미래를 꿈꾼다', '온라인 세미나', '2026-09-15', '20:00–22:00', 'Zoom 온라인', 100, 'open', '다음 세대를 위한 오늘의 헌신이 더 큰 내일을 만드는 캠퍼스 선교 세미나입니다.', '2026-09-01T09:00:00.000Z')
on conflict (id) do nothing;

insert into public.gpts (id, title, platform, category, maker, description, plan, access_url, image_url, featured, status, created_at)
values ('gpt-bible-12', '성경 연구 12단계', 'GPT', '설교·성경 연구', '백형진', '본문 관찰에서 적용까지 단계별로 성경 연구를 돕는 목회 연구 도구입니다.', 'free', 'https://chatgpt.com/g/g-69d78a9ae5148191bd644bb1a111dc32-seonggyeong-yeongu-12dangye', '/images/archive/2026-09/partner/bible-language-analysis.png', true, 'published', '2026-09-01T00:00:00.000Z')
on conflict (id) do nothing;

insert into public.apps (id, title, category, maker, description, access_url, image_url, featured, status, created_at)
values ('app-ministry-compass', 'AI 사역 나침반', '목회 훈련', '백형진', '말씀 암송과 목회 AI 실천을 돕는 웹앱입니다.', 'https://ai-ministry-compass.web.app/', '/images/archive/2026-09/programs/ministry-app-seminar.png', true, 'published', '2026-09-01T00:00:00.000Z')
on conflict (id) do nothing;

insert into public.replays (id, title, description, video_url, thumbnail_url, status, published_at, created_at)
values ('example-replay', '[예시] 목회AI 온라인 세미나 다시보기', '다시보기 등록, 신청 정보 수집과 영상 연결 과정을 확인하기 위한 예시 콘텐츠입니다.', 'https://www.youtube.com/', '/images/schedule/seminar-campus-mission-horizontal.png', 'published', '2026-09-13', '2026-09-13T04:00:00.000Z')
on conflict (id) do nothing;

insert into public.applications (id, kind, name, church, role, phone, email, message, status, consent, created_at)
values ('example-application', 'lecture', '예시 신청자', '예시교회', '교육 담당', '010-0000-0000', 'example@example.com', '관리자 접수 목록과 상태 변경을 확인하기 위한 예시입니다.', 'new', true, '2026-09-13T03:00:00.000Z')
on conflict (id) do nothing;

insert into public.partner_applications (id, partner_type, name, church, role, phone, email, message, status, consent, created_at)
values ('example-partner-application', 'church', '예시 파트너', '예시교회', '담임목사', '010-0000-0000', 'partner@example.com', '파트너 신청 관리 화면을 확인하기 위한 예시입니다.', 'new', true, '2026-09-13T05:00:00.000Z')
on conflict (id) do nothing;

insert into public.replay_accesses (id, replay_id, replay_title, name, church, phone, email, consent, created_at)
values ('example-replay-access', 'example-replay', '[예시] 목회AI 온라인 세미나 다시보기', '예시 시청자', '예시교회', '010-0000-0000', 'viewer@example.com', true, '2026-09-13T06:00:00.000Z')
on conflict (id) do nothing;
