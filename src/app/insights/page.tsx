import type { Metadata } from 'next';
import Link from 'next/link';
import InsightsLatest from '@/components/InsightsLatest';

export const metadata: Metadata = {
  title: '목회 인사이트',
  description: 'AI 기술과 목회 현장을 함께 읽는 목회AI연구소의 분석과 가이드입니다.',
};

export default function InsightsPage() {
  return <>
    <section className="insight-hero"><div className="container"><span className="eyebrow">INSIGHT & GUIDE</span><h1>기술을 따라가기보다,<br />목회의 기준을 세웁니다.</h1><p>새로운 AI 기술이 교회와 목회에 어떤 의미인지 분석하고, 현장에서 판단할 수 있는 기준으로 나눕니다.</p></div></section>
    <section className="page-section insight-list-section"><div className="container">
      <div className="insight-list-head"><span>최신 인사이트</span><span>RESEARCH SERIES</span></div>
      <InsightsLatest />
    </div></section>
    <section className="insight-principles"><div className="container"><div><span className="eyebrow eyebrow-light">OUR LENS</span><h2>모든 기술을 세 가지 질문으로 살핍니다.</h2></div><ol><li><b>01</b><strong>사람을 더 깊이 돌보게 하는가?</strong></li><li><b>02</b><strong>목회자의 책임과 판단을 지키는가?</strong></li><li><b>03</b><strong>작은 교회도 실제 사용할 수 있는가?</strong></li></ol></div></section>
    <section className="portal-contact"><div className="container portal-contact-inner"><div><span>ASK THE LAB</span><h2>함께 연구할 질문을<br />보내주세요.</h2></div><div><p>현장에서 마주한 AI 활용의 고민을 다음 연구 주제로 이어갑니다.</p><Link href="/apply?type=inquiry" className="btn btn-white">연구소에 문의하기 →</Link></div></div></section>
  </>;
}
