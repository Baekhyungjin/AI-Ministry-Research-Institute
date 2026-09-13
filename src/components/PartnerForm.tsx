'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function PartnerForm() {
  const [type, setType] = useState<'church' | 'individual'>('church');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'partner', payload: { partnerType: type, name: form.get('name'), church: form.get('church'), role: form.get('role'), phone: form.get('phone'), email: form.get('email'), message: form.get('message'), consent: form.get('consent') === 'on', website: form.get('website') } }) });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || '파트너 신청을 저장하지 못했습니다.');
      setDone(true); event.currentTarget.reset();
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : '신청을 저장하지 못했습니다. 카카오톡으로 문의해 주세요.'); } finally { setSaving(false); }
  }
  if (done) return <div className="success-panel"><span>PARTNER REQUEST RECEIVED</span><h2>파트너 신청이 접수되었습니다.</h2><p>내용을 확인한 뒤 입력하신 연락처로 안내드리겠습니다.</p><button className="btn btn-secondary" onClick={() => setDone(false)}>다른 신청 작성</button></div>;
  return <form className="partner-form" onSubmit={submit}><div className="segmented"><button type="button" className={type === 'church' ? 'active' : ''} onClick={() => setType('church')}>파트너 교회</button><button type="button" className={type === 'individual' ? 'active' : ''} onClick={() => setType('individual')}>개인 파트너</button></div><div className="form-grid"><label>성함<input name="name" autoComplete="name" required /></label><label>교회·기관명<input name="church" autoComplete="organization" required={type === 'church'} /></label><label>직분·역할<input name="role" /></label><label>연락처<input name="phone" type="tel" autoComplete="tel" required /></label><label className="full">이메일<input type="email" name="email" autoComplete="email" required /></label></div><label>함께하고 싶은 이유·기대<textarea name="message" rows={5} required /></label><input className="form-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /><label className="consent-row"><input type="checkbox" name="consent" required /><span>신청 처리와 연락을 위한 개인정보 수집·이용에 동의합니다. <Link href="/privacy" target="_blank">내용 보기</Link></span></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="btn btn-primary" disabled={saving}>{saving ? '접수 중…' : '파트너 신청하기'}</button></form>;
}
