'use client';

import Image from 'next/image';
import { ContentBlock } from '@/lib/types';
import { createContentBlock } from '@/lib/content-blocks';

const blockOptions: { type: ContentBlock['type']; label: string }[] = [
  { type: 'paragraph', label: '문단' },
  { type: 'heading', label: '소제목' },
  { type: 'image', label: '이미지' },
  { type: 'quote', label: '인용문' },
  { type: 'list', label: '목록' },
  { type: 'link', label: '링크 카드' },
  { type: 'divider', label: '구분선' },
];

const blockLabels: Record<ContentBlock['type'], string> = {
  paragraph: '문단', heading: '소제목', image: '본문 이미지', quote: '인용문', list: '목록', link: '링크 카드', divider: '구분선',
};

export default function ContentBlockEditor({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
  function update(index: number, block: ContentBlock) {
    onChange(blocks.map((item, itemIndex) => itemIndex === index ? block : item));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    const next = blocks.filter((_, itemIndex) => itemIndex !== index);
    onChange(next.length ? next : [createContentBlock('paragraph')]);
  }

  return (
    <section className="block-editor" aria-label="칼럼 본문 편집기">
      <div className="block-editor-heading"><div><strong>칼럼 본문 구성</strong><span>필요한 블록을 추가하고 순서를 바꿀 수 있습니다.</span></div><b>{blocks.length}개 블록</b></div>
      <div className="block-list">
        {blocks.map((block, index) => (
          <article className={`editor-block type-${block.type}`} key={block.id}>
            <header><span>{String(index + 1).padStart(2, '0')} · {blockLabels[block.type]}</span><div><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="위로 이동">↑</button><button type="button" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="아래로 이동">↓</button><button type="button" className="danger" onClick={() => remove(index)}>삭제</button></div></header>
            {block.type === 'paragraph' && <label>내용<textarea rows={5} value={block.text} onChange={(event) => update(index, { ...block, text: event.target.value })} placeholder="한 가지 생각을 한 문단으로 작성하세요." /></label>}
            {block.type === 'heading' && <><label>소제목<input value={block.text} onChange={(event) => update(index, { ...block, text: event.target.value })} placeholder="예: 목회 현장에서 먼저 확인할 질문" /></label><label>크기<select value={block.level} onChange={(event) => update(index, { ...block, level: Number(event.target.value) as 2 | 3 })}><option value="2">큰 소제목</option><option value="3">작은 소제목</option></select></label></>}
            {block.type === 'quote' && <><label>인용문<textarea rows={3} value={block.text} onChange={(event) => update(index, { ...block, text: event.target.value })} /></label><label>출처 또는 설명<input value={block.caption ?? ''} onChange={(event) => update(index, { ...block, caption: event.target.value })} placeholder="선택 입력" /></label></>}
            {block.type === 'list' && <><label>목록 항목<textarea rows={5} value={block.items.join('\n')} onChange={(event) => update(index, { ...block, items: event.target.value.split('\n') })} placeholder={'한 줄에 한 항목씩 작성하세요.\n두 번째 항목'} /></label><label className="consent-row"><input type="checkbox" checked={Boolean(block.ordered)} onChange={(event) => update(index, { ...block, ordered: event.target.checked })} /><span>번호 목록으로 표시</span></label></>}
            {block.type === 'image' && <><label className="content-image-field">이미지 파일<input type="file" name={`block-image-${block.id}`} accept="image/jpeg,image/png,image/webp,image/gif" /><small>JPG, PNG, WEBP, GIF · 최대 5MB</small></label>{block.imageUrl && <div className="block-image-preview"><Image src={block.imageUrl} alt={block.alt || '현재 본문 이미지'} width={720} height={460} sizes="520px" unoptimized={block.imageUrl.startsWith('data:')} /><label className="consent-row"><input type="checkbox" name={`remove-block-image-${block.id}`} /><span>현재 이미지 제거</span></label></div>}<label>대체 설명<input value={block.alt} onChange={(event) => update(index, { ...block, alt: event.target.value })} placeholder="이미지를 보지 못하는 독자를 위한 설명" /></label><label>이미지 설명<input value={block.caption ?? ''} onChange={(event) => update(index, { ...block, caption: event.target.value })} placeholder="이미지 아래에 표시할 설명 · 선택 입력" /></label></>}
            {block.type === 'link' && <><label>링크 제목<input value={block.label} onChange={(event) => update(index, { ...block, label: event.target.value })} /></label><label>주소<input value={block.url} onChange={(event) => update(index, { ...block, url: event.target.value })} placeholder="/apply 또는 https://..." /></label><label>설명<input value={block.description ?? ''} onChange={(event) => update(index, { ...block, description: event.target.value })} placeholder="선택 입력" /></label></>}
            {block.type === 'divider' && <div className="editor-divider" aria-label="구분선 미리보기" />}
          </article>
        ))}
      </div>
      <div className="block-toolbar"><span>블록 추가</span><div>{blockOptions.map((option) => <button type="button" key={option.type} onClick={() => onChange([...blocks, createContentBlock(option.type)])}>+ {option.label}</button>)}</div></div>
    </section>
  );
}
