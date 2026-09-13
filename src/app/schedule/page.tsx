import type { Metadata } from 'next';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import ScheduleListing from '@/components/ScheduleListing';

export const metadata: Metadata = { title: '강의 일정', description: '목회AI연구소의 워크숍과 세미나 일정을 확인하고 신청하세요.' };
export default function SchedulePage() { return <section className="page-section"><div className="container"><header className="page-hero"><span className="eyebrow">PROGRAM & SCHEDULE</span><h1>일정을 먼저 확인하고,<br />가능한 날에 신청하세요.</h1><p>백형진 소장의 강의·세미나·사역 일정을 월간 달력에서 확인할 수 있습니다.</p></header><ScheduleCalendar /><div className="schedule-listing-heading"><span>OPEN PROGRAMS</span><h2>공개 교육·세미나</h2><p>신청 가능한 공개 일정은 아래에서 상세 내용을 확인하고 바로 등록할 수 있습니다.</p></div><ScheduleListing /></div></section>; }
