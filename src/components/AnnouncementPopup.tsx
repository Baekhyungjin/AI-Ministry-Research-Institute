'use client';
import Link from 'next/link';
import { useState } from 'react';
import { seedContents } from '@/lib/seed-data';
import { ContentItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const activeNow = (item: ContentItem) => {
  const now = Date.now();
  return (!item.startsAt || new Date(item.startsAt).getTime() <= now) && (!item.endsAt || new Date(item.endsAt).getTime() >= now);
};
export default function AnnouncementPopup() {
  const { records } = useRecords<ContentItem>('contents', seedContents, true); const [closed, setClosed] = useState<string[]>([]);
  const notices = contentsSorted(records);
  const item = notices.find((notice) => notice.noticePlacement === 'popup' && !closed.includes(notice.id));
  const banner = notices.find((notice) => notice.noticePlacement === 'banner' && !closed.includes(notice.id));
  if (!item && !banner) return null;
  return <>{banner && <aside className="announcement-banner"><div className="container"><div><span>{banner.category || 'NOTICE'}</span><strong>{banner.title}</strong><p>{banner.excerpt}</p></div><Link href={banner.ctaUrl || `/notices/${banner.id}`}>{banner.ctaLabel || '자세히 보기'} →</Link><button onClick={() => setClosed((values) => [...values, banner.id])} aria-label="배너 닫기">×</button></div></aside>}{item && <aside className="announcement-popup"><button onClick={() => setClosed((values) => [...values, item.id])} aria-label="공지 닫기">×</button><span>{item.category || 'NOTICE'}</span><h2>{item.title}</h2><p>{item.excerpt}</p><Link href={item.ctaUrl || `/notices/${item.id}`}>{item.ctaLabel || '자세히 보기'} →</Link></aside>}</>;
}
export function contentsSorted(items: ContentItem[]) { return items.filter((item) => item.kind === 'notice' && item.status === 'published' && activeNow(item)).sort((a,b) => (b.priority || 0) - (a.priority || 0) || b.publishedAt.localeCompare(a.publishedAt)); }
