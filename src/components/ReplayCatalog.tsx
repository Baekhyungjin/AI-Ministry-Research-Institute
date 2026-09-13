'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { createId, createRecord } from '@/lib/repository';
import { seedReplays } from '@/lib/seed-data';
import { ReplayAccessItem, ReplayItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

export default function ReplayCatalog() {
  const { records, loading } = useRecords<ReplayItem>('replays', seedReplays, true);
  const [selected, setSelected] = useState<ReplayItem | null>(null);
  const [unlocked, setUnlocked] = useState<ReplayItem | null>(null);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setError('');
    const form = new FormData(event.currentTarget);
    const record: ReplayAccessItem = { id: createId('replay-access'), replayId: selected.id, replayTitle: selected.title, name: String(form.get('name')), church: String(form.get('church')), phone: String(form.get('phone')), email: String(form.get('email')), consent: form.get('consent') === 'on', createdAt: new Date().toISOString() };
    try { await createRecord('replay_accesses', record); setUnlocked(selected); setSelected(null); } catch { setError('기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'); }
  }
  const items = records.filter((item) => item.status === 'published');
  return <><div className="replay-grid">{items.map((item) => <article className="replay-card" key={item.id}><div className="replay-thumb">{item.thumbnailUrl ? <Image src={item.thumbnailUrl} alt="" fill sizes="(max-width: 760px) 100vw, 38vw" /> : <div><span>SEMINAR REPLAY</span><b>▶</b></div>}</div><span>{item.publishedAt}</span><h2>{item.title}</h2><p>{item.description}</p><button className="btn btn-primary" onClick={() => setSelected(item)}>신청 후 다시보기</button></article>)}</div>{!loading && !items.length && <div className="catalog-empty"><strong>등록된 세미나 다시보기가 없습니다.</strong><p>관리자에서 영상과 안내를 등록하면 신청 폼과 함께 공개됩니다.</p></div>}
  {selected && <div className="modal-backdrop" role="dialog" aria-modal="true"><form className="replay-modal" onSubmit={submit}><button className="modal-close" type="button" onClick={() => setSelected(null)}>×</button><span>REPLAY REQUEST</span><h2>{selected.title}</h2><p>시청 정보를 안내하고 신청 기록을 관리하기 위해 아래 내용을 받습니다.</p><label>성함<input name="name" required /></label><label>교회·기관<input name="church" required /></label><label>연락처<input name="phone" required /></label><label>이메일<input type="email" name="email" required /></label><label className="consent-row"><input type="checkbox" name="consent" required /><span>개인정보 수집·이용에 동의합니다.</span></label>{error && <p className="form-error">{error}</p>}<button className="btn btn-primary">신청하고 영상 열기</button></form></div>}
  {unlocked && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="replay-modal"><button className="modal-close" type="button" onClick={() => setUnlocked(null)}>×</button><span>REPLAY READY</span><h2>다시보기 준비가 되었습니다.</h2><p>외부 영상 페이지로 이동합니다.</p><a href={unlocked.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">영상 재생 ↗</a></div></div>}</>;
}
