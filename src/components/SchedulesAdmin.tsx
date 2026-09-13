'use client';

import { FormEvent, useState } from 'react';
import { createId, createRecord, deleteRecord, updateRecord } from '@/lib/repository';
import { seedSchedules } from '@/lib/seed-data';
import { ScheduleItem, ScheduleStatus } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

export default function SchedulesAdmin() {
  const { records } = useRecords<ScheduleItem>('schedules', seedSchedules);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function beginEdit(item: ScheduleItem) {
    setEditing(item);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetEditor() {
    setEditing(null);
    setMessage('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const values = {
      title: String(form.get('title')).trim(), category: String(form.get('category')).trim(),
      date: String(form.get('date')), time: String(form.get('time')).trim(), location: String(form.get('location')).trim(),
      capacity: Number(form.get('capacity')), status: String(form.get('status')) as ScheduleStatus,
      description: String(form.get('description')).trim(),
    };
    try {
      if (editing) {
        await updateRecord<ScheduleItem>('schedules', editing.id, values);
        setEditing(null);
        setMessage('일정 변경 내용을 저장했습니다.');
      } else {
        await createRecord<ScheduleItem>('schedules', { id: createId('schedule'), ...values, createdAt: new Date().toISOString() });
        event.currentTarget.reset();
        setMessage('새 일정을 등록했습니다.');
      }
    } catch {
      setMessage('일정을 저장하지 못했습니다. 데이터 연결 상태를 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  return <div>
    <header className="admin-page-header"><div><span>CALENDAR</span><h1>일정 관리</h1><p>강의와 세미나를 등록하고 수정·마감·삭제할 수 있습니다.</p></div></header>
    <div className="admin-two-column">
      <form className="admin-form admin-panel" onSubmit={submit} key={editing?.id ?? 'new-schedule'}>
        <div className="panel-heading"><div><span>{editing ? 'EDIT SCHEDULE' : 'NEW SCHEDULE'}</span><h2>{editing ? '일정 수정' : '새 일정 등록'}</h2></div>{editing && <button type="button" className="admin-text-button" onClick={resetEditor}>수정 취소</button>}</div>
        <label>일정명<input name="title" defaultValue={editing?.title ?? ''} required /></label>
        <label>프로그램 유형<input name="category" defaultValue={editing?.category ?? ''} placeholder="예: 오프라인 강의" required /></label>
        <div className="form-grid"><label>날짜<input type="date" name="date" defaultValue={editing?.date ?? ''} required /></label><label>시간<input name="time" defaultValue={editing?.time ?? ''} placeholder="14:00–17:00" required /></label></div>
        <label>장소<input name="location" defaultValue={editing?.location ?? ''} required /></label>
        <div className="form-grid"><label>정원<input type="number" name="capacity" min="1" defaultValue={editing?.capacity ?? 20} required /></label><label>신청 상태<select name="status" defaultValue={editing?.status ?? 'open'}><option value="open">신청 가능</option><option value="closed">마감</option></select></label></div>
        <label>설명<textarea name="description" rows={5} defaultValue={editing?.description ?? ''} required /></label>
        {message && <div className="form-success" role="status">{message}</div>}
        <button className="btn btn-primary" disabled={saving}>{saving ? '저장 중…' : editing ? '변경 내용 저장' : '일정 등록하기'}</button>
      </form>
      <section className="admin-panel schedule-manage"><div className="panel-heading"><div><span>ALL SCHEDULES</span><h2>등록된 일정</h2></div><b>{records.length}</b></div>
        {[...records].sort((a,b) => a.date.localeCompare(b.date)).map((item) => <article key={item.id}><div className="manage-date"><strong>{item.date.slice(8,10)}</strong><span>{item.date.slice(5,7)}월</span></div><div><span className={`publish-state ${item.status === 'open' ? 'published' : 'draft'}`}>{item.status === 'open' ? '신청 가능' : '마감'}</span><h3>{item.title}</h3><p>{item.date} · {item.time}<br />{item.location} · 정원 {item.capacity}명</p><div className="inline-actions"><button type="button" onClick={() => beginEdit(item)}>수정</button><button type="button" onClick={() => updateRecord<ScheduleItem>('schedules', item.id, { status: item.status === 'open' ? 'closed' : 'open' })}>{item.status === 'open' ? '신청 마감' : '다시 열기'}</button><button type="button" className="danger" onClick={() => { if (confirm('이 일정을 삭제할까요?')) void deleteRecord<ScheduleItem>('schedules', item.id); }}>삭제</button></div></div></article>)}
      </section>
    </div>
  </div>;
}
