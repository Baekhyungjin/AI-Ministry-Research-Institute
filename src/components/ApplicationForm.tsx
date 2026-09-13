'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { seedSchedules } from '@/lib/seed-data';
import { ApplicationKind, ScheduleItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

export default function ApplicationForm() {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get('type');
  const requestedSchedule = searchParams.get('schedule');
  const requestedDateFromUrl = searchParams.get('date') ?? '';
  const initialKind: ApplicationKind = requestedType === 'lecture' || requestedType === 'schedule' ? requestedType : 'inquiry';
  const [kind, setKind] = useState<ApplicationKind>(initialKind);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [requestedDate, setRequestedDate] = useState(requestedDateFromUrl);
  const { records: schedules } = useRecords<ScheduleItem>('schedules', seedSchedules);
  const selected = useMemo(() => schedules.find((item) => item.id === requestedSchedule), [requestedSchedule, schedules]);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const hasConflict = kind === 'lecture' && requestedDate && schedules.some((item) => item.date === requestedDate);
    if (hasConflict) {
      setError('이미 일정이 있는 날짜입니다. 일정표에서 다른 날짜를 선택해 주세요.');
      setSaving(false);
      return;
    }
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'application', payload: {
          kind, name: form.get('name'), church: form.get('church'), role: form.get('role'), phone: form.get('phone'),
          email: form.get('email'), message: form.get('message'), scheduleId: selected?.id, scheduleTitle: selected?.title,
          requestedDate: kind === 'lecture' ? requestedDate : null, consent: form.get('consent') === 'on', website: form.get('website'),
        } }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || '접수에 실패했습니다.');
      setSubmitted(true);
      event.currentTarget.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally { setSaving(false); }
  }

  if (submitted) return <div className="success-panel"><span>접수 완료</span><h2>소중한 내용을 보내주셔서 감사합니다.</h2><p>담당자가 확인한 뒤 입력하신 연락처로 안내드리겠습니다.</p><button className="btn btn-secondary" type="button" onClick={() => setSubmitted(false)}>추가 문의 남기기</button></div>;

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      <div className="form-section"><span className="form-step">01</span><div><h2>어떤 도움이 필요하신가요?</h2><div className="choice-grid">
        {([['inquiry', '일반·협업 문의', '연구소 및 협업에 관해 묻습니다.'], ['lecture', '강의·컨설팅 요청', '교회 또는 기관에 맞는 강의를 요청합니다.'], ['schedule', '등록 일정 신청', '공개된 교육 일정에 참여합니다.']] as const).map(([value, title, description]) => <label className={kind === value ? 'choice-card selected' : 'choice-card'} key={value}><input type="radio" name="kind" value={value} checked={kind === value} onChange={() => setKind(value)} /><strong>{title}</strong><span>{description}</span></label>)}
      </div>{selected && <div className="selected-event"><span>선택한 일정</span><strong>{selected.title}</strong><p>{selected.date} · {selected.time} · {selected.location}</p></div>}{kind === 'lecture' && <div className="requested-date-field"><label>희망 날짜<input type="date" name="requestedDate" min={today} value={requestedDate} onChange={(event) => { setRequestedDate(event.target.value); setError(''); }} required /></label><p>등록된 일정이 있는 날은 선택할 수 없습니다. <Link href="/schedule">소장 일정 달력 확인 →</Link></p>{requestedDate && schedules.some((item) => item.date === requestedDate) && <strong role="alert">이 날짜에는 이미 일정이 있습니다. 다른 날짜를 선택해 주세요.</strong>}</div>}{kind === 'schedule' && !selected && <div className="requested-date-field"><strong>먼저 공개 교육 일정을 선택해 주세요.</strong><p><Link href="/schedule">신청 가능한 교육 일정 보기 →</Link></p></div>}</div></div>
      <div className="form-section"><span className="form-step">02</span><div><h2>연락받을 정보를 알려주세요.</h2><div className="form-grid"><label>성함<input name="name" required placeholder="성함을 입력하세요" /></label><label>교회·기관명<input name="church" required placeholder="소속을 입력하세요" /></label><label>직분·담당 역할<input name="role" placeholder="예: 담임목사, 교육 담당" /></label><label>연락처<input name="phone" required placeholder="010-0000-0000" /></label><label className="full">이메일<input type="email" name="email" required placeholder="name@example.com" /></label></div></div></div>
      <div className="form-section"><span className="form-step">03</span><div><h2>필요한 내용을 들려주세요.</h2><label className="textarea-label">문의 내용<textarea name="message" rows={7} required placeholder="현재 상황, 예상 인원, 희망 일정, 필요한 교육 내용을 적어 주세요." /></label><input className="form-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /><label className="consent-row"><input type="checkbox" name="consent" required /><span>문의 처리 및 연락을 위한 개인정보 수집·이용에 동의합니다. <Link href="/privacy" target="_blank">내용 보기</Link></span></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="btn btn-primary submit-button" disabled={saving || Boolean(kind === 'lecture' && requestedDate && schedules.some((item) => item.date === requestedDate))}>{saving ? '접수 중…' : '문의 및 신청 접수하기'}</button></div></div>
    </form>
  );
}
