'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { seedSchedules } from '@/lib/seed-data';
import { ScheduleItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
const pad = (value: number) => String(value).padStart(2, '0');
const toDateKey = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

function koreanToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export default function ScheduleCalendar() {
  const { records, loading } = useRecords<ScheduleItem>('schedules', seedSchedules);
  const now = new Date();
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const today = koreanToday();
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => {
    const leading = (new Date(year, month, 1).getDay() + 6) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();
    return [...Array<null>(leading).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)];
  }, [month, year]);

  function moveMonth(amount: number) {
    setCursor(new Date(year, month + amount, 1));
  }

  return <section className="availability-calendar" aria-labelledby="availability-title">
    <div className="availability-heading">
      <div><span>DIRECTOR&apos;S AVAILABILITY</span><h2 id="availability-title">백형진 소장 일정 확인</h2><p>일정이 등록된 날은 피하고, 비어 있는 날짜를 선택해 강의와 협업을 문의할 수 있습니다.</p></div>
      <div className="calendar-controls"><button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">←</button><strong>{year}년 {month + 1}월</strong><button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">→</button></div>
    </div>
    <div className="calendar-legend" aria-label="일정 상태 안내"><span className="available">문의 가능</span><span className="occupied">일정 있음</span><span className="event-open">교육 신청 가능</span></div>
    {loading ? <div className="loading-line">달력을 불러오는 중입니다.</div> : <div className="calendar-grid" role="grid">
      {weekdays.map((day) => <div className="calendar-weekday" role="columnheader" key={day}>{day}</div>)}
      {cells.map((day, index) => {
        if (!day) return <div className="calendar-day empty" key={`empty-${index}`} aria-hidden="true" />;
        const dateKey = toDateKey(year, month, day);
        const events = records.filter((item) => item.date === dateKey);
        const isPast = dateKey < today;
        const openEvent = events.find((item) => item.status === 'open' && !isPast);
        const className = isPast ? 'past' : events.length ? openEvent ? 'event-open' : 'occupied' : 'available';
        return <div className={`calendar-day ${className}`} role="gridcell" key={dateKey}>
          <time dateTime={dateKey}>{day}</time>
          {isPast ? <span className="calendar-day-copy">지난 날짜</span> : events.length ? <>
            <strong className="calendar-day-copy">{events[0].title}</strong>
            {openEvent ? <Link href={`/apply?type=schedule&schedule=${openEvent.id}`} aria-label={`${dateKey} ${openEvent.title} 신청하기`}>교육 신청</Link> : <span className="calendar-day-copy">일정 있음</span>}
          </> : <Link href={`/apply?type=lecture&date=${dateKey}`} aria-label={`${dateKey} 강의 일정 문의하기`}>강의 문의</Link>}
        </div>;
      })}
    </div>}
    <p className="calendar-help">※ 달력의 빈 날짜는 확정이 아닌 문의 가능한 날짜입니다. 최종 일정은 신청 내용을 확인한 뒤 조율합니다.</p>
  </section>;
}
