'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { confirmReplaySupport, submitReplaySupport } from '@/app/replays/actions';
import { CatalogPagination, CatalogToolbar, useCatalogBrowser } from '@/components/CatalogBrowser';
import { seedReplays } from '@/lib/seed-data';
import { ReplayItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

type PublicReplayItem = Omit<ReplayItem, 'videoUrl'>;
const publicReplaySeed: PublicReplayItem[] = seedReplays;
const publicReplayFields = 'id,title,description,thumbnail_url,status,published_at,created_at';
const replaySearchText = (item: PublicReplayItem) => [item.title, item.description, item.publishedAt].join(' ');

type SupportReceipt = {
  accessId: string;
  account: string;
  replayTitle: string;
  depositorName: string;
  supportAmount: number;
};

type ReplayViewer = { replayTitle: string; videoUrl: string };

export default function ReplayCatalog() {
  const { records, loading } = useRecords<PublicReplayItem>('replays', publicReplaySeed, true, publicReplayFields);
  const items = records.filter((item) => item.status === 'published');
  const browser = useCatalogBrowser(items, replaySearchText);
  const [selected, setSelected] = useState<PublicReplayItem | null>(null);
  const [receipt, setReceipt] = useState<SupportReceipt | null>(null);
  const [viewer, setViewer] = useState<ReplayViewer | null>(null);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(false);
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
    setTransferConfirmed(false);
    setCopied(false);
    setSelected(null);
  }

  async function openReplay() {
    if (!receipt || !transferConfirmed || opening) return;
    setOpening(true);
    setError('');
    const result = await confirmReplaySupport(receipt.accessId);
    setOpening(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setViewer(result);
    setReceipt(null);
  }

  async function copyAccount() {
    if (!receipt) return;
    await navigator.clipboard.writeText(receipt.account);
    setCopied(true);
  }

  return <>
    <CatalogToolbar query={browser.query} onQueryChange={browser.setQuery} resultCount={browser.filteredItems.length} totalCount={items.length} placeholder="세미나 제목·내용 검색" />
    <div className="replay-grid catalog-result-grid">{browser.visibleItems.map((item) => <article className="replay-card" key={item.id}>
      <div className="replay-thumb"><Image src={item.thumbnailUrl || `/api/replay-thumbnails/${encodeURIComponent(item.id)}`} alt={`${item.title} 다시보기 썸네일`} fill sizes="(max-width: 760px) 100vw, 25vw" unoptimized={!item.thumbnailUrl} /></div>
      <span>{item.publishedAt}</span><h2>{item.title}</h2><p>{item.description}</p>
      <div className="replay-support-notice"><strong>10,000원부터 자유 후원</strong><small>신청 완료 후 계좌 안내</small></div>
      <button className="btn btn-primary" onClick={() => { setError(''); setSelected(item); }}>후원 신청하고 다시보기</button>
    </article>)}</div>
    {!loading && !browser.filteredItems.length && <div className="catalog-empty"><strong>{items.length ? '검색 결과가 없습니다.' : '등록된 세미나 다시보기가 없습니다.'}</strong><p>{items.length ? '다른 세미나 제목이나 내용으로 검색해 보세요.' : '관리자에서 영상과 안내를 등록하면 후원 신청 폼과 함께 공개됩니다.'}</p></div>}
    <CatalogPagination page={browser.page} pageCount={browser.pageCount} onPageChange={browser.setPage} />

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
      <label className="consent-row"><input type="checkbox" name="consent" required /><span>신청 처리와 입금 확인을 위한 개인정보 수집·이용에 동의합니다. <Link href="/privacy" target="_blank">내용 보기</Link></span></label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="btn btn-primary" disabled={saving}>{saving ? '신청 저장 중…' : '후원 신청하고 계좌 확인'}</button>
    </form></div>}

    {receipt && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="support-ready-title"><div className="replay-modal replay-support-result">
      <button className="modal-close" type="button" onClick={() => setReceipt(null)} aria-label="닫기">×</button>
      <span>SUPPORT REQUESTED</span><h2 id="support-ready-title">후원 신청이 접수되었습니다.</h2>
      <p>아래 계좌로 신청한 금액을 입금해 주세요.</p>
      <div className="support-account-panel"><small>후원 계좌</small><strong>{receipt.account}</strong></div>
      <dl className="support-summary"><div><dt>입금자명</dt><dd>{receipt.depositorName}</dd></div><div><dt>신청 금액</dt><dd>{receipt.supportAmount.toLocaleString('ko-KR')}원</dd></div></dl>
      <button className="support-account-copy" type="button" onClick={() => void copyAccount()}>{copied ? '계좌번호를 복사했습니다' : '계좌번호 복사'}</button>
      <label className="consent-row replay-transfer-confirm"><input type="checkbox" checked={transferConfirmed} onChange={(event) => setTransferConfirmed(event.target.checked)} /><span>위 계좌로 신청한 후원금의 입금을 완료했습니다.</span></label>
      <p className="support-result-note">별도의 관리자 확인이나 이메일 발송 없이, 입금 완료 표시 후 바로 시청할 수 있습니다.</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="btn btn-primary" type="button" disabled={!transferConfirmed || opening} onClick={() => void openReplay()}>{opening ? '영상 준비 중…' : '후원 완료하고 영상 시청하기'}</button>
    </div></div>}

    {viewer && <ReplayViewerModal viewer={viewer} onClose={() => setViewer(null)} />}
  </>;
}

function ReplayViewerModal({ viewer, onClose }: { viewer: ReplayViewer; onClose: () => void }) {
  const embedUrl = getYouTubeEmbedUrl(viewer.videoUrl);
  return <div className="modal-backdrop replay-viewer-backdrop" role="dialog" aria-modal="true" aria-labelledby="replay-viewer-title"><div className="replay-viewer-modal">
    <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">×</button>
    <span>SEMINAR VIEWING</span><h2 id="replay-viewer-title">{viewer.replayTitle}</h2>
    {embedUrl ? <div className="replay-video-frame"><iframe src={embedUrl} title={viewer.replayTitle} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div> : <div className="replay-external-video"><p>새 창에서 영상을 시청할 수 있습니다.</p><a className="btn btn-primary" href={viewer.videoUrl} target="_blank" rel="noopener noreferrer">영상 열기</a></div>}
    <section className="replay-kakao-cta"><div><small>AFTER THE SEMINAR</small><h3>목회 현장에 적용하면서 AI의 도움이 필요하신가요?</h3><p>목회AI연구소 오픈카톡방에서 질문과 실제 적용 사례를 함께 나눕니다.</p></div><a className="btn btn-primary" href="https://open.kakao.com/o/g8xjXlIg" target="_blank" rel="noopener noreferrer">연구소 오픈카톡 참여하기 →</a></section>
  </div></div>;
}
