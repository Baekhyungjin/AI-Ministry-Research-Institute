'use client';

import Link from 'next/link';
import { seedSchedules } from '@/lib/seed-data';
import { ScheduleItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

export default function ScheduleListing() {
  const { records, loading } = useRecords<ScheduleItem>('schedules', seedSchedules);
  const items = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  if (loading) return <div className="loading-line">일정을 불러오는 중입니다.</div>;
  return (
    <div className="event-grid">
      {items.map((item, index) => {
        const isPast = item.date < today;
        const isOpen = item.status === 'open' && !isPast;
        return (
        <article className={`event-card event-tone-${(index % 3) + 1}`} key={item.id}>
          <div className="event-date"><strong>{item.date.slice(8, 10)}</strong><span>{item.date.slice(5, 7)}월 · {item.date.slice(0, 4)}</span></div>
          <div className="event-body">
            <div className="content-meta"><span>{item.category}</span><b className={`badge ${isOpen ? 'badge-success' : ''}`}>{isOpen ? '신청 가능' : isPast ? '지난 일정' : '마감'}</b></div>
            <h2>{item.title}</h2><p>{item.description}</p>
            <dl><div><dt>시간</dt><dd>{item.time}</dd></div><div><dt>장소</dt><dd>{item.location}</dd></div><div><dt>정원</dt><dd>{item.capacity}명</dd></div></dl>
            {isOpen ? <Link href={`/apply?type=schedule&schedule=${item.id}`} className="btn btn-primary">이 일정 신청하기</Link> : <span className="btn btn-disabled">{isPast ? '일정 종료' : '신청 마감'}</span>}
          </div>
        </article>
      )})}
      {!items.length && <div className="empty-state">등록된 일정이 없습니다.</div>}
    </div>
  );
}
