import type { Metadata } from 'next';
import ReplayCatalog from '@/components/ReplayCatalog';
export const metadata: Metadata = { title: '세미나 다시보기', description: '목회AI연구소 세미나 다시보기를 신청하고 시청하세요.' };
export default function ReplaysPage() { return <section className="page-section"><div className="container"><header className="page-hero"><span className="eyebrow">SEMINAR REPLAY</span><h1>현장의 배움을<br />다시 이어갑니다.</h1><p>기본 정보를 남기면 세미나 다시보기 페이지로 연결됩니다.</p></header><ReplayCatalog /></div></section>; }
