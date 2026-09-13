import type { Metadata } from 'next';
import ContentListing from '@/components/ContentListing';

export const metadata: Metadata = { title: '공지사항', description: '목회AI연구소의 교육과 운영 소식을 확인하세요.' };
export default function NoticesPage() { return <section className="page-section"><div className="container"><header className="page-hero compact"><span className="eyebrow">NOTICE</span><h1>연구소의 새로운 소식</h1><p>교육 일정, 자료 업데이트, 운영 안내를 전합니다.</p></header><ContentListing kind="notice" /></div></section>; }
