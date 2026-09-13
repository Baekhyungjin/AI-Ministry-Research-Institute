'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { submitReplaySupport } from '@/app/replays/actions';
import { seedReplays } from '@/lib/seed-data';
import { ReplayItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

type PublicReplayItem = Omit<ReplayItem, 'videoUrl'>;
const publicReplaySeed: PublicReplayItem[] = seedReplays;
const publicReplayFields = 'id,title,description,thumbnail_url,status,published_at,created_at';

type SupportReceipt = {
  account: string;
  replayTitle: string;
  depositorName: string;
  supportAmount: number;
};

export default function ReplayCatalog() {
  const { records, loading } = useRecords<PublicReplayItem>('replays', publicReplaySeed, true, publicReplayFields);
  const [selected, setSelected] = useState<PublicReplayItem | null>(null);
  const [receipt, setReceipt] = useState<SupportReceipt | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;
    setError('');
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const result = await submitReplaySupport({
      replayId: selected.id,
      name: String(form.get('name') ?? ''),
      church: String(form.get('church') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      depositorName: String(form.get('depositorName') ?? ''),
      supportAmount: Number(form.get('supportAmount')),
      consent: form.get('consent') === 'on',
      website: String(form.get('website') ?? ''),
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setReceipt(result);
    setSelected(null);
  }

  const items = records.filter((item) => item.status === 'published');
  return <>
    <div className="replay-grid">{items.map((item) => <article className="replay-card" key={item.id}>
      <div className="replay-thumb">{item.thumbnailUrl ? <Image src={item.thumbnailUrl} alt="" fill sizes="(max-width: 760px) 100vw, 38vw" /> : <div><span>SEMINAR REPLAY</span><b>▶</b></div>}</div>
      <span>{item.publishedAt}</span><h2>{item.title}</h2><p>{item.description}</p>
      <div className="replay-support-notice"><strong>10,000원부터 자유 후원</strong><small>신청 완료 후 계좌 안내</small></div>
      <button className="btn btn-primary" onClick={() => { setError(''); setSelected(item); }}>후원 신청하고 다시보기</button>
    </article>)}</div>
    {!loading && !items.length && <div className="catalog-empty"><strong>등록된 세미나 다시보기가 없습니다.</strong><p>관리자에서 영상과 안내를 등록하면 후원 신청 폼과 함께 공개됩니다.</p></div>}

    {selected && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="replay-support-title"><form className="replay-modal" onSubmit={submit}>
      <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="닫기">×</button>
      <span>REPLAY SUPPORT</span><h2 id="replay-support-title">{selected.title}</h2>
      <p>10,000원부터 원하는 금액으로 후원할 수 있습니다. 신청이 저장된 뒤 후원 계좌가 표시됩니다.</p>
      <label>성함<input name="name" autoComplete="name" required /></label>
      <label>교회·기관<input name="church" autoComplete="organization" required /></label>
      <label>연락처<input name="phone" type="tel" autoComplete="tel" required /></label>
      <label>이메일<input type="email" name="email" autoComplete="email" required /></label>
      <div className="replay-support-fields">
        <label>후원 금액<input type="number" name="supportAmount" min="10000" step="1000" defaultValue="10000" inputMode="numeric" required /></label>
        <label>입금자명<input name="depositorName" autoComplete="off" required /></label>
      </div>
      <input className="form-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="consent-row"><input type="checkbox" name="consent" required /><span>신청 처리와 입금 확인을 위한 개인정보 수집·이용에 동의합니다.</span></label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="btn btn-primary" disabled={saving}>{saving ? '신청 저장 중…' : '후원 신청하고 계좌 확인'}</button>
    </form></div>}

    {receipt && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="support-ready-title"><div className="replay-modal replay-support-result">
      <button className="modal-close" type="button" onClick={() => setReceipt(null)} aria-label="닫기">×</button>
      <span>SUPPORT REQUESTED</span><h2 id="support-ready-title">후원 신청이 접수되었습니다.</h2>
      <p>아래 계좌로 신청한 금액을 입금해 주세요.</p>
      <div className="support-account-panel"><small>후원 계좌</small><strong>{receipt.account}</strong></div>
      <dl className="support-summary"><div><dt>입금자명</dt><dd>{receipt.depositorName}</dd></div><div><dt>신청 금액</dt><dd>{receipt.supportAmount.toLocaleString('ko-KR')}원</dd></div></dl>
      <p className="support-result-note">입금 확인 후 신청하신 연락처 또는 이메일로 세미나 시청 링크를 안내합니다.</p>
      <button className="btn btn-primary" type="button" onClick={() => setReceipt(null)}>확인</button>
    </div></div>}
  </>;
}
