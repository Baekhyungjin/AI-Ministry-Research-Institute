# Supabase 운영 설정

프로젝트 URL과 Publishable key는 로컬의 `.env.local`과 Vercel 환경변수에 연결합니다. 비밀키가 아닌 브라우저용 Publishable key만 `NEXT_PUBLIC_` 변수로 사용합니다.

## 1. 데이터베이스와 이미지 버킷 만들기

Supabase CLI 또는 MCP를 이용해 `supabase/migrations/`의 마이그레이션을 시간순으로 적용합니다.

마이그레이션은 다음을 만듭니다.

- `contents`: 칼럼·공지와 대표 이미지 주소
- `schedules`: 교육·세미나 일정
- `applications`: 문의·강의·일정 신청
- `gpts`, `apps`, `replays`: 공개 GPT·연구 앱·세미나 다시보기
- `partner_applications`, `replay_accesses`: 파트너·다시보기 신청 기록
- `content-images`: 5MB 이하 JPG/PNG/WEBP/GIF 이미지 버킷
- 관리자만 콘텐츠를 관리할 수 있는 RLS 정책

## 2. 관리자 계정 만들기

1. Supabase Dashboard → Authentication → Users에서 관리자 이메일 계정을 만들거나 로그인 링크를 발송합니다.
2. SQL Editor에서 아래 SQL의 이메일을 실제 관리자 이메일로 바꿔 실행합니다.

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = '관리자이메일@example.com';
```

이후 홈페이지 `/login`에서 비밀번호 또는 이메일 로그인 링크로 로그인합니다. 개발 중에는 `로컬 예시 모드 열기` 버튼으로 UI를 확인할 수 있습니다.
