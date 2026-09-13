'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { seedContents } from '@/lib/seed-data';
import { ContentItem, ContentKind } from '@/lib/types';
import { useRecords } from '@/lib/use-records';
import ContentBlocks from '@/components/ContentBlocks';
import { legacyBodyToBlocks } from '@/lib/content-blocks';

export default function ContentDetail({ kind }: { kind: ContentKind }) {
  const params = useParams<{ id: string }>();
  const { records } = useRecords<ContentItem>('contents', seedContents, true);
  const item = records.find((record) => record.id === params.id && record.kind === kind && record.status === 'published');
  const back = kind === 'column' ? '/columns' : '/notices';

  if (!item) return <section className="page-section"><div className="narrow-container empty-state"><h1>글을 찾을 수 없습니다.</h1><Link href={back} className="btn btn-secondary">목록으로</Link></div></section>;

  return (
    <article className="article-page">
      <div className="narrow-container">
        <Link href={back} className="back-link">← 목록으로</Link>
        <header className="article-header"><span className="badge badge-blue">{item.category}</span><h1>{item.title}</h1><p>{item.excerpt}</p><time>{item.publishedAt}</time></header>
        {item.imageUrl && <figure className="article-cover"><Image src={item.imageUrl} alt={`${item.title} 대표 이미지`} width={1200} height={720} sizes="(max-width: 900px) 100vw, 900px" unoptimized={item.imageUrl.startsWith('data:')} /></figure>}
        <div className="article-body"><ContentBlocks blocks={item.contentBlocks?.length ? item.contentBlocks : legacyBodyToBlocks(item.body)} /></div>
        <div className="article-end"><strong>현장에 적용할 방법을 함께 찾고 싶으신가요?</strong><Link href="/apply" className="btn btn-primary">연구소에 문의하기</Link></div>
      </div>
    </article>
  );
}
