'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { seedContents, seedSchedules } from '@/lib/seed-data';
import { ContentItem, ScheduleItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const researchAreas = [
  { number: '01', title: '설교와 성경 연구', description: '본문 연구와 자료 정리를 돕되 해석의 책임은 목회자에게 남기는 활용법을 연구합니다.', href: '/columns' },
  { number: '02', title: '교회 행정과 콘텐츠', description: '반복 업무를 줄이고 작은 교회도 지속할 수 있는 제작 체계를 만듭니다.', href: '/prompts' },
  { number: '03', title: 'AI 윤리와 목회', description: '개인정보, 저작권, 신학적 분별을 현장에서 적용할 수 있는 기준으로 정리합니다.', href: '/insights' },
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

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="portal-hero cinematic-portal-hero">
        <div className="container portal-hero-grid">
          <div className="portal-intro">
            <span className="eyebrow hero-kicker"><i /> 목회 현장을 위한 AI 연구·교육 기관</span>
            <h1 className="fluid-display-title"><span className="hero-line">목회의 본질을 지키는</span>{' '}<span className="hero-line accent-line">AI 활용을 연구합니다.</span></h1>
            <p>목회AI연구소는 교회 현장의 질문에서 출발합니다. 연구 결과를 교육하고, 목회자가 실제로 사용할 수 있는 도구와 자료로 나눕니다.</p>
            <div className="button-row"><Link href="/columns" className="btn btn-primary">최근 연구 보기</Link><Link href="/apply" className="btn btn-secondary">문의 및 강의 신청</Link></div>
            <div className="hero-signal-row"><span><b>RESEARCH</b> 현장 연구</span><span><b>EDUCATION</b> 실습 교육</span><span><b>TOOLS</b> 사역 도구</span></div>
          </div>
          <div className="brand-hero-visual" role="img" aria-label="목회AI연구소 공식 로고와 백형진 소장">
            <Image className="official-logo-scene" src="/images/brand/ministry-ai-logo.png" alt="" fill priority sizes="(max-width: 840px) 100vw, 48vw" />
            <div className="visual-edition"><span>OFFICIAL IDENTITY</span><b>AI × FAITH</b></div>
            <div className="hero-director-portrait"><Image src="/images/about/director-baekhyungjin.png" alt="" fill priority sizes="(max-width: 600px) 58vw, 310px" /></div>
            <div className="hero-director-label"><span>DIRECTOR</span><strong>백형진 소장</strong><small>목회 현장에서 연구합니다</small></div>
          </div>
        </div>
        <nav className="container portal-shortcuts animated-shortcuts" aria-label="주요 메뉴 바로가기" data-reveal>
          {quickLinks.map((item) => <Link href={item.href} className={`portal-shortcut ${item.tone}`} key={item.label}><span aria-hidden="true">●</span><div><strong>{item.label}</strong><small>{item.description}</small></div><b aria-hidden="true">→</b></Link>)}
        </nav>
        <div className="container portal-newsline" data-reveal>
          <div><span>NOW</span><strong>연구소 최근 소식</strong></div>
          {notices.slice(0, 2).map((item) => <Link href={`/notices/${item.id}`} key={item.id}><b>{item.category}</b><span>{item.title}</span><time>{item.publishedAt.slice(5).replace('-', '.')}</time></Link>)}
          {!notices.length && <span className="newsline-empty">등록된 공지가 없습니다.</span>}
          <Link href="/notices" className="newsline-more">전체 보기 ↗</Link>
        </div>
      </section>

      <div className="brand-marquee" aria-hidden="true"><div><span>RESEARCH</span><i>✦</i><span>EDUCATION</span><i>✦</i><span>ETHICS</span><i>✦</i><span>MINISTRY TOOLS</span><i>✦</i><span>FIELD PRACTICE</span><i>✦</i><span>RESEARCH</span><i>✦</i><span>EDUCATION</span><i>✦</i><span>ETHICS</span><i>✦</i></div></div>

      <section className="portal-section research-newsroom"><div className="container">
        <div className="portal-section-head" data-reveal><div><span className="eyebrow">RESEARCH & COLUMN</span><h2>현장에서 시작한 연구</h2></div><Link href="/columns" className="text-link">모든 칼럼 보기 →</Link></div>
        <div className="newsroom-grid" data-reveal>
          {featured && <Link href={`/columns/${featured.id}`} className="featured-research"><div className="featured-research-image"><Image src={featured.imageUrl || '/images/archive/2026-09/partner/bible-language-analysis.png'} alt={`${featured.title} 대표 이미지`} fill sizes="(max-width: 840px) 100vw, 52vw" /></div><div className="featured-research-copy"><span>{featured.category} · FEATURED</span><h3>{featured.title}</h3><p>{featured.excerpt}</p><time>{featured.publishedAt}</time></div></Link>}
          {!featured && <div className="content-empty-card"><span>RESEARCH & COLUMN</span><strong>새로운 연구를 준비하고 있습니다.</strong><p>현장에서 검증한 연구와 칼럼을 이곳에 차례로 소개합니다.</p></div>}
          <div className="research-index"><div className="research-index-heading"><strong>연구 분야</strong><span>Research Areas</span></div>{researchAreas.map((area) => <Link href={area.href} key={area.number}><span>{area.number}</span><div><h3>{area.title}</h3><p>{area.description}</p></div><b aria-hidden="true">↗</b></Link>)}</div>
        </div>
      </div></section>

      <section className="portal-section program-desk"><div className="container">
        <div className="portal-section-head light" data-reveal><div><span className="eyebrow">PROGRAM & SCHEDULE</span><h2>다가오는 교육과 세미나</h2></div><Link href="/schedule" className="text-link">전체 일정 보기 →</Link></div>
        <div className="program-desk-grid" data-reveal>
          {upcoming.length ? <><Link href={`/apply?type=schedule&schedule=${upcoming[0].id}`} className="program-feature"><div className="program-feature-image"><Image src="/images/schedule/seminar-campus-mission-horizontal.png" alt="캠퍼스 선교의 미래를 꿈꾼다 세미나" fill sizes="(max-width: 840px) 100vw, 62vw" /></div><div><span>UPCOMING · {formatKoreanDate(upcoming[0].date)}</span><strong>{upcoming[0].title}</strong><b>세미나 신청하기 →</b></div></Link><div className="program-list">{upcoming.slice(0, 3).map((item) => <article key={item.id}><div><time>{formatKoreanDate(item.date)}</time><span>{item.category}</span></div><h3>{item.title}</h3><p>{item.time}<br />{item.location}</p><Link href={`/apply?type=schedule&schedule=${item.id}`}>신청하기 →</Link></article>)}</div></> : <div className="program-empty-card"><span>PROGRAM & SCHEDULE</span><strong>새로운 교육 일정을 준비하고 있습니다.</strong><p>강의와 세미나 일정이 확정되면 이곳에서 안내합니다.</p></div>}
        </div>
      </div></section>

      <section className="portal-section home-platform-section"><div className="container">
        <div className="portal-section-head" data-reveal><div><span className="eyebrow">MINISTRY AI PLATFORM</span><h2>읽는 연구에서, 쓰는 도구로</h2></div><p>연구·교육·도구·동역을 하나의 홈페이지에서 연결합니다.</p></div>
        <div className="home-platform-grid" data-reveal><Link href="/gpts"><span>01 · GPTs</span><h3>무료·판매 GPT</h3><p>목회와 교회 업무에 맞춘 AI 도구를 공개합니다.</p><b>살펴보기 →</b></Link><Link href="/apps"><span>02 · APPS</span><h3>연구 결과 앱</h3><p>연구 결과를 실제 사용할 수 있는 웹앱으로 연결합니다.</p><b>앱 열기 →</b></Link><Link href="/partners"><span>03 · PARTNERS</span><h3>파트너 교회·개인</h3><p>함께 연구하고 현장에서 실험할 동역자를 모집합니다.</p><b>함께하기 →</b></Link><Link href="/replays"><span>04 · REPLAY</span><h3>세미나 다시보기</h3><p>신청 정보를 남기고 지난 교육을 이어서 학습합니다.</p><b>다시보기 →</b></Link></div>
      </div></section>

      <section className="portal-section institute-profile"><div className="container institute-profile-grid" data-reveal>
        <div className="profile-portrait"><Image src="/images/about/director-baekhyungjin.png" alt="백형진 목회AI연구소 소장" fill sizes="(max-width: 760px) 88vw, 340px" /></div>
        <div className="profile-statement"><span className="eyebrow">ABOUT THE INSTITUTE</span><blockquote>“기술보다 사람을,<br />도구보다 사명을 먼저 생각합니다.”</blockquote><p>안양선민교회 목회 현장을 기반으로 설교 연구, 교회 행정, 콘텐츠 제작과 AI 윤리를 함께 연구합니다.</p><div><Link href="/about" className="btn btn-primary">연구소 소개</Link><Link href="/projects" className="btn btn-tertiary">사역 프로젝트</Link></div></div>
        <div className="profile-note"><strong>백형진 소장</strong><span>안양선민교회 담임목사<br />AI 목회 활용 연구자·교육자</span></div>
      </div></section>

      <section className="portal-contact"><div className="container portal-contact-inner" data-reveal><div><span>CONTACT</span><h2 className="fluid-display-title"><span>교회에 필요한 AI 활용,</span>{' '}<span>함께 설계하겠습니다.</span></h2></div><div><p>강의, 컨설팅, 협력 프로젝트에 관해 현재의 고민부터 편하게 남겨주세요.</p><Link href="/apply" className="btn btn-white">문의 및 강의 신청 →</Link></div></div></section>
    </>
  );
}
