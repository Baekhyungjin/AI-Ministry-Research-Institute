'use client';

import Image from 'next/image';
import Link from 'next/link';
import { seedApps, seedGpts } from '@/lib/seed-data';
import { AppItem, GptItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

export function GptCatalog() {
  const { records, loading } = useRecords<GptItem>('gpts', seedGpts, true);
  const free = records.filter((item) => item.status === 'published' && item.plan === 'free');
  const paid = records.filter((item) => item.status === 'published' && item.plan === 'paid');
  return <div className="catalog-stack">
    <CatalogSection title="무료로 제공하는 GPTs" description="목회 현장에서 바로 시험하고 활용할 수 있습니다." items={free} loading={loading} />
    <CatalogSection title="판매 GPTs" description="연구소가 목적에 맞게 설계하고 지속적으로 개선하는 전문 도구입니다." items={paid} loading={loading} paid />
  </div>;
}

function CatalogSection({ title, description, items, loading, paid = false }: { title: string; description: string; items: GptItem[]; loading: boolean; paid?: boolean }) {
  return <section className="catalog-section"><header><div><span>{paid ? 'PREMIUM GPTS' : 'FREE GPTS'}</span><h2>{title}</h2><p>{description}</p></div><b>{items.length}</b></header>
    <div className="resource-grid">{items.map((item) => <article className={`resource-card ${item.imageUrl ? 'has-image' : ''}`} key={item.id}>{item.imageUrl && <div className="resource-card-image"><Image src={item.imageUrl} alt={`${item.title} 대표 이미지`} fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized={item.imageUrl.startsWith('data:')} /></div>}<div className="resource-card-top"><span>{item.platform}</span><b>{paid ? item.priceLabel || '가격 문의' : '무료'}</b></div><small>{item.category}</small><h3>{item.title}</h3><p>{item.description}</p><div className="resource-card-bottom"><em>{item.maker}</em><a href={item.accessUrl} target="_blank" rel="noopener noreferrer">{paid ? '구매·문의 →' : '사용하기 ↗'}</a></div></article>)}</div>
    {!loading && !items.length && <div className="catalog-empty"><strong>{paid ? '판매용 GPT를 준비하고 있습니다.' : '등록된 도구가 없습니다.'}</strong><p>관리자에서 공개 상태로 등록하면 이곳에 바로 표시됩니다.</p>{paid && <Link href="/apply?type=inquiry" className="text-link">맞춤 GPT 제작 문의 →</Link>}</div>}
  </section>;
}

export function AppCatalog() {
  const { records, loading } = useRecords<AppItem>('apps', seedApps, true);
  const items = records.filter((item) => item.status === 'published');
  if (!loading && !items.length) return <div className="catalog-empty">등록된 앱이 없습니다.</div>;
  return <div className="resource-grid app-resource-grid">{items.map((item, index) => <article className={`resource-card app-card tone-${(index % 4) + 1} ${item.imageUrl ? 'has-image' : ''}`} key={item.id}>{item.imageUrl && <div className="resource-card-image"><Image src={item.imageUrl} alt={`${item.title} 대표 이미지`} fill sizes="(max-width: 760px) 100vw, 45vw" unoptimized={item.imageUrl.startsWith('data:')} /></div>}<div className="resource-card-top"><span>WEB APP</span><b>{String(index + 1).padStart(2, '0')}</b></div><small>{item.category}</small><h3>{item.title}</h3><p>{item.description}</p><div className="resource-card-bottom"><em>{item.maker}</em><a href={item.accessUrl} target="_blank" rel="noopener noreferrer">앱 열기 ↗</a></div></article>)}</div>;
}
