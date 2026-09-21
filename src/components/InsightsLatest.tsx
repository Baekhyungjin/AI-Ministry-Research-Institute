'use client';

import Link from 'next/link';
import { seedContents } from '@/lib/seed-data';
import { ContentItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const cardTones = ['', 'violet', 'navy'];

export default function InsightsLatest() {
  const { records, loading } = useRecords<ContentItem>('contents', seedContents, true);
  const columns = records
    .filter((item) => item.kind === 'column' && item.status === 'published')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);

  if (loading) {
    return <div className="loading-line">최신 칼럼을 불러오고 있습니다.</div>;
  }

  if (!columns.length) {
    return <div className="empty-state insight-empty-state"><p>현재 공개된 칼럼이 없습니다.</p><Link href="/columns">전체 칼럼 게시판 보기 →</Link></div>;
  }

  return <>
    <div className="insight-feature-list">
      {columns.map((item, index) => (
        <Link className={`insight-feature ${cardTones[index]}`} href={`/columns/${item.id}`} key={item.id} aria-label={`${item.title} 칼럼 읽기`}>
          <div><span>{item.category}</span><b>{String(index + 1).padStart(2, '0')}</b></div>
          <h2>{item.title}</h2>
          <p>{item.excerpt}</p>
          <strong>칼럼 읽기 →</strong>
        </Link>
      ))}
    </div>
    <div className="insight-all-columns"><Link href="/columns">전체 칼럼 게시판 보기 →</Link></div>
  </>;
}
