import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '사역과 프로젝트',
  description: '목회AI연구소가 교회 현장에서 연구하고 실행하는 교육, 도구, 콘텐츠 프로젝트를 소개합니다.',
};

const projectAreas = [
  { number: '01', title: '목회자 AI 실전교육', description: '목회자의 실제 업무를 기준으로 설교 연구, 행정, 콘텐츠 제작을 함께 실습합니다.', status: '운영 중' },
  { number: '02', title: '교회용 AI 도구 연구', description: '복잡한 기술 없이도 작은 교회가 사용할 수 있는 웹앱과 반복 업무 체계를 개발합니다.', status: '연구 중' },
  { number: '03', title: 'AI 목회 윤리 가이드', description: '개인정보, 저작권, 신학적 책임을 교회 현장에서 적용할 수 있는 기준으로 정리합니다.', status: '발행 준비' },
  { number: '04', title: '목회AI 월간 아카이브', description: '한 달의 연구와 교육, 활용 사례를 매거진과 파트너 레터로 기록해 공유합니다.', status: '매월 발행' },
  { number: '05', title: '다음세대·선교 교육', description: 'AI 시대의 캠퍼스 선교와 다음세대 교육을 위한 새로운 사역 방식을 실험합니다.', status: '협력 중' },
  { number: '06', title: '지역사회 AI 교육', description: '장애인과 디지털 소외 계층이 창작의 기쁨을 경험하도록 공공교육을 확장합니다.', status: '현장 운영' },
];

const serviceLinks = [
  { title: '교회 홍보·전도 퍼널', description: '리드 마그넷부터 안내·후속 연결까지 교회 상황에 맞춘 SNS 구조 설계 서비스입니다.', href: 'https://meek-duckanoo-c31365.netlify.app/', label: '서비스 보기 ↗' },
  { title: '연구 결과 앱', description: '연구를 실제 사용할 수 있는 웹앱과 목회 도구로 연결합니다.', href: '/apps', label: '연구 앱 보기 →' },
  { title: '맞춤 GPT 제작', description: '교회와 기관의 반복 업무에 맞는 전용 GPT 설계를 상담합니다.', href: '/gpts', label: 'GPT 목록 보기 →' },
];

export default function ProjectsPage() {
  return (
    <>
      <section className="projects-hero">
        <div className="container projects-hero-grid">
          <div><span className="eyebrow eyebrow-light">MINISTRY & PROJECTS</span><h1>연구를 현장으로,<br />현장을 다시 연구로.</h1></div>
          <p>교회에서 발견한 문제를 작은 실험으로 풀고, 검증된 결과를 교육·도구·콘텐츠로 다시 나눕니다.</p>
        </div>
      </section>

      <section className="page-section project-feature-section">
        <div className="container">
          <div className="portal-section-head"><div><span className="eyebrow">CURRENT PROJECTS</span><h2>지금 진행하는 일</h2></div><Link href="/apply?type=inquiry" className="text-link">협력 제안하기 →</Link></div>
          <div className="project-feature-grid">
            <article className="project-visual-card wide">
              <div><Image src="/images/archive/2026-09/programs/ministry-app-seminar.png" alt="바이브코딩 사역 앱 세미나" fill sizes="(max-width: 760px) 100vw, 56vw" /></div>
              <span>도구 개발 · 교육</span><h2>목회 아이디어를<br />실제 사역 앱으로</h2><p>현장의 필요를 직접 작동하는 작은 도구로 만드는 바이브코딩 연구와 실습입니다.</p>
            </article>
            <article className="project-visual-card">
              <div><Image src="/images/archive/2026-08/books/ai-power-watch-church.png" alt="AI 권력 감시와 교회 출판물" fill sizes="(max-width: 760px) 100vw, 28vw" /></div>
              <span>연구 · 출판</span><h2>AI 시대의 교회와 윤리</h2><p>기술의 영향력을 분별하고 교회가 지켜야 할 책임을 글과 자료로 정리합니다.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="portal-section project-map-section">
        <div className="container">
          <div className="portal-section-head"><div><span className="eyebrow">PROJECT MAP</span><h2>여섯 개의 사역 영역</h2></div></div>
          <div className="project-area-grid">{projectAreas.map((item) => <article key={item.number}><div><span>{item.number}</span><b>{item.status}</b></div><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
        </div>
      </section>

      <section className="project-process">
        <div className="container project-process-grid">
          <div><span className="eyebrow eyebrow-light">HOW WE WORK</span><h2>질문에서 시작해<br />공유 가능한 결과까지</h2></div>
          <ol><li><b>01</b><span><strong>현장 질문</strong>교회와 목회자의 실제 어려움을 듣습니다.</span></li><li><b>02</b><span><strong>작은 실험</strong>AI가 도울 수 있는 범위와 기준을 정합니다.</span></li><li><b>03</b><span><strong>현장 검증</strong>직접 사용하고 반복해 현실성을 확인합니다.</span></li><li><b>04</b><span><strong>교육과 공유</strong>누구나 따라 할 수 있는 자료로 나눕니다.</span></li></ol>
        </div>
      </section>

      <section className="page-section service-link-section"><div className="container"><div className="portal-section-head"><div><span className="eyebrow">CONNECTED SERVICES</span><h2>연구에서 서비스로</h2></div></div><div className="service-link-grid">{serviceLinks.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p>{item.href.startsWith('http') ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a> : <Link href={item.href}>{item.label}</Link>}</article>)}</div></div></section>

      <section className="portal-contact"><div className="container portal-contact-inner"><div><span>COLLABORATION</span><h2>함께 풀어야 할<br />목회 현장의 질문이 있나요?</h2></div><div><p>교회, 노회, 기관과의 교육 및 공동 연구를 기다립니다.</p><Link href="/apply?type=inquiry" className="btn btn-white">협력 문의하기 →</Link></div></div></section>
    </>
  );
}
