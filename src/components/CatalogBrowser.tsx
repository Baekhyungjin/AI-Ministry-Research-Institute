'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';

export function useCatalogBrowser<T>(items: T[], getSearchText: (item: T) => string) {
  const [query, setQueryState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const syncPageSize = () => setPageSize(media.matches ? 4 : 6);
    syncPageSize();
    media.addEventListener('change', syncPageSize);
    return () => media.removeEventListener('change', syncPageSize);
  }, []);

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

export function CatalogToolbar({ query, onQueryChange, resultCount, totalCount, placeholder, filters }: {
  query: string;
  onQueryChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  placeholder: string;
  filters?: ReactNode;
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
    <p><strong>{resultCount}</strong>개 표시 <span>/ 전체 {totalCount}개</span></p>
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
