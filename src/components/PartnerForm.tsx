'use client';

import { FormEvent, useState } from 'react';
import { createId, createRecord } from '@/lib/repository';
import { PartnerApplicationItem } from '@/lib/types';

export default function PartnerForm() {
  const [type, setType] = useState<'church' | 'individual'>('church');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    const item: PartnerApplicationItem = { id: createId('partner'), partnerType: type, name: String(form.get('name')), church: String(form.get('church')), role: String(form.get('role')), phone: String(form.get('phone')), email: String(form.get('email')), message: String(form.get('message')), status: 'new', consent: form.get('consent') === 'on', createdAt: new Date().toISOString() };
    try { await createRecord('partner_applications', item); setDone(true); event.currentTarget.reset(); } catch { setError('신청을 저장하지 못했습니다. 카카오톡으로 문의해 주세요.'); } finally { setSaving(false); }
  }
  if (done) return <div className="success-panel"><span>PARTNER REQUEST RECEIVED</span><h2>파트너 신청이 접수되었습니다.</h2><p>내용을 확인한 뒤 입력하신 연락처로 안내드리겠습니다.</p><button className="btn btn-secondary" onClick={() => setDone(false)}>다른 신청 작성</button></div>;
  return <form className="partner-form" onSubmit={submit}><div className="segmented"><button type="button" className={type === 'church' ? 'active' : ''} onClick={() => setType('church')}>파트너 교회</button><button type="button" className={type === 'individual' ? 'active' : ''} onClick={() => setType('individual')}>개인 파트너</button></div><div className="form-grid"><label>성함<input name="name" required /></label><label>교회·기관명<input name="church" required={type === 'church'} /></label><label>직분·역할<input name="role" /></label><label>연락처<input name="phone" required /></label><label className="full">이메일<input type="email" name="email" required /></label></div><label>함께하고 싶은 이유·기대<textarea name="message" rows={5} required /></label><label className="consent-row"><input type="checkbox" name="consent" required /><span>신청 처리와 연락을 위한 개인정보 수집·이용에 동의합니다.</span></label>{error && <p className="form-error">{error}</p>}<button className="btn btn-primary" disabled={saving}>{saving ? '접수 중…' : '파트너 신청하기'}</button></form>;
}
