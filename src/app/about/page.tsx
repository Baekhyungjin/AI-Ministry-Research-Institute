import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = { title: '연구소 소개', description: '목회AI연구소의 사명, 연구 방식과 백형진 소장을 소개합니다.' };

const ministries = [
  ['01', '지역교회 목회', '안양선민교회 현장이 모든 AI 연구의 기준점입니다.'],
  ['02', 'AI 활용 연구', '새로운 기술을 신학·윤리·실무의 관점에서 검토합니다.'],
  ['03', '목회자 교육', '온라인과 지역 세미나에서 직접 결과물을 만드는 실습을 진행합니다.'],
  ['04', '교회용 도구 개발', '설교, 행정, 일정과 콘텐츠 업무를 돕는 도구를 만듭니다.'],
  ['05', '콘텐츠·출판', '책, 매거진, 보고서와 교육자료로 연구를 나눕니다.'],
  ['06', '선교·공공교육', '선교사, 다음세대와 소외 계층을 위한 교육을 확장합니다.'],
];

export default function AboutPage() {
  return <>
    <section className="about-hero"><div className="container"><span className="eyebrow eyebrow-light">ABOUT MINISTRY AI LAB</span><h1>기술을 가르치지만,<br />사람을 향합니다.</h1><p>목회AI연구소는 교회를 대신하는 기술이 아니라<br />목회의 본질을 지키도록 돕는 기술을 연구합니다.</p></div></section>
    <section className="section"><div className="container about-grid"><div><span className="eyebrow">OUR QUESTION</span><h2>“AI가 목회를 대신할 수 있을까?”가 아니라,<br />“목회자는 무엇에 더 집중해야 하는가?”를 묻습니다.</h2></div><div><p>반복되는 자료 조사와 행정은 기술이 도울 수 있습니다. 그러나 말씀을 해석하고, 한 사람의 이야기를 듣고, 공동체를 책임지는 일은 목회자의 고유한 사명입니다.</p><p>연구소는 현장에서 발견한 문제를 AI로 실험하고, 교회에서 검증한 뒤 누구나 따라 할 수 있는 교육과 도구로 나눕니다.</p></div></div></section>
    <section className="section director-profile-section"><div className="container director-profile"><div className="director-profile-image"><Image src="/images/about/director-baekhyungjin.png" alt="백형진 목회AI연구소 소장" fill sizes="(max-width: 800px) 100vw, 40vw" priority /></div><div><span className="eyebrow">DIRECTOR</span><h2>백형진 소장</h2><p className="director-role">안양선민교회 담임목사 · 목회AI연구소 소장<br />AI 목회 활용 연구자 · 교육자 · 개발자 · 저자</p><p>설교 준비, 성경 연구, 행정 자동화, 이미지·영상 제작과 웹앱 활용을 목회자의 언어로 연구하고 교육합니다. 기술 자체를 자랑하기보다, 작은 교회도 실제로 사용할 수 있는 결과물을 먼저 만드는 것을 중요하게 생각합니다.</p><a href="https://open.kakao.com/o/smi51Hqi" target="_blank" rel="noopener noreferrer" className="btn btn-primary">백형진 소장에게 문의하기</a></div></div></section>
    <section className="section soft-section"><div className="container"><div className="section-heading"><span className="eyebrow">MINISTRY MAP</span><h2>하나의 현장에서 이어지는 여섯 사역</h2></div><div className="ministry-grid">{ministries.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
    <section className="section"><div className="container"><div className="cta-card blue-cta"><div><span className="eyebrow eyebrow-light">WORK WITH US</span><h2>교회에 맞는 AI 활용을<br />함께 시작하세요.</h2></div><div><p>강의와 컨설팅, 협업 문의를 기다립니다.</p><Link href="/apply" className="btn btn-white">연구소에 문의하기 →</Link></div></div></div></section>
  </>;
}
