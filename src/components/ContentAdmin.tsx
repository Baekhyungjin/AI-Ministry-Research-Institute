'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { createId, createRecord, deleteRecord, updateRecord } from '@/lib/repository';
import { seedContents } from '@/lib/seed-data';
import { ContentBlock, ContentItem, ContentKind, PublishStatus } from '@/lib/types';
import { useRecords } from '@/lib/use-records';
import { deleteManagedImage, uploadContentImage, uploadManagedImage } from '@/lib/storage';
import ContentBlockEditor from '@/components/ContentBlockEditor';
import { blocksToPlainText, contentBlockImageUrls, createContentBlock, hasMeaningfulContent, legacyBodyToBlocks } from '@/lib/content-blocks';

export default function ContentAdmin() {
  const { records } = useRecords<ContentItem>('contents', seedContents);
  const [kind, setKind] = useState<ContentKind>('column');
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => [createContentBlock('paragraph')]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function beginEdit(item: ContentItem) {
    setEditing(item);
    setKind(item.kind);
    setBlocks(item.contentBlocks?.length ? item.contentBlocks : legacyBodyToBlocks(item.body));
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetEditor() {
    setEditing(null);
    setKind('column');
    setBlocks([createContentBlock('paragraph')]);
    setMessage('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const now = new Date();
    const image = form.get('image');
    let imageUrl = editing?.imageUrl ?? null;
    let contentBlocks = kind === 'column' ? blocks : [];
    const uploadedUrls: string[] = [];

    try {
      if (form.get('removeImage') === 'on') imageUrl = null;
      if (image instanceof File && image.size > 0) {
        imageUrl = await uploadContentImage(image, kind);
        uploadedUrls.push(imageUrl);
      }

      if (kind === 'column') {
        const resolvedBlocks: ContentBlock[] = [];
        for (const block of blocks) {
          if (block.type !== 'image') {
            resolvedBlocks.push(block);
            continue;
          }
          const blockImage = form.get(`block-image-${block.id}`);
          const removeBlockImage = form.get(`remove-block-image-${block.id}`) === 'on';
          let blockImageUrl = removeBlockImage ? null : block.imageUrl;
          if (blockImage instanceof File && blockImage.size > 0) {
            blockImageUrl = await uploadManagedImage(blockImage, 'column');
            uploadedUrls.push(blockImageUrl);
          }
          resolvedBlocks.push({ ...block, imageUrl: blockImageUrl });
        }
        contentBlocks = resolvedBlocks;
        if (!hasMeaningfulContent(contentBlocks)) throw new Error('칼럼 본문 블록에 내용을 입력해 주세요.');
      }
    } catch (error) {
      await Promise.allSettled(uploadedUrls.map((url) => deleteManagedImage(url)));
      setMessage(error instanceof Error ? error.message : '본문 또는 이미지를 처리하지 못했습니다.');
      setSaving(false);
      return;
    }

    const values = {
      kind,
      title: String(form.get('title')).trim(),
      excerpt: String(form.get('excerpt')).trim(),
      body: kind === 'column' ? blocksToPlainText(contentBlocks) : String(form.get('body')).trim(),
      contentBlocks,
      category: String(form.get('category')).trim(),
      status: String(form.get('status')) as PublishStatus,
      featured: form.get('featured') === 'on',
      imageUrl,
      publishedAt: String(form.get('publishedAt')) || now.toISOString().slice(0, 10),
      noticePlacement: kind === 'notice' ? String(form.get('noticePlacement') || 'strip') as ContentItem['noticePlacement'] : undefined,
      startsAt: kind === 'notice' ? String(form.get('startsAt') || '') || undefined : undefined,
      endsAt: kind === 'notice' ? String(form.get('endsAt') || '') || undefined : undefined,
      ctaLabel: kind === 'notice' ? String(form.get('ctaLabel') || '') || undefined : undefined,
      ctaUrl: kind === 'notice' ? String(form.get('ctaUrl') || '') || undefined : undefined,
      priority: kind === 'notice' ? Number(form.get('priority') || 0) : 0,
    };

    try {
      if (editing) {
        await updateRecord<ContentItem>('contents', editing.id, values);
        if (editing.imageUrl && editing.imageUrl !== imageUrl) void deleteManagedImage(editing.imageUrl);
        const retainedBlockImages = new Set(contentBlockImageUrls(contentBlocks));
        contentBlockImageUrls(editing.contentBlocks).filter((url) => !retainedBlockImages.has(url)).forEach((url) => void deleteManagedImage(url));
        setMessage('변경 내용을 저장했습니다.');
        setEditing(null);
        setBlocks([createContentBlock('paragraph')]);
      } else {
        const item: ContentItem = {
          id: createId(kind),
          ...values,
          createdAt: now.toISOString(),
        };
        await createRecord('contents', item);
        event.currentTarget.reset();
        setKind('column');
        setBlocks([createContentBlock('paragraph')]);
        setMessage(item.status === 'published' ? '콘텐츠를 공개했습니다.' : '초안으로 저장했습니다.');
      }
    } catch {
      await Promise.allSettled(uploadedUrls.map((url) => deleteManagedImage(url)));
      setMessage('저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  const sortedRecords = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <header className="admin-page-header">
        <div><span>EDITORIAL</span><h1>칼럼·공지 관리</h1><p>초안으로 작성한 뒤 준비가 되었을 때 공개할 수 있습니다.</p></div>
      </header>
      <div className="admin-two-column content-admin-layout">
        <form className="admin-form admin-panel" onSubmit={submit} key={editing?.id ?? 'new-content'}>
          <div className="panel-heading">
            <div><span>{editing ? 'EDIT CONTENT' : 'NEW CONTENT'}</span><h2>{editing ? '콘텐츠 수정' : '새 콘텐츠 등록'}</h2></div>
            {editing && <button type="button" className="admin-text-button" onClick={resetEditor}>수정 취소</button>}
          </div>
          <div className="segmented">
            <button type="button" className={kind === 'column' ? 'active' : ''} onClick={() => setKind('column')}>칼럼</button>
            <button type="button" className={kind === 'notice' ? 'active' : ''} onClick={() => setKind('notice')}>공지</button>
          </div>
          <label>제목<input name="title" defaultValue={editing?.title ?? ''} required /></label>
          <label>분류<input name="category" defaultValue={editing?.category ?? ''} placeholder="예: AI 목회, 교육, 운영" required /></label>
          <label>요약<textarea name="excerpt" rows={3} defaultValue={editing?.excerpt ?? ''} required /></label>
          {kind === 'column' ? <ContentBlockEditor blocks={blocks} onChange={setBlocks} /> : <label>본문<textarea name="body" rows={10} defaultValue={editing?.body ?? ''} required /></label>}
          {kind === 'notice' && <fieldset className="notice-options"><legend>공지 노출 설정</legend><div className="form-grid"><label>노출 위치<select name="noticePlacement" defaultValue={editing?.noticePlacement ?? 'strip'}><option value="strip">상단 알림줄</option><option value="popup">팝업 카드</option><option value="banner">공지 목록 강조</option></select></label><label>우선순위<input type="number" name="priority" defaultValue={editing?.priority ?? 0} /></label><label>노출 시작<input type="datetime-local" name="startsAt" defaultValue={editing?.startsAt?.slice(0,16) ?? ''} /></label><label>노출 종료<input type="datetime-local" name="endsAt" defaultValue={editing?.endsAt?.slice(0,16) ?? ''} /></label><label>버튼 문구<input name="ctaLabel" defaultValue={editing?.ctaLabel ?? ''} placeholder="예: 신청하기" /></label><label>버튼 링크<input name="ctaUrl" defaultValue={editing?.ctaUrl ?? ''} placeholder="/schedule 또는 https://..." /></label></div></fieldset>}
          <label className="content-image-field">대표 이미지
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
            <small>JPG, PNG, WEBP, GIF · 최대 5MB</small>
          </label>
          {editing?.imageUrl && <div className="content-image-preview resource-image-preview"><div><Image src={editing.imageUrl} alt={`${editing.title} 현재 대표 이미지`} fill sizes="420px" unoptimized={editing.imageUrl.startsWith('data:')} /></div><label className="consent-row"><input type="checkbox" name="removeImage" /><span>현재 이미지 제거</span></label></div>}
          <div className="form-grid">
            <label>발행일<input type="date" name="publishedAt" defaultValue={editing?.publishedAt ?? ''} /></label>
            <label>상태<select name="status" defaultValue={editing?.status ?? 'draft'}><option value="draft">초안 저장</option><option value="published">바로 공개</option></select></label>
          </div>
          <label className="consent-row"><input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} /><span>홈페이지 주요 콘텐츠로 표시</span></label>
          {message && <div className="form-success" role="status">{message}</div>}
          <button className="btn btn-primary" disabled={saving}>{saving ? '저장 중…' : editing ? '변경 내용 저장' : `${kind === 'column' ? '칼럼' : '공지'} 저장하기`}</button>
        </form>

        <section className="admin-panel content-manage">
          <div className="panel-heading"><div><span>ALL CONTENT</span><h2>등록된 콘텐츠</h2></div><b>{records.length}</b></div>
          {!sortedRecords.length && <div className="admin-empty-state"><strong>아직 등록된 콘텐츠가 없습니다.</strong><span>왼쪽 작성란에서 첫 칼럼이나 공지를 작성해 주세요.</span></div>}
          {sortedRecords.map((item) => (
            <article key={item.id}>
              <div><span className="content-type">{item.kind === 'column' ? '칼럼' : '공지'}</span><span className={`publish-state ${item.status}`}>{item.status === 'published' ? '공개' : '초안'}</span></div>
              <h3>{item.title}</h3><p>{item.category} · {item.publishedAt}</p>
              {(item.imageUrl || contentBlockImageUrls(item.contentBlocks).length > 0) && <span className="image-attached">이미지 포함</span>}
              <div className="inline-actions">
                <button type="button" onClick={() => beginEdit(item)}>수정</button>
                <button type="button" onClick={() => updateRecord<ContentItem>('contents', item.id, { status: item.status === 'published' ? 'draft' : 'published' })}>{item.status === 'published' ? '비공개로' : '공개하기'}</button>
                <button type="button" onClick={() => updateRecord<ContentItem>('contents', item.id, { featured: !item.featured })}>{item.featured ? '메인 해제' : '메인 표시'}</button>
                <button type="button" className="danger" onClick={() => { if (confirm('이 콘텐츠를 삭제할까요?')) void deleteRecord<ContentItem>('contents', item.id).then(() => { void deleteManagedImage(item.imageUrl); contentBlockImageUrls(item.contentBlocks).forEach((url) => void deleteManagedImage(url)); }); }}>삭제</button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
