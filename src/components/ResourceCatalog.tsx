'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { CatalogPagination, CatalogToolbar, useCatalogBrowser } from '@/components/CatalogBrowser';
import { seedApps, seedGpts } from '@/lib/seed-data';
import { AppItem, GptItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const gptSearchText = (item: GptItem) => [item.title, item.description, item.category, item.maker, item.platform, item.plan === 'free' ? '무료' : '판매'].join(' ');
const appSearchText = (item: AppItem) => [item.title, item.description, item.category, item.maker].join(' ');

export function GptCatalog() {
  const { records, loading } = useRecords<GptItem>('gpts', seedGpts, true);
  const [plan, setPlan] = useState<'all' | 'free' | 'paid'>('all');
  const published = records.filter((item) => item.status === 'published');
  const items = plan === 'all' ? published : published.filter((item) => item.plan === plan);
  const browser = useCatalogBrowser(items, gptSearchText);

  function changePlan(nextPlan: 'all' | 'free' | 'paid') {
    setPlan(nextPlan);
    browser.setPage(1);
  }

  return <section className="catalog-section catalog-directory">
    <header><div><span>GPT DIRECTORY</span><h2>무료·판매 GPT</h2><p>이름, 용도 또는 분류로 검색해 필요한 도구를 빠르게 찾으세요.</p></div><b>{published.length}</b></header>
    <CatalogToolbar query={browser.query} onQueryChange={browser.setQuery} resultCount={browser.filteredItems.length} totalCount={items.length} placeholder="GPT 이름·용도·분류 검색" filters={<div className="catalog-filter-tabs" role="group" aria-label="GPT 공개 유형"><button type="button" className={plan === 'all' ? 'active' : ''} onClick={() => changePlan('all')}>전체</button><button type="button" className={plan === 'free' ? 'active' : ''} onClick={() => changePlan('free')}>무료</button><button type="button" className={plan === 'paid' ? 'active' : ''} onClick={() => changePlan('paid')}>판매</button></div>} />
    <div className="resource-grid catalog-result-grid">{browser.visibleItems.map((item) => <article className={`resource-card ${item.imageUrl ? 'has-image' : ''}`} key={item.id}>
      {item.imageUrl && <div className="resource-card-image"><Image src={item.imageUrl} alt={`${item.title} 대표 이미지`} fill sizes="(max-width: 760px) 100vw, 25vw" unoptimized={item.imageUrl.startsWith('data:')} /></div>}
      <div className="resource-card-top"><span>{item.platform}</span><b>{item.plan === 'paid' ? item.priceLabel || '가격 문의' : '무료'}</b></div>
      <small>{item.category}</small><h3>{item.title}</h3><p>{item.description}</p>
      <div className="resource-card-bottom"><em>{item.maker}</em><a href={item.accessUrl} target="_blank" rel="noopener noreferrer">{item.plan === 'paid' ? '구매·문의 →' : '사용하기 ↗'}</a></div>
    </article>)}</div>
    {!loading && !browser.filteredItems.length && <div className="catalog-empty"><strong>{published.length ? '검색 결과가 없습니다.' : '등록된 GPT가 없습니다.'}</strong><p>{published.length ? '검색어 또는 무료·판매 필터를 바꿔 보세요.' : '관리자에서 공개 상태로 등록하면 이곳에 표시됩니다.'}</p>{plan === 'paid' && <Link href="/apply?type=inquiry" className="text-link">맞춤 GPT 제작 문의 →</Link>}</div>}
    <CatalogPagination page={browser.page} pageCount={browser.pageCount} onPageChange={browser.setPage} />
  </section>;
}

export function AppCatalog() {
  const { records, loading } = useRecords<AppItem>('apps', seedApps, true);
  const items = records.filter((item) => item.status === 'published');
  const browser = useCatalogBrowser(items, appSearchText);

  return <section className="catalog-section catalog-directory">
    <CatalogToolbar query={browser.query} onQueryChange={browser.setQuery} resultCount={browser.filteredItems.length} totalCount={items.length} placeholder="앱 이름·용도·분류 검색" />
    <div className="resource-grid app-resource-grid catalog-result-grid">{browser.visibleItems.map((item, index) => <article className={`resource-card app-card tone-${(index % 4) + 1} ${item.imageUrl ? 'has-image' : ''}`} key={item.id}>
      {item.imageUrl && <div className="resource-card-image"><Image src={item.imageUrl} alt={`${item.title} 대표 이미지`} fill sizes="(max-width: 760px) 100vw, 25vw" unoptimized={item.imageUrl.startsWith('data:')} /></div>}
      <div className="resource-card-top"><span>WEB APP</span><b>{String((browser.page - 1) * browser.pageSize + index + 1).padStart(2, '0')}</b></div>
      <small>{item.category}</small><h3>{item.title}</h3><p>{item.description}</p>
      <div className="resource-card-bottom"><em>{item.maker}</em><a href={item.accessUrl} target="_blank" rel="noopener noreferrer">앱 열기 ↗</a></div>
    </article>)}</div>
    {!loading && !browser.filteredItems.length && <div className="catalog-empty"><strong>{items.length ? '검색 결과가 없습니다.' : '등록된 앱이 없습니다.'}</strong><p>{items.length ? '다른 앱 이름이나 용도로 검색해 보세요.' : '관리자에서 공개 상태로 등록하면 이곳에 표시됩니다.'}</p></div>}
    <CatalogPagination page={browser.page} pageCount={browser.pageCount} onPageChange={browser.setPage} />
  </section>;
}
