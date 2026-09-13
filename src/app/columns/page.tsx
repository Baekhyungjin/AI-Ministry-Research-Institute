import type { Metadata } from 'next';
import ContentListing from '@/components/ContentListing';

export const metadata: Metadata = { title: '칼럼', description: 'AI와 목회 현장을 연결하는 목회AI연구소 칼럼입니다.' };
export default function ColumnsPage() { return <section className="page-section"><div className="container"><header className="page-hero"><span className="eyebrow">COLUMN & RESEARCH</span><h1>기술의 속도를 넘어,<br />목회의 방향을 생각합니다.</h1><p>AI 기술과 신학, 실제 목회 현장을 함께 읽는 연구소의 기록입니다.</p></header><ContentListing kind="column" /></div></section>; }
