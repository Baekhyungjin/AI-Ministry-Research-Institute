'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { inquiryFaqs, InquiryFaq } from '@/lib/inquiry-faq';

const categoryPrompts = ['세미나 신청', '다시보기', '강의 요청', '입금 확인', 'GPT·앱', '파트너'];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^0-9a-z가-힣\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function findAnswers(query: string) {
  const normalized = normalize(query);
  const words = normalized.split(' ').filter((word) => word.length > 1);
  if (!normalized) return [];
  return inquiryFaqs.map((item) => {
    const question = normalize(item.question);
    const content = normalize(`${item.category} ${item.question} ${item.answer}`);
    let score = question.includes(normalized) ? 20 : 0;
    for (const word of words) {
      if (question.includes(word)) score += 5;
      else if (content.includes(word)) score += 2;
    }
    return { item, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map(({ item }) => item);
}

export default function InquiryAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [answers, setAnswers] = useState<InquiryFaq[]>([]);
  const [showAll, setShowAll] = useState(false);
  const categories = useMemo(() => Array.from(new Set(inquiryFaqs.map((item) => item.category))), []);

  if (pathname.startsWith('/admin') || pathname === '/login') return null;

  function ask(value: string) {
    setQuery(value);
    setSubmittedQuery(value);
    setAnswers(findAnswers(value));
    setShowAll(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(query);
  }

  return <>
    <div className="floating-site-actions" aria-label="홈페이지 빠른 메뉴">
      <Link href="/replays" className="floating-replay-link"><span>▶</span><b>세미나<br />다시보기</b></Link>
      <button type="button" className="assistant-launcher" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span>?</span><b>문의<br />도우미</b></button>
    </div>
    {open && <section className="inquiry-assistant" aria-label="목회AI연구소 문의 도우미">
      <header><div><span>MINISTRY AI GUIDE</span><h2>무엇을 도와드릴까요?</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="문의 도우미 닫기">×</button></header>
      <p className="assistant-notice">AI가 아닌, 연구소가 미리 작성한 100개 답변에서 찾아드립니다.</p>
      <form onSubmit={submit}><label htmlFor="assistant-query">질문 입력</label><div><input id="assistant-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 다시보기는 어떻게 신청하나요?" /><button type="submit">찾기</button></div></form>
      {!submittedQuery && <div className="assistant-prompts"><span>자주 묻는 주제</span><div>{categoryPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => ask(prompt)}>{prompt}</button>)}</div></div>}
      {submittedQuery && <div className="assistant-results" aria-live="polite"><div className="assistant-question"><span>질문</span><p>{submittedQuery}</p></div>{answers.length ? answers.map((item, index) => <article key={item.question}><span>{index === 0 ? '가장 가까운 답변' : item.category}</span><h3>{item.question}</h3><p>{item.answer}</p>{item.href && (item.href.startsWith('http') ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.linkLabel ?? '바로가기'} →</a> : <Link href={item.href} onClick={() => setOpen(false)}>{item.linkLabel ?? '바로가기'} →</Link>)}</article>) : <article className="assistant-no-answer"><h3>준비된 답변에서 찾지 못했습니다.</h3><p>문의 페이지에 내용을 남기면 직접 확인해 안내하겠습니다.</p><Link href="/apply" onClick={() => setOpen(false)}>직접 문의하기 →</Link></article>}</div>}
      <div className="assistant-footer"><button type="button" onClick={() => setShowAll((value) => !value)}>{showAll ? '전체 질문 닫기' : `전체 질문 ${inquiryFaqs.length}개 보기`}</button><Link href="/apply" onClick={() => setOpen(false)}>직접 문의</Link></div>
      {showAll && <div className="assistant-all-questions">{categories.map((category) => <div key={category}><strong>{category}</strong>{inquiryFaqs.filter((item) => item.category === category).map((item) => <button type="button" key={item.question} onClick={() => ask(item.question)}>{item.question}</button>)}</div>)}</div>}
    </section>}
  </>;
}
