'use client';

import Link from 'next/link';
import Image from 'next/image';
import { seedContents } from '@/lib/seed-data';
import { ContentItem, ContentKind } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

export default function ContentListing({ kind }: { kind: ContentKind }) {
  const { records, loading } = useRecords<ContentItem>('contents', seedContents, true);
  const items = records.filter((item) => item.kind === kind && item.status === 'published').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const base = kind === 'column' ? '/columns' : '/notices';

  if (loading) return <div className="loading-line">콘텐츠를 불러오는 중입니다.</div>;
  return (
    <div className={kind === 'column' ? 'article-grid' : 'notice-board'}>
      {items.map((item, index) => (
        <Link href={`${base}/${item.id}`} className={kind === 'column' ? `article-card tone-${(index % 3) + 1}` : 'notice-board-row'} key={item.id}>
          {kind === 'column' && item.imageUrl && <div className="article-card-image"><Image src={item.imageUrl} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={item.imageUrl.startsWith('data:')} /></div>}
          <div className="content-meta"><span>{item.category}</span><time>{item.publishedAt}</time></div>
          <h2>{item.title}</h2>
          <p>{item.excerpt}</p>
          <span className="text-link">자세히 읽기 →</span>
        </Link>
      ))}
      {!items.length && <div className="empty-state">아직 발행된 글이 없습니다.</div>}
    </div>
  );
}
