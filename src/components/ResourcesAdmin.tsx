'use client';

import Image from 'next/image';
import { FormEvent, ReactNode, useState } from 'react';
import { createId, createRecord, deleteRecord, StoredRecord, updateRecord } from '@/lib/repository';
import { seedApps, seedGpts, seedReplays } from '@/lib/seed-data';
import { AppItem, GptItem, ReplayItem } from '@/lib/types';
import { deleteManagedImage, ImageFolder, uploadManagedImage } from '@/lib/storage';
import { useRecords } from '@/lib/use-records';

type Tab = 'gpts' | 'apps' | 'replays';
type ResourceItem = GptItem | AppItem | ReplayItem;
type ResourceCollection = 'gpts' | 'apps' | 'replays';

async function resolveImage(form: FormData, currentUrl: string | null | undefined, folder: ImageFolder) {
  if (form.get('removeImage') === 'on') return null;
  const file = form.get('image');
  if (file instanceof File && file.size > 0) return uploadManagedImage(file, folder);
  return currentUrl ?? null;
}

function ResourceImageField({ currentUrl, title }: { currentUrl?: string | null; title: string }) {
  return <>
    <label className="content-image-field">대표 이미지<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" /><small>JPG, PNG, WEBP, GIF · 최대 5MB</small></label>
    {currentUrl && <div className="content-image-preview resource-image-preview"><div><Image src={currentUrl} alt={`${title} 현재 이미지`} fill sizes="420px" unoptimized={currentUrl.startsWith('data:')} /></div><label className="consent-row"><input type="checkbox" name="removeImage" /><span>현재 이미지 제거</span></label></div>}
  </>;
}

export default function ResourcesAdmin() {
  const [tab, setTab] = useState<Tab>('gpts');
  return <div><header className="admin-page-header"><div><span>RESOURCE HUB</span><h1>GPT·앱·다시보기 관리</h1><p>도구와 영상의 등록·수정·이미지·공개 상태를 한곳에서 관리합니다.</p></div></header><div className="filter-tabs"><button type="button" className={tab === 'gpts' ? 'active' : ''} onClick={() => setTab('gpts')}>GPTs</button><button type="button" className={tab === 'apps' ? 'active' : ''} onClick={() => setTab('apps')}>연구 앱</button><button type="button" className={tab === 'replays' ? 'active' : ''} onClick={() => setTab('replays')}>세미나 다시보기</button></div>{tab === 'gpts' ? <GptAdmin /> : tab === 'apps' ? <AppAdmin /> : <ReplayAdmin />}</div>;
}

function GptAdmin() {
  const { records } = useRecords<GptItem>('gpts', seedGpts);
  const [editing, setEditing] = useState<GptItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setMessage('');
    const f = new FormData(e.currentTarget);
    let imageUrl: string | null;
    try { imageUrl = await resolveImage(f, editing?.imageUrl, 'gpt'); } catch (error) { setMessage(error instanceof Error ? error.message : '이미지를 올리지 못했습니다.'); setSaving(false); return; }
    const values = { title: String(f.get('title')).trim(), platform: String(f.get('platform')) as 'GPT'|'Gem', category: String(f.get('category')).trim(), maker: String(f.get('maker')).trim(), description: String(f.get('description')).trim(), plan: String(f.get('plan')) as 'free'|'paid', accessUrl: String(f.get('accessUrl')).trim(), priceLabel: String(f.get('priceLabel')).trim(), imageUrl, featured: f.get('featured') === 'on', status: String(f.get('status')) as 'draft'|'published' };
    try {
      if (editing) { await updateRecord<GptItem>('gpts', editing.id, values); if (editing.imageUrl && editing.imageUrl !== imageUrl) void deleteManagedImage(editing.imageUrl); setEditing(null); setMessage('GPT 변경 내용을 저장했습니다.'); }
      else { await createRecord<GptItem>('gpts', { id: createId('gpt'), ...values, createdAt: new Date().toISOString() }); e.currentTarget.reset(); setMessage('새 GPT를 저장했습니다.'); }
    } catch { setMessage('GPT를 저장하지 못했습니다.'); } finally { setSaving(false); }
  }
  return <AdminResourceLayout form={<form className="admin-form admin-panel" onSubmit={submit} key={editing?.id ?? 'new-gpt'}><EditorHeading title={editing ? 'GPT 수정' : '새 GPT 등록'} editing={Boolean(editing)} onCancel={() => { setEditing(null); setMessage(''); }} /><label>이름<input name="title" defaultValue={editing?.title ?? ''} required /></label><div className="form-grid"><label>플랫폼<select name="platform" defaultValue={editing?.platform ?? 'GPT'}><option>GPT</option><option>Gem</option></select></label><label>무료·판매<select name="plan" defaultValue={editing?.plan ?? 'free'}><option value="free">무료</option><option value="paid">판매</option></select></label></div><label>분류<input name="category" defaultValue={editing?.category ?? ''} required /></label><label>제작자<input name="maker" defaultValue={editing?.maker ?? '백형진'} required /></label><label>설명<textarea name="description" rows={4} defaultValue={editing?.description ?? ''} required /></label><label>사용·구매 링크<input type="url" name="accessUrl" defaultValue={editing?.accessUrl ?? ''} required /></label><label>가격 표시<input name="priceLabel" defaultValue={editing?.priceLabel ?? ''} placeholder="예: 가격 문의" /></label><ResourceImageField currentUrl={editing?.imageUrl} title={editing?.title ?? 'GPT'} /><div className="form-grid"><label>상태<select name="status" defaultValue={editing?.status ?? 'draft'}><option value="draft">초안</option><option value="published">공개</option></select></label><label className="consent-row"><input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} />주요 도구</label></div>{message && <div className="form-success" role="status">{message}</div>}<button className="btn btn-primary" disabled={saving}>{saving ? '저장 중…' : editing ? '변경 내용 저장' : 'GPT 저장'}</button></form>} items={records} render={(item) => <ResourceAdminRow key={item.id} item={item} collection="gpts" onEdit={() => setEditing(item)} />} />;
}

