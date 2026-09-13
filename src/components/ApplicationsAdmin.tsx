'use client';

import { useState } from 'react';
import { deleteRecord, updateRecord } from '@/lib/repository';
import { seedApplications } from '@/lib/seed-data';
import { ApplicationItem, ApplicationStatus } from '@/lib/types';
import { useRecords } from '@/lib/use-records';
import { downloadCsv } from '@/lib/csv';

const statusLabels: Record<ApplicationStatus, string> = { new: '새 접수', contacted: '연락 완료', confirmed: '확정', closed: '종료' };

export default function ApplicationsAdmin() {
  const { records, error: loadError } = useRecords<ApplicationItem>('applications', seedApplications);
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const items = [...records].filter((item) => (filter === 'all' || item.status === filter) && (!normalizedQuery || [item.name, item.church, item.email, item.phone, item.message, item.scheduleTitle].some((value) => value?.toLowerCase().includes(normalizedQuery)))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function changeStatus(item: ApplicationItem, status: ApplicationStatus) {
    setMessage('');
    try {
      await updateRecord<ApplicationItem>('applications', item.id, { status });
      setMessage(status === 'confirmed' && item.kind === 'lecture' ? '강의를 확정하고 해당 날짜를 일정표에서 자동 차단했습니다.' : '접수 상태를 저장했습니다.');
    } catch (error) {
      setMessage(error instanceof Error && error.message.includes('DATE_ALREADY_BOOKED') ? '이미 등록된 일정이 있는 날짜라 확정할 수 없습니다.' : '상태를 저장하지 못했습니다. 다시 시도해 주세요.');
    }
  }

  function exportItems() {
    downloadCsv(`문의-신청-${new Date().toISOString().slice(0, 10)}.csv`, ['구분', '상태', '성함', '교회·기관', '직분', '연락처', '이메일', '희망 날짜', '신청 일정', '내용', '접수일'], items.map((item) => [item.kind, statusLabels[item.status], item.name, item.church, item.role, item.phone, item.email, item.requestedDate, item.scheduleTitle, item.message, item.createdAt]));
  }

  return <div><header className="admin-page-header"><div><span>REQUESTS</span><h1>문의·신청 관리</h1><p>접수 내용을 확인하고 진행 상태를 조율합니다.</p></div></header>
    <div className="admin-list-tools"><label>신청 검색<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름, 교회, 이메일, 내용" /></label><button type="button" className="btn btn-secondary" onClick={exportItems} disabled={!items.length}>CSV 내려받기</button></div>
    <div className="filter-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체 {records.length}</button>{(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => <button className={filter === status ? 'active' : ''} onClick={() => setFilter(status)} key={status}>{statusLabels[status]} {records.filter((item) => item.status === status).length}</button>)}</div>
    {(loadError || message) && <div className={loadError ? 'form-error' : 'form-success'} role="status">{loadError || message}</div>}
    <div className="request-list">{items.map((item) => <article className="request-card" key={item.id}><div className="request-card-head"><div><span className="badge badge-blue">{item.kind === 'lecture' ? '강의 요청' : item.kind === 'schedule' ? '일정 신청' : '일반 문의'}</span><h2>{item.name} <small>{item.role}</small></h2><p>{item.church}</p></div><select value={item.status} onChange={(event) => void changeStatus(item, event.target.value as ApplicationStatus)}>{(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></div>{item.scheduleTitle && <div className="request-event">신청 일정 <strong>{item.scheduleTitle}</strong></div>}{item.requestedDate && <div className="request-event">희망 날짜 <strong>{item.requestedDate}</strong></div>}<p className="request-message">{item.message}</p><div className="request-contact"><a href={`tel:${item.phone}`}>{item.phone}</a><a href={`mailto:${item.email}`}>{item.email}</a><time>{new Date(item.createdAt).toLocaleString('ko-KR')}</time><button type="button" onClick={() => { if (confirm('이 접수 데이터를 삭제할까요?')) void deleteRecord<ApplicationItem>('applications', item.id).catch(() => setMessage('삭제하지 못했습니다. 다시 시도해 주세요.')); }}>삭제</button></div></article>)}{!items.length && <div className="empty-state">검색 조건에 맞는 신청이 없습니다.</div>}</div>
  </div>;
}
