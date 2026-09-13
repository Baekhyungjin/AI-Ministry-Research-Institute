'use client';

import Link from 'next/link';
import { seedApplications, seedContents, seedSchedules } from '@/lib/seed-data';
import { ApplicationItem, ContentItem, ScheduleItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

export default function AdminDashboard() {
  const { records: applications } = useRecords<ApplicationItem>('applications', seedApplications);
  const { records: contents } = useRecords<ContentItem>('contents', seedContents);
  const { records: schedules } = useRecords<ScheduleItem>('schedules', seedSchedules);
  const recent = [...applications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return <div><header className="admin-page-header"><div><span>OVERVIEW</span><h1>오늘의 운영 현황</h1><p>신청과 콘텐츠, 일정을 한눈에 확인하세요.</p></div><Link href="/admin/content" className="btn btn-primary">새 글 등록</Link></header>
    <div className="metric-grid"><article className="metric coral"><span>새 문의·신청</span><strong>{applications.filter((item) => item.status === 'new').length}</strong><small>확인이 필요한 접수</small></article><article className="metric magenta"><span>발행 콘텐츠</span><strong>{contents.filter((item) => item.status === 'published').length}</strong><small>칼럼과 공지 합계</small></article><article className="metric blue"><span>신청 가능 일정</span><strong>{schedules.filter((item) => item.status === 'open').length}</strong><small>현재 공개된 프로그램</small></article></div>
    <section className="admin-panel"><div className="panel-heading"><div><span>RECENT REQUESTS</span><h2>최근 문의 및 신청</h2></div><Link href="/admin/applications">전체 보기 →</Link></div>
      {recent.length ? <div className="compact-table">{recent.map((item) => <div className="table-row" key={item.id}><div><span className="status-dot" /> <strong>{item.name}</strong></div><span>{item.church}</span><span>{item.kind === 'lecture' ? '강의 요청' : item.kind === 'schedule' ? '일정 신청' : '일반 문의'}</span><time>{item.createdAt.slice(0, 10)}</time></div>)}</div> : <div className="empty-state small">아직 접수된 문의가 없습니다. 공개 페이지에서 신청 흐름을 테스트할 수 있습니다.</div>}
    </section>
    <div className="admin-quick-grid"><Link href="/admin/applications"><span>01</span><strong>신청 데이터 확인</strong><p>연락 전, 확인, 확정, 완료 상태로 관리합니다.</p></Link><Link href="/admin/content"><span>02</span><strong>칼럼·공지 발행</strong><p>초안과 공개 상태를 구분해 콘텐츠를 운영합니다.</p></Link><Link href="/admin/schedules"><span>03</span><strong>강의 일정 조율</strong><p>일정을 등록하고 신청 가능 여부를 즉시 변경합니다.</p></Link></div>
  </div>;
}
