'use client';

import Image from 'next/image';
import Link from 'next/link';
import { seedContents, seedSchedules } from '@/lib/seed-data';
import { ContentItem, ScheduleItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';
import { columnCategoryHref } from '@/lib/content-taxonomy';

const researchAreas = [
  { number: '01', title: '설교와 성경 연구', description: '본문 연구와 자료 정리를 돕되 해석의 책임은 목회자에게 남기는 활용법을 연구합니다.', href: columnCategoryHref('설교와 성경 연구') },
  { number: '02', title: '교회 행정과 콘텐츠', description: '반복 업무를 줄이고 작은 교회도 지속할 수 있는 제작 체계를 만듭니다.', href: columnCategoryHref('교회 행정과 콘텐츠') },
  { number: '03', title: 'AI 윤리와 목회', description: '개인정보, 저작권, 신학적 분별을 현장에서 적용할 수 있는 기준으로 정리합니다.', href: columnCategoryHref('AI 윤리와 목회') },
];

const quickLinks = [
  { label: '연구와 칼럼', description: '현장 질문을 연구한 글', href: '/columns', tone: 'blue' },
  { label: '교육 일정', description: '워크숍과 세미나 신청', href: '/schedule', tone: 'violet' },
  { label: '사역 프로젝트', description: '교회에서 검증한 실험', href: '/projects', tone: 'navy' },
  { label: 'GPT·연구 앱', description: '무료 도구와 실제 앱', href: '/gpts', tone: 'amber' },
];

function formatKoreanDate(date: string) {
  const [, month, day] = date.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}

export default function HomeContent() {
  const { records: contents } = useRecords<ContentItem>('contents', seedContents, true);
  const { records: schedules } = useRecords<ScheduleItem>('schedules', seedSchedules);
  const columns = contents.filter((item) => item.kind === 'column' && item.status === 'published').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const notices = contents.filter((item) => item.kind === 'notice' && item.status === 'published').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const upcoming = schedules.filter((item) => item.status === 'open' && item.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const featured = columns.find((item) => item.featured) ?? columns[0];

  return (
    <>
      <section className="reference-hero">
        <div className="container reference-hero-grid">
          <div className="reference-hero-copy">
            <span className="reference-overline">MINISTRY AI RESEARCH INSTITUTE</span>
            <h1>기술을 앞세우기보다,<br /><em>목회의 본질을 더 깊게.</em></h1>
            <p>교회 현장에서 시작한 질문을 연구하고, 목회자가 바로 사용할 수 있는 교육과 도구로 연결합니다.</p>
            <div className="button-row"><Link href="/columns" className="btn btn-primary">연구 결과 보기</Link><Link href="/replays" className="btn btn-replay">세미나 다시보기</Link><Link href="/apply" className="btn btn-secondary">강의·협력 문의</Link></div>
            <dl className="reference-proof"><div><dt>RESEARCH</dt><dd>현장 중심 연구</dd></div><div><dt>EDUCATION</dt><dd>목회자 실습 교육</dd></div><div><dt>TOOLS</dt><dd>교회 맞춤형 도구</dd></div></dl>
          </div>
          <div className="reference-portrait-stage" aria-label="백형진 목회AI연구소 소장">
            <div className="reference-director-photo"><Image src="/images/about/director-baekhyungjin.png" alt="백형진 목회AI연구소 소장" fill priority sizes="(max-width: 840px) 90vw, 520px" /></div>
            <div className="reference-director-info"><span>DIRECTOR · FIELD RESEARCHER</span><strong>백형진 소장</strong><small>안양선민교회 목회 현장에서 연구합니다.</small></div>
          </div>
        </div>
      </section>

      <nav className="reference-quick-nav" aria-label="주요 메뉴 바로가기"><div className="container">
        {quickLinks.map((item, index) => <Link href={item.href} key={item.label}><span>0{index + 1}</span><div><strong>{item.label}</strong><small>{item.description}</small></div><b aria-hidden="true">→</b></Link>)}
      </div></nav>

      <div className="reference-latest"><div className="container">
        <div><span>NEWS</span><strong>연구소 소식</strong></div>
        {notices.slice(0, 2).map((item) => <Link href={`/notices/${item.id}`} key={item.id}><b>{item.category}</b><span>{item.title}</span><time>{item.publishedAt.slice(5).replace('-', '.')}</time></Link>)}
        {!notices.length && <span className="reference-latest-empty">등록된 공지가 없습니다.</span>}
        <Link href="/notices" className="reference-latest-more">전체 보기 ↗</Link>
      </div></div>

      <section className="portal-section research-newsroom"><div className="container">
        <div className="portal-section-head" data-reveal><div><span className="eyebrow">RESEARCH & COLUMN</span><h2>현장에서 시작한 연구</h2></div><Link href="/columns" className="text-link">모든 칼럼 보기 →</Link></div>
        <div className="newsroom-grid" data-reveal>
          {featured && <Link href={`/columns/${featured.id}`} className="featured-research" aria-label={`${featured.title} 칼럼 읽기`}><div className="featured-research-image"><Image src={featured.imageUrl || '/images/archive/2026-09/partner/bible-language-analysis.png'} alt={`${featured.title} 대표 이미지`} fill sizes="(max-width: 840px) 100vw, 52vw" /></div><div className="featured-research-copy"><span>{featured.category} · FEATURED</span><h3>{featured.title}</h3><p>{featured.excerpt}</p><div className="featured-research-meta"><time>{featured.publishedAt}</time><strong>칼럼 자세히 읽기 →</strong></div></div></Link>}
          {!featured && <div className="content-empty-card"><span>RESEARCH & COLUMN</span><strong>새로운 연구를 준비하고 있습니다.</strong><p>현장에서 검증한 연구와 칼럼을 이곳에 차례로 소개합니다.</p></div>}
          <div className="research-index"><div className="research-index-heading"><strong>연구 분야</strong><span>Research Areas</span></div>{researchAreas.map((area) => <Link href={area.href} key={area.number} aria-label={`${area.title} 관련 칼럼 보기`}><span>{area.number}</span><div><h3>{area.title}</h3><p>{area.description}</p><small>관련 칼럼 보기 →</small></div><b aria-hidden="true">↗</b></Link>)}</div>
        </div>
      </div></section>

      <section className="portal-section program-desk"><div className="container">
        <div className="portal-section-head light" data-reveal><div><span className="eyebrow">PROGRAM & SCHEDULE</span><h2>다가오는 교육과 세미나</h2></div><Link href="/schedule" className="text-link">전체 일정 보기 →</Link></div>
        <div className={`program-desk-grid ${upcoming.length === 1 ? 'single' : ''}`} data-reveal>
          {upcoming.length ? <><Link href={`/apply?type=schedule&schedule=${upcoming[0].id}`} className="program-feature"><div className="program-feature-image"><Image src={upcoming[0].imageUrl || '/images/brand/ministry-ai-logo-source.png'} alt={`${upcoming[0].title} 대표 이미지`} fill sizes="(max-width: 840px) 100vw, 62vw" unoptimized={Boolean(upcoming[0].imageUrl?.startsWith('data:'))} /></div><div><span>UPCOMING · {formatKoreanDate(upcoming[0].date)}</span><strong>{upcoming[0].title}</strong><b>세미나 신청하기 →</b></div></Link>{upcoming.length > 1 && <div className="program-list">{upcoming.slice(1, 4).map((item) => <article key={item.id}><div><time>{formatKoreanDate(item.date)}</time><span>{item.category}</span></div><h3>{item.title}</h3><p>{item.time}<br />{item.location}</p><Link href={`/apply?type=schedule&schedule=${item.id}`}>신청하기 →</Link></article>)}</div>}</> : <div className="program-empty-card"><span>PROGRAM & SCHEDULE</span><strong>새로운 교육 일정을 준비하고 있습니다.</strong><p>강의와 세미나 일정이 확정되면 이곳에서 안내합니다.</p></div>}
        </div>
      </div></section>

      <section className="portal-section home-platform-section"><div className="container">
        <div className="portal-section-head" data-reveal><div><span className="eyebrow">MINISTRY AI PLATFORM</span><h2>읽는 연구에서, 쓰는 도구로</h2></div><p>연구·교육·도구·동역을 하나의 홈페이지에서 연결합니다.</p></div>
        <div className="home-platform-grid home-platform-grid-three" data-reveal><Link href="/gpts"><span>01 · GPTs</span><h3>무료·판매 GPT</h3><p>목회와 교회 업무에 맞춘 AI 도구를 공개합니다.</p><b>살펴보기 →</b></Link><Link href="/apps"><span>02 · APPS</span><h3>연구 결과 앱</h3><p>연구 결과를 실제 사용할 수 있는 웹앱으로 연결합니다.</p><b>앱 열기 →</b></Link><Link href="/partners"><span>03 · PARTNERS</span><h3>파트너 교회·개인</h3><p>함께 연구하고 현장에서 실험할 동역자를 모집합니다.</p><b>함께하기 →</b></Link></div>
        <Link href="/replays" className="replay-sales-banner" data-reveal><div><span>PREMIUM SEMINAR REPLAY</span><h3>놓친 세미나의 핵심을<br />다시 배우고 바로 적용하세요.</h3><p>목회 현장에서 검증한 교육을 원하는 시간에 이어서 학습합니다. 후원 후 입금 완료를 표시하면 바로 시청할 수 있습니다.</p></div><div className="replay-sales-action"><b>10,000원부터 자유 후원</b><strong>다시보기 목록 바로가기 →</strong></div></Link>
      </div></section>

      <section className="portal-section institute-profile"><div className="container institute-profile-grid" data-reveal>
        <div className="profile-portrait"><Image src="/images/about/director-baekhyungjin.png" alt="백형진 목회AI연구소 소장" fill sizes="(max-width: 760px) 88vw, 340px" /></div>
        <div className="profile-statement">
          <span className="eyebrow">ABOUT THE INSTITUTE</span>
          <blockquote>“기술보다 사람을,<br />도구보다 사명을 먼저 생각합니다.”</blockquote>
          <p>안양선민교회 목회 현장을 기반으로 설교 연구, 교회 행정, 콘텐츠 제작과 AI 윤리를 함께 연구합니다.</p>
          <div className="profile-note"><strong>백형진 소장</strong><span>안양선민교회 담임목사 · AI 목회 활용 연구자·교육자</span></div>
          <div className="profile-actions"><Link href="/about" className="btn btn-primary">연구소 소개</Link><Link href="/projects" className="btn btn-tertiary">사역 프로젝트</Link></div>
        </div>
      </div></section>

      <section className="portal-contact"><div className="container portal-contact-inner" data-reveal><div><span>CONTACT</span><h2 className="fluid-display-title"><span>교회에 필요한 AI 활용,</span>{' '}<span>함께 설계하겠습니다.</span></h2></div><div><p>강의, 컨설팅, 협력 프로젝트에 관해 현재의 고민부터 편하게 남겨주세요.</p><Link href="/apply" className="btn btn-white">문의 및 강의 신청 →</Link></div></div></section>
    </>
  );
}
