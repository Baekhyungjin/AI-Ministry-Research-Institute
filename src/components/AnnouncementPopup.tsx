'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { seedContents } from '@/lib/seed-data';
import { ContentItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const activeNow = (item: ContentItem) => {
  const now = Date.now();
  return (!item.startsAt || new Date(item.startsAt).getTime() <= now) && (!item.endsAt || new Date(item.endsAt).getTime() >= now);
};

export default function AnnouncementPopup() {
  const pathname = usePathname();
  const { records } = useRecords<ContentItem>('contents', seedContents, true);
  const [closed, setClosed] = useState<string[]>([]);
  const notices = contentsSorted(records);
  const item = notices.find((notice) => notice.noticePlacement === 'popup' && !closed.includes(notice.id));
  const banner = notices.find((notice) => notice.noticePlacement === 'banner' && !closed.includes(notice.id));

  if (pathname !== '/' || (!item && !banner)) return null;

  return <>
    {banner && <aside className="announcement-banner"><div className="container"><div><span>{banner.category || 'NOTICE'}</span><strong>{banner.title}</strong><p>{banner.excerpt}</p></div><Link href={banner.ctaUrl || `/notices/${banner.id}`}>{banner.ctaLabel || '자세히 보기'} →</Link><button type="button" onClick={() => setClosed((values) => [...values, banner.id])} aria-label="배너 닫기">×</button></div></aside>}
    {item && <div className="announcement-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="announcement-popup-title">
      <aside className={`announcement-popup ${item.imageUrl ? 'has-image' : ''}`}>
        <button type="button" onClick={() => setClosed((values) => [...values, item.id])} aria-label="공지 팝업 닫기">×</button>
        {item.imageUrl && <div className="announcement-popup-image"><Image src={item.imageUrl} alt={`${item.title} 공지 이미지`} fill sizes="(max-width: 600px) 92vw, 520px" unoptimized={item.imageUrl.startsWith('data:')} /></div>}
        <div className="announcement-popup-copy"><span>{item.category || 'NOTICE'}</span><h2 id="announcement-popup-title">{item.title}</h2><p>{item.excerpt}</p><div><Link className="btn btn-primary" href={item.ctaUrl || `/notices/${item.id}`}>{item.ctaLabel || '자세히 보기'} →</Link><button type="button" onClick={() => setClosed((values) => [...values, item.id])}>닫기</button></div></div>
      </aside>
    </div>}
  </>;
}

export function contentsSorted(items: ContentItem[]) {
  return items.filter((item) => item.kind === 'notice' && item.status === 'published' && activeNow(item)).sort((a,b) => (b.priority || 0) - (a.priority || 0) || b.publishedAt.localeCompare(a.publishedAt));
}