function AppAdmin() {
  const { records } = useRecords<AppItem>('apps', seedApps);
  const [editing, setEditing] = useState<AppItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setMessage(''); const f = new FormData(e.currentTarget);
    let imageUrl: string | null;
    try { imageUrl = await resolveImage(f, editing?.imageUrl, 'app'); } catch (error) { setMessage(error instanceof Error ? error.message : '이미지를 올리지 못했습니다.'); setSaving(false); return; }
    const values = { title: String(f.get('title')).trim(), category: String(f.get('category')).trim(), maker: String(f.get('maker')).trim(), description: String(f.get('description')).trim(), accessUrl: String(f.get('accessUrl')).trim(), imageUrl, featured: f.get('featured') === 'on', status: String(f.get('status')) as 'draft'|'published' };
    try { if (editing) { await updateRecord<AppItem>('apps', editing.id, values); if (editing.imageUrl && editing.imageUrl !== imageUrl) void deleteManagedImage(editing.imageUrl); setEditing(null); setMessage('앱 변경 내용을 저장했습니다.'); } else { await createRecord<AppItem>('apps', { id: createId('app'), ...values, createdAt: new Date().toISOString() }); e.currentTarget.reset(); setMessage('새 앱을 저장했습니다.'); } } catch { setMessage('앱을 저장하지 못했습니다.'); } finally { setSaving(false); }
  }
  return <AdminResourceLayout form={<form className="admin-form admin-panel" onSubmit={submit} key={editing?.id ?? 'new-app'}><EditorHeading title={editing ? '연구 앱 수정' : '새 연구 앱 등록'} editing={Boolean(editing)} onCancel={() => { setEditing(null); setMessage(''); }} /><label>앱 이름<input name="title" defaultValue={editing?.title ?? ''} required /></label><label>분류<input name="category" defaultValue={editing?.category ?? ''} required /></label><label>제작자<input name="maker" defaultValue={editing?.maker ?? '백형진'} required /></label><label>설명<textarea name="description" rows={4} defaultValue={editing?.description ?? ''} required /></label><label>앱 주소<input type="url" name="accessUrl" defaultValue={editing?.accessUrl ?? ''} required /></label><ResourceImageField currentUrl={editing?.imageUrl} title={editing?.title ?? '연구 앱'} /><div className="form-grid"><label>상태<select name="status" defaultValue={editing?.status ?? 'draft'}><option value="draft">초안</option><option value="published">공개</option></select></label><label className="consent-row"><input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} />주요 앱</label></div>{message && <div className="form-success" role="status">{message}</div>}<button className="btn btn-primary" disabled={saving}>{saving ? '저장 중…' : editing ? '변경 내용 저장' : '앱 저장'}</button></form>} items={records} render={(item) => <ResourceAdminRow key={item.id} item={item} collection="apps" onEdit={() => setEditing(item)} />} />;
}

