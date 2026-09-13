import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '목회 프롬프트 자료',
  description: '목회 현장에서 바로 참고할 수 있는 안전하고 책임 있는 AI 질문 예시를 제공합니다.',
};

export default function PromptsPage() {
  return <>
    <section className="prompt-hero"><div className="container prompt-hero-grid"><div><span className="eyebrow">PRACTICAL RESOURCE</span><h1>목회 현장을 위한<br />프롬프트 자료실</h1></div><div><p>AI에게 목회를 맡기는 문장이 아니라, 목회자의 생각과 책임을 더 분명하게 돕는 질문 예시를 제공합니다.</p><span>개인정보와 상담 내용은 공개형 AI에 입력하지 마세요.</span></div></div></section>
    <section className="page-section prompt-library"><div className="container">
      <div className="prompt-library-head"><div><strong>실전 프롬프트</strong><span>준비 중</span></div></div>
      <div className="empty-state">등록된 프롬프트 자료가 없습니다.</div>
    </div></section>
    <section className="prompt-request"><div className="container"><div><span>자료 요청</span><h2>필요한 목회 업무가<br />목록에 없나요?</h2></div><Link href="/apply?type=inquiry" className="btn btn-primary">프롬프트 자료 제안하기 →</Link></div></section>
  </>;
}
