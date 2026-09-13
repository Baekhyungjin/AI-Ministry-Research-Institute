'use client';

import { useState } from 'react';
import { deleteRecord, updateRecord } from '@/lib/repository';
import { seedApplications } from '@/lib/seed-data';
import { ApplicationItem, ApplicationStatus } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const statusLabels: Record<ApplicationStatus, string> = { new: '새 접수', contacted: '연락 완료', confirmed: '확정', closed: '종료' };

export default function ApplicationsAdmin() {
  const { records } = useRecords<ApplicationItem>('applications', seedApplications);
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');
  const items = [...records].filter((item) => filter === 'all' || item.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return <div><header className="admin-page-header"><div><span>REQUESTS</span><h1>문의·신청 관리</h1><p>접수 내용을 확인하고 진행 상태를 조율합니다.</p></div></header>
    <div className="filter-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체 {records.length}</button>{(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => <button className={filter === status ? 'active' : ''} onClick={() => setFilter(status)} key={status}>{statusLabels[status]} {records.filter((item) => item.status === status).length}</button>)}</div>
    <div className="request-list">{items.map((item) => <article className="request-card" key={item.id}><div className="request-card-head"><div><span className="badge badge-blue">{item.kind === 'lecture' ? '강의 요청' : item.kind === 'schedule' ? '일정 신청' : '일반 문의'}</span><h2>{item.name} <small>{item.role}</small></h2><p>{item.church}</p></div><select value={item.status} onChange={(event) => updateRecord<ApplicationItem>('applications', item.id, { status: event.target.value as ApplicationStatus })}>{(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></div>{item.scheduleTitle && <div className="request-event">신청 일정 <strong>{item.scheduleTitle}</strong></div>}{item.requestedDate && <div className="request-event">희망 날짜 <strong>{item.requestedDate}</strong></div>}<p className="request-message">{item.message}</p><div className="request-contact"><a href={`tel:${item.phone}`}>{item.phone}</a><a href={`mailto:${item.email}`}>{item.email}</a><time>{new Date(item.createdAt).toLocaleString('ko-KR')}</time><button type="button" onClick={() => { if (confirm('이 접수 데이터를 삭제할까요?')) deleteRecord<ApplicationItem>('applications', item.id); }}>삭제</button></div></article>)}{!items.length && <div className="empty-state">해당 상태의 신청이 없습니다.</div>}</div>
  </div>;
}