function ReplayAdmin() {
  const { records } = useRecords<ReplayItem>('replays', seedReplays);
  const [editing, setEditing] = useState<ReplayItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setMessage(''); const f = new FormData(e.currentTarget);
    let thumbnailUrl: string | null;
    try { thumbnailUrl = await resolveImage(f, editing?.thumbnailUrl, 'replay'); } catch (error) { setMessage(error instanceof Error ? error.message : '이미지를 올리지 못했습니다.'); setSaving(false); return; }
    const values = { title: String(f.get('title')).trim(), description: String(f.get('description')).trim(), videoUrl: String(f.get('videoUrl')).trim(), thumbnailUrl, status: String(f.get('status')) as 'draft'|'published', publishedAt: String(f.get('publishedAt')) || new Date().toISOString().slice(0,10) };
    try { if (editing) { await updateRecord<ReplayItem>('replays', editing.id, values); if (editing.thumbnailUrl && editing.thumbnailUrl !== thumbnailUrl) void deleteManagedImage(editing.thumbnailUrl); setEditing(null); setMessage('다시보기 변경 내용을 저장했습니다.'); } else { await createRecord<ReplayItem>('replays', { id: createId('replay'), ...values, createdAt: new Date().toISOString() }); e.currentTarget.reset(); setMessage('새 다시보기를 저장했습니다.'); } } catch { setMessage('다시보기를 저장하지 못했습니다.'); } finally { setSaving(false); }
  }
  return <AdminResourceLayout form={<form className="admin-form admin-panel" onSubmit={submit} key={editing?.id ?? 'new-replay'}><EditorHeading title={editing ? '다시보기 수정' : '세미나 다시보기 등록'} editing={Boolean(editing)} onCancel={() => { setEditing(null); setMessage(''); }} /><label>제목<input name="title" defaultValue={editing?.title ?? ''} required /></label><label>설명<textarea name="description" rows={4} defaultValue={editing?.description ?? ''} required /></label><label>영상 주소<input type="url" name="videoUrl" defaultValue={editing?.videoUrl ?? ''} required /></label><ResourceImageField currentUrl={editing?.thumbnailUrl} title={editing?.title ?? '다시보기'} /><div className="form-grid"><label>공개일<input type="date" name="publishedAt" defaultValue={editing?.publishedAt ?? ''} /></label><label>상태<select name="status" defaultValue={editing?.status ?? 'draft'}><option value="draft">초안</option><option value="published">공개</option></select></label></div>{message && <div className="form-success" role="status">{message}</div>}<button className="btn btn-primary" disabled={saving}>{saving ? '저장 중…' : editing ? '변경 내용 저장' : '다시보기 저장'}</button></form>} items={records} render={(item) => <ResourceAdminRow key={item.id} item={item} collection="replays" onEdit={() => setEditing(item)} />} />;
}

function EditorHeading({ title, editing, onCancel }: { title: string; editing: boolean; onCancel: () => void }) { return <div className="panel-heading"><div><span>{editing ? 'EDIT ITEM' : 'NEW ITEM'}</span><h2>{title}</h2></div>{editing && <button type="button" className="admin-text-button" onClick={onCancel}>수정 취소</button>}</div>; }
function AdminResourceLayout<T>({ form, items, render }: { form: ReactNode; items: T[]; render: (item: T) => ReactNode }) { return <div className="admin-two-column">{form}<section className="admin-panel content-manage"><div className="panel-heading"><div><span>REGISTERED</span><h2>등록된 항목</h2></div><b>{items.length}</b></div>{items.map(render)}{!items.length && <div className="admin-empty-state">아직 등록된 항목이 없습니다.</div>}</section></div>; }
function ResourceAdminRow<T extends ResourceItem>({ item, collection, onEdit }: { item: T; collection: ResourceCollection; onEdit: () => void }) {
  const imageUrl = collection === 'replays' ? (item as ReplayItem).thumbnailUrl : (item as GptItem | AppItem).imageUrl;
  async function remove() { if (!confirm('이 항목을 삭제할까요?')) return; await deleteRecord<T & StoredRecord>(collection, item.id); if (imageUrl) void deleteManagedImage(imageUrl); }
  return <article><div><span className={`publish-state ${item.status}`}>{item.status === 'published' ? '공개' : '초안'}</span>{imageUrl && <span className="image-attached">이미지 포함</span>}</div><h3>{item.title}</h3><p>{'category' in item ? item.category : item.publishedAt}</p><div className="inline-actions"><button type="button" onClick={onEdit}>수정</button><button type="button" onClick={() => updateRecord<ResourceItem & StoredRecord>(collection, item.id, { status: item.status === 'published' ? 'draft' : 'published' })}>{item.status === 'published' ? '비공개로' : '공개하기'}</button><button type="button" className="danger" onClick={() => void remove()}>삭제</button></div></article>;
}
