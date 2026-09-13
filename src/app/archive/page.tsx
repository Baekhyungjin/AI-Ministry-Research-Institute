import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '자료 아카이브',
  description: '목회AI연구소의 월간 매거진, 강의 포스터와 연구 이미지를 모아 봅니다.',
};

const archiveItems = [
  { month: '2026.08', category: '월간 매거진', title: '목회AI연구소 8월호', description: '칼럼, 현장 교육, 세미나와 연구소 비전을 담은 첫 월간지입니다.', src: '/images/archive/2026-08/magazine/01.png', ratio: 'portrait' },
  { month: '2026.08', category: '현장 교육', title: '장애인 AI 명화·동화 수업', description: '광명시 평생학습 현장에서 진행한 AI 창작 교육 사례입니다.', src: '/images/archive/2026-08/magazine/04.png', ratio: 'portrait' },
  { month: '2026.08', category: '출판', title: 'AI 권력 감시와 교회', description: 'AI 시대의 권력과 교회의 응답을 다룬 연구소 출판 자료입니다.', src: '/images/archive/2026-08/books/ai-power-watch-church.png', ratio: 'portrait' },
  { month: '2026.08', category: '특별 강의', title: 'Claude Code와 NotebookLM', description: '목회 생산성과 창의성을 높이는 실전 활용 특강입니다.', src: '/images/archive/2026-08/programs/claude-notebooklm-landscape.png', ratio: 'landscape' },
  { month: '2026.08', category: '목회 실무', title: '바쁜데, 본질은 밀립니다', description: '정국환 목사와 함께한 목회 기본 시간관리 강의입니다.', src: '/images/archive/2026-08/programs/time-management-og.png', ratio: 'landscape' },
  { month: '2026.08', category: '정기 세미나', title: 'DX 시대에서 AX 시대로', description: '고신복 목사와 함께 목회 현장의 AI 전환을 살폈습니다.', src: '/images/archive/2026-08/programs/gosinbok-og.png', ratio: 'landscape' },
  { month: '2026.09', category: '파트너 레터', title: '9월 목회AI연구소 파트너 레터', description: '사역의 다음 한 걸음을 함께 여는 월간 파트너 안내입니다.', src: '/images/archive/2026-09/partner/partner-letter-og.png', ratio: 'landscape' },
  { month: '2026.09', category: '연구 콘텐츠', title: '성경 언어 분석', description: '성경 원문과 언어 연구를 돕는 9월 대표 콘텐츠입니다.', src: '/images/archive/2026-09/partner/bible-language-analysis.png', ratio: 'landscape' },
  { month: '2026.09', category: '정기 세미나', title: '목회 아이디어, 이제 앱이 됩니다', description: '바이브코딩으로 나만의 사역 앱을 만드는 온라인 세미나입니다.', src: '/images/archive/2026-09/programs/ministry-app-seminar.png', ratio: 'portrait' },
  { month: '2026.09', category: '다음세대', title: '캠퍼스 선교의 미래를 꿈꾼다', description: 'AI 시대 다음세대를 향한 캠퍼스 선교 세미나입니다.', src: '/images/schedule/seminar-campus-mission-horizontal.png', ratio: 'landscape' },
];

export default function ArchivePage() {
  return <section className="page-section archive-page">
    <div className="container">
      <div className="page-hero"><span className="eyebrow">VISUAL ARCHIVE</span><h1>연구와 교육의 기록을<br />이미지로 모았습니다.</h1><p>8월과 9월에 파트너와 강의 참여자에게 전달한 자료에서 대표 이미지와 현장 기록을 선별했습니다.</p></div>
      <div className="archive-grid">
        {archiveItems.map((item) => <article className="archive-card" key={item.src}>
          <div className={`archive-image ${item.ratio}`}><Image src={item.src} alt={item.title} fill sizes="(max-width: 767px) 100vw, (max-width: 1080px) 50vw, 33vw" /></div>
          <div className="archive-card-copy"><div><span>{item.month}</span><b>{item.category}</b></div><h2>{item.title}</h2><p>{item.description}</p></div>
        </article>)}
      </div>
    </div>
  </section>;
}
