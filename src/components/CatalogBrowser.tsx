'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';

export type CatalogViewMode = 'card' | 'list';

export function useCatalogBrowser<T>(
  items: T[],
  getSearchText: (item: T) => string,
  options: { desktopPageSize?: number; mobilePageSize?: number; initialQuery?: string } = {},
) {
  const [query, setQueryState] = useState(options.initialQuery ?? '');
  const [page, setPage] = useState(1);
  const desktopPageSize = options.desktopPageSize ?? 6;
  const mobilePageSize = options.mobilePageSize ?? 4;
  const [pageSize, setPageSize] = useState(desktopPageSize);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const syncPageSize = () => setPageSize(media.matches ? mobilePageSize : desktopPageSize);
    syncPageSize();
    media.addEventListener('change', syncPageSize);
    return () => media.removeEventListener('change', syncPageSize);
  }, [desktopPageSize, mobilePageSize]);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('ko-KR');
    if (!keyword) return items;
    return items.filter((item) => getSearchText(item).toLocaleLowerCase('ko-KR').includes(keyword));
  }, [getSearchText, items, query]);

  const pageCount = Math.ceil(filteredItems.length / pageSize);
  const safePage = pageCount ? Math.min(page, pageCount) : 1;
  const visibleItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);

  function setQuery(value: string) {
    setQueryState(value);
    setPage(1);
  }

  return { query, setQuery, page: safePage, setPage, pageCount, pageSize, filteredItems, visibleItems };
}

export function CatalogToolbar({ query, onQueryChange, resultCount, totalCount, placeholder, filters, viewControls }: {
  query: string;
  onQueryChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  placeholder: string;
  filters?: ReactNode;
  viewControls?: ReactNode;
}) {
  return <div className="catalog-tools">
    <div className="catalog-tools-main">
      <label className="catalog-search">
        <span aria-hidden="true">⌕</span>
        <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
        {query && <button type="button" onClick={() => onQueryChange('')} aria-label="검색어 지우기">×</button>}
      </label>
      {filters}
    </div>
    <div className="catalog-tools-side">
      {viewControls}
      <p><strong>{resultCount}</strong>개 표시 <span>/ 전체 {totalCount}개</span></p>
    </div>
  </div>;
}

export function CatalogViewControls({ mode, onModeChange, listPageSize, onListPageSizeChange }: {
  mode: CatalogViewMode;
  onModeChange: (mode: CatalogViewMode) => void;
  listPageSize: 20 | 30 | 50;
  onListPageSizeChange: (size: 20 | 30 | 50) => void;
}) {
  return <div className="catalog-view-controls" aria-label="목록 보기 설정">
    <span>보기</span>
    <div className="catalog-view-switch" role="group" aria-label="보기 방식">
      <button type="button" className={mode === 'card' ? 'active' : ''} onClick={() => onModeChange('card')} aria-pressed={mode === 'card'}><i aria-hidden="true">▦</i> 카드형</button>
      <button type="button" className={mode === 'list' ? 'active' : ''} onClick={() => onModeChange('list')} aria-pressed={mode === 'list'}><i aria-hidden="true">☷</i> 목록형</button>
    </div>
    {mode === 'list' && <label className="catalog-page-size"><span>한 페이지</span><select value={listPageSize} onChange={(event) => onListPageSizeChange(Number(event.target.value) as 20 | 30 | 50)} aria-label="목록형 한 페이지 표시 개수"><option value={20}>20개</option><option value={30}>30개</option><option value={50}>50개</option></select></label>}
  </div>;
}

export function CatalogPagination({ page, pageCount, onPageChange }: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  return <nav className="catalog-pagination" aria-label="목록 페이지 이동">
    <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← 이전</button>
    <span><strong>{page}</strong> / {pageCount}</span>
    <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>다음 →</button>
  </nav>;
}
