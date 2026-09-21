'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { CatalogPagination, CatalogToolbar, CatalogViewControls, CatalogViewMode, useCatalogBrowser } from '@/components/CatalogBrowser';
import { seedContents } from '@/lib/seed-data';
import { ContentItem, ContentKind } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const contentSearchText = (item: ContentItem) => [item.title, item.excerpt, item.category, item.publishedAt].join(' ');

export default function ContentListing({ kind }: { kind: ContentKind }) {
  const { records, loading } = useRecords<ContentItem>('contents', seedContents, true);
  const items = records.filter((item) => item.kind === kind && item.status === 'published').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const base = kind === 'column' ? '/columns' : '/notices';
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('card');
  const [listPageSize, setListPageSize] = useState<20 | 30 | 50>(20);
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
  const categoryItems = category === 'all' ? items : items.filter((item) => item.category === category);
  const pageSize = viewMode === 'card' ? 12 : listPageSize;
  const browser = useCatalogBrowser(categoryItems, contentSearchText, { desktopPageSize: pageSize, mobilePageSize: pageSize });

  function changeCategory(nextCategory: string) {
    setCategory(nextCategory);
    browser.setPage(1);
  }

  if (loading) return <div className="loading-line">콘텐츠를 불러오는 중입니다.</div>;
  return (
    <section className="content-catalog">
      <CatalogToolbar
        query={browser.query}
        onQueryChange={browser.setQuery}
        resultCount={browser.filteredItems.length}
        totalCount={categoryItems.length}
        placeholder={kind === 'column' ? '칼럼 제목·내용·분류 검색' : '공지 제목·내용·분류 검색'}
        filters={categories.length > 1 ? <div className="catalog-filter-tabs content-category-tabs" role="group" aria-label="콘텐츠 분류">
          <button type="button" className={category === 'all' ? 'active' : ''} onClick={() => changeCategory('all')}>전체</button>
          {categories.map((name) => <button type="button" className={category === name ? 'active' : ''} onClick={() => changeCategory(name)} key={name}>{name}</button>)}
        </div> : undefined}
        viewControls={<CatalogViewControls mode={viewMode} onModeChange={(mode) => { setViewMode(mode); browser.setPage(1); }} listPageSize={listPageSize} onListPageSizeChange={(size) => { setListPageSize(size); browser.setPage(1); }} />}
      />
      <div className={`content-card-grid catalog-${viewMode}-view`}>
        {browser.visibleItems.map((item, index) => (
          <Link href={`${base}/${item.id}`} className={`article-card content-list-card tone-${(index % 3) + 1}`} key={item.id}>
            {item.imageUrl ? <div className="article-card-image"><Image src={item.imageUrl} alt={`${item.title} 대표 이미지`} fill sizes="(max-width: 760px) 50vw, 50vw" unoptimized={item.imageUrl.startsWith('data:')} /></div> : <div className="article-card-placeholder" aria-hidden="true"><span>{kind === 'column' ? 'COLUMN' : 'NOTICE'}</span></div>}
            <div className="content-card-copy"><div className="content-meta"><span>{item.category}</span><time>{item.publishedAt}</time></div><h2>{item.title}</h2><p>{item.excerpt}</p><span className="text-link">{kind === 'column' ? '자세히 읽기' : '공지 확인'} →</span></div>
          </Link>
        ))}
      </div>
      {!browser.filteredItems.length && <div className="catalog-empty"><strong>{items.length ? '검색 결과가 없습니다.' : '아직 발행된 글이 없습니다.'}</strong><p>{items.length ? '검색어 또는 분류를 바꿔 보세요.' : '관리자에서 공개 상태로 등록하면 이곳에 표시됩니다.'}</p></div>}
      <CatalogPagination page={browser.page} pageCount={browser.pageCount} onPageChange={browser.setPage} />
    </section>
  );
}
