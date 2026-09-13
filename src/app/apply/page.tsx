import type { Metadata } from 'next';
import { Suspense } from 'react';
import ApplicationForm from '@/components/ApplicationForm';

export const metadata: Metadata = { title: '문의 및 강의 신청', description: '목회AI연구소에 강의, 컨설팅, 협업을 문의하세요.' };
export default function ApplyPage() { return <section className="page-section form-page"><div className="container"><header className="page-hero compact"><span className="eyebrow">CONTACT & APPLY</span><h1>필요한 도움부터<br />편하게 들려주세요.</h1><p>내용을 확인한 뒤 가장 적합한 방식으로 안내드리겠습니다.</p></header><Suspense fallback={<div className="loading-line">신청서를 준비하는 중입니다.</div>}><ApplicationForm /></Suspense></div></section>; }
