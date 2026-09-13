# 목회AI연구소 홈페이지

Next.js, Supabase, Resend, Vercel로 운영하는 목회AI연구소 공식 홈페이지입니다. 공개 홈페이지와 관리자 운영실이 Supabase의 같은 데이터를 사용합니다.

## 주요 기능

- 칼럼·공지의 블록 편집, 대표·본문 이미지 업로드, 초안/공개 관리
- 소장 일정 달력, 공개 교육 신청과 정원 자동 마감
- 강의 요청 확정 시 해당 날짜의 일정 자동 차단
- 일반·협업·강의·파트너·다시보기 후원 신청 통합 저장
- 관리자 신청 검색, 상태 관리와 CSV 내보내기
- GPT·연구 앱·세미나 다시보기 등록과 공개
- 공개 신청 속도 제한, 관리자 서버 인증, 보안 응답 헤더
- 동적 검색 사이트맵, 글별 공유 메타데이터, 개인정보처리방침

## 주요 경로

- `/` 홈페이지
- `/columns`, `/notices` 칼럼과 공지
- `/schedule`, `/apply` 일정 확인과 문의·신청
- `/gpts`, `/apps`, `/replays` 연구 결과와 다시보기
- `/partners`, `/card` 파트너 모집과 소장 명함
- `/privacy`, `/site-map` 개인정보처리방침과 사이트맵
- `/login`, `/admin` 관리자 로그인과 운영실

## 로컬 실행

```bash
npm install
npm run dev
```

`.env.example`을 `.env.local`로 복사하고 Supabase 환경값을 입력합니다. 개발 모드에서만 로그인 페이지의 로컬 예시 모드를 사용할 수 있으며, 이 데이터는 현재 브라우저의 `localStorage`에 저장됩니다. 운영 환경에서는 예시 데이터로 대체하지 않습니다.

## 운영 구성

- Supabase: Postgres 데이터베이스, 관리자 인증, 공개 이미지 저장소
- Resend: 새 신청 관리자 이메일 알림
- Vercel: Next.js 배포와 운영 환경변수
- NAS: 이미지 원본과 정기 백업 보관 용도

필수 환경변수는 `.env.example`을 참고합니다. `REPLAY_SUPPORT_ACCOUNT`와 `RESEND_API_KEY`는 브라우저에 노출하지 않는 서버 전용 값입니다.

## 운영 자료

- [이미지 가이드](./docs/IMAGE_GUIDE.md)
- [이미지 라이브러리](./docs/IMAGE_LIBRARY.md)
- [원본 자료 선별 기록](./docs/SOURCE_MATERIALS.md)
- [운영 가이드](./docs/운영_가이드.md)

## 검증

```bash
npm run lint
npm run build
npm audit --omit=dev
```
