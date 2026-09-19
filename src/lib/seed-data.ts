import { AppItem, ApplicationItem, ContentItem, GptItem, PartnerApplicationItem, ReplayAccessItem, ReplayItem, ScheduleItem } from './types';

// 운영 화면의 구조를 바로 이해할 수 있도록 각 데이터 유형에 예시를 정확히 하나씩 둡니다.
export const seedContents: ContentItem[] = [
  {
    id: 'example-column-field-ministry-ai', kind: 'column', title: '[예시] 목회 현장에서 AI를 시작하는 세 가지 기준',
    excerpt: '도구보다 목적, 자동화보다 책임, 속도보다 사람을 먼저 살피는 목회 AI 활용 기준입니다.',
    body: '이 글은 관리자 등록과 공개 페이지 반영을 확인하기 위한 예시입니다.\n\n실제 칼럼을 작성할 때 제목, 요약, 본문, 분류, 대표 이미지와 공개 상태를 자유롭게 변경할 수 있습니다.',
    contentBlocks: [
      { id: 'example-block-intro', type: 'paragraph', text: 'AI를 목회에 도입할 때는 새로운 도구를 얼마나 많이 사용하는지보다, 어떤 목회적 질문을 해결하려는지 먼저 분명히 해야 합니다.' },
      { id: 'example-block-heading', type: 'heading', level: 2, text: '도입 전에 확인할 세 가지 기준' },
      { id: 'example-block-list', type: 'list', ordered: true, items: ['목회 목적이 분명한가', '개인정보와 저작권을 보호하는가', '최종 판단과 책임이 목회자에게 남아 있는가'] },
      { id: 'example-block-quote', type: 'quote', text: 'AI는 목회를 대신하는 주체가 아니라, 목회자가 말씀과 사람에게 더 집중하도록 돕는 도구여야 합니다.', caption: '목회AI연구소 활용 원칙' },
      { id: 'example-block-image', type: 'image', imageUrl: '/images/archive/2026-09/partner/bible-language-analysis.png', alt: '성경 언어 분석 교육 자료 예시', caption: '연구 결과를 현장에서 사용할 수 있는 교육 자료로 연결합니다.' },
      { id: 'example-block-divider', type: 'divider' },
      { id: 'example-block-link', type: 'link', label: '강의와 협력 문의하기', url: '/apply', description: '교회 상황에 맞는 AI 활용 교육과 협력 프로젝트를 상담합니다.' },
    ],
    category: 'AI 목회', status: 'published', featured: true,
    imageUrl: '/images/archive/2026-09/partner/bible-language-analysis.png', publishedAt: '2026-09-13', createdAt: '2026-09-13T01:00:00.000Z',
  },
  {
    id: 'example-notice-operation', kind: 'notice', title: '[예시] 홈페이지 운영 기능을 점검하고 있습니다',
    excerpt: '공지 등록, 노출 위치, 수정과 삭제 기능을 확인하기 위한 예시 공지입니다.',
    body: '이 공지는 관리자에서 공지 등록과 공개 페이지 반영을 확인하기 위한 예시입니다.',
    category: '운영 안내', status: 'published', featured: false, imageUrl: null,
    publishedAt: '2026-09-13', createdAt: '2026-09-13T02:00:00.000Z', noticePlacement: 'strip', priority: 10,
    ctaLabel: '전체 공지 보기', ctaUrl: '/notices',
  },
];

export const seedSchedules: ScheduleItem[] = [
  {
    id: 'schedule-2026-09-15-campus-mission', title: '캠퍼스 선교의 미래를 꿈꾼다', category: '온라인 세미나',
    date: '2026-09-15', time: '20:00–22:00', location: 'Zoom 온라인', capacity: 100, status: 'open',
    description: '다음 세대를 위한 오늘의 헌신이 더 큰 내일을 만드는 캠퍼스 선교 세미나입니다.',
    imageUrl: '/images/schedule/seminar-campus-mission-horizontal.png', paymentType: 'voluntary', minimumAmount: 1000,
    chatUrl: 'https://invite.kakao.com/tc/u98FaSRLHE', createdAt: '2026-09-01T09:00:00.000Z',
  },
];

export const seedApplications: ApplicationItem[] = [
  {
    id: 'example-application', kind: 'lecture', name: '예시 신청자', church: '예시교회', role: '교육 담당',
    phone: '010-0000-0000', email: 'example@example.com', message: '관리자 접수 목록과 상태 변경을 확인하기 위한 예시입니다.',
    status: 'new', consent: true, createdAt: '2026-09-13T03:00:00.000Z',
  },
];

export const seedGpts: GptItem[] = [
  {
    id: 'gpt-bible-12', title: '성경 연구 12단계', platform: 'GPT', category: '설교·성경 연구', maker: '백형진',
    description: '본문 관찰에서 적용까지 단계별로 성경 연구를 돕는 목회 연구 도구입니다.', plan: 'free',
    accessUrl: 'https://chatgpt.com/g/g-69d78a9ae5148191bd644bb1a111dc32-seonggyeong-yeongu-12dangye',
    imageUrl: '/images/archive/2026-09/partner/bible-language-analysis.png', featured: true, status: 'published', createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export const seedApps: AppItem[] = [
  {
    id: 'app-ministry-compass', title: 'AI 사역 나침반', category: '목회 훈련', maker: '백형진',
    description: '말씀 암송과 목회 AI 실천을 돕는 웹앱입니다.', accessUrl: 'https://ai-ministry-compass.web.app/',
    imageUrl: '/images/archive/2026-09/programs/ministry-app-seminar.png', featured: true, status: 'published', createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export const seedReplays: ReplayItem[] = [
  {
    id: 'example-replay', title: '[예시] 목회AI 온라인 세미나 다시보기',
    description: '다시보기 등록, 신청 정보 수집과 영상 연결 과정을 확인하기 위한 예시 콘텐츠입니다.',
    videoUrl: 'https://www.youtube.com/', thumbnailUrl: '/images/schedule/seminar-campus-mission-horizontal.png',
    status: 'published', publishedAt: '2026-09-13', createdAt: '2026-09-13T04:00:00.000Z',
  },
];

export const seedPartnerApplications: PartnerApplicationItem[] = [
  {
    id: 'example-partner-application', partnerType: 'church', name: '예시 파트너', church: '예시교회', role: '담임목사',
    phone: '010-0000-0000', email: 'partner@example.com', message: '파트너 신청 관리 화면을 확인하기 위한 예시입니다.',
    status: 'new', consent: true, createdAt: '2026-09-13T05:00:00.000Z',
  },
];

export const seedReplayAccesses: ReplayAccessItem[] = [
  {
    id: 'example-replay-access', replayId: 'example-replay', replayTitle: '[예시] 목회AI 온라인 세미나 다시보기',
    name: '예시 시청자', church: '예시교회', phone: '010-0000-0000', email: 'viewer@example.com',
    depositorName: '예시 시청자', supportAmount: 10000, paymentStatus: 'pending',
    consent: true, createdAt: '2026-09-13T06:00:00.000Z',
  },
];
