import type { Metadata } from 'next';
import ScheduleListing from '@/components/ScheduleListing';

export const metadata: Metadata = { title: '강의 일정', description: '목회AI연구소의 워크숍과 세미나 일정을 확인하고 신청하세요.' };
export default function SchedulePage() { return <section className="page-section"><div className="container"><header className="page-hero"><span className="eyebrow">PROGRAM & SCHEDULE</span><h1>배우고, 나누고,<br />현장에 적용하는 시간</h1><p>정규 워크숍부터 교회 맞춤형 강의까지 필요한 일정을 선택하세요.</p></header><ScheduleListing /></div></section>; }
