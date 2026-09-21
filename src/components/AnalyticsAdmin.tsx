'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Overview = {
  total_page_views: number;
  total_unique_visitors: number;
  last_30d_page_views: number;
  last_30d_unique_visitors: number;
  today_page_views: number;
  today_unique_visitors: number;
  total_shares: number;
  last_30d_shares: number;
};
type DailyRow = { event_date: string; page_views: number; unique_visitors: number; shares: number };
type ContentRow = { content_type: string; content_id: string; path: string; title: string; page_views: number; unique_visitors: number; shares: number; last_activity_at: string };
type PageRow = { path: string; content_type: string; content_id: string | null; page_views: number; unique_visitors: number; shares: number; last_activity_at: string };

const emptyOverview: Overview = {
  total_page_views: 0, total_unique_visitors: 0, last_30d_page_views: 0,
  last_30d_unique_visitors: 0, today_page_views: 0, today_unique_visitors: 0,
  total_shares: 0, last_30d_shares: 0,
};

function number(value: unknown) { return Number(value || 0); }
function formatDate(value: string) {
  return value ? new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(new Date(value)) : '-';
}
function typeLabel(type: string) {
  return ({ column: '칼럼', notice: '공지', replay: '다시보기', gpt: 'GPT', app: '앱', schedule: '일정', site: '페이지' } as Record<string, string>)[type] || type;
}

export default function AnalyticsAdmin() {
  const [overview, setOverview] = useState<Overview>(emptyOverview);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) {
      queueMicrotask(() => { setError('Supabase 연결 설정을 확인해 주세요.'); setLoading(false); });
      return;
    }

    async function load() {
      const [overviewResult, dailyResult, contentResult, pageResult] = await Promise.all([
        client!.from('analytics_overview').select('*').single(),
        client!.from('analytics_daily_summary').select('*').order('event_date', { ascending: false }).limit(30),
        client!.from('analytics_content_summary').select('*').order('page_views', { ascending: false }).limit(100),
        client!.from('analytics_page_summary').select('*').order('page_views', { ascending: false }).limit(20),
      ]);
      const firstError = overviewResult.error || dailyResult.error || contentResult.error || pageResult.error;
      if (firstError) {
        setError('방문 통계 데이터를 불러오지 못했습니다. 분석용 DB 구조와 관리자 권한을 확인해 주세요.');
      } else {
        const raw = overviewResult.data as Record<string, unknown>;
        setOverview({
          total_page_views: number(raw.total_page_views),
          total_unique_visitors: number(raw.total_unique_visitors),
          last_30d_page_views: number(raw.last_30d_page_views),
          last_30d_unique_visitors: number(raw.last_30d_unique_visitors),
          today_page_views: number(raw.today_page_views),
          today_unique_visitors: number(raw.today_unique_visitors),
          total_shares: number(raw.total_shares),
          last_30d_shares: number(raw.last_30d_shares),
        });
        setDaily((dailyResult.data || []) as DailyRow[]);
        setContents((contentResult.data || []) as ContentRow[]);
        setPages((pageResult.data || []) as PageRow[]);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const chartRows = useMemo(() => [...daily].slice(0, 14).reverse(), [daily]);
  const chartMax = Math.max(1, ...chartRows.map((row) => number(row.page_views)));

  if (loading) return <div className="admin-loading">방문 통계를 불러오고 있습니다.</div>;

  return <div className="analytics-admin">
    <header className="admin-page-header"><div><span>FIRST-PARTY ANALYTICS</span><h1>방문·조회 통계</h1><p>사이트 방문과 게시물 조회, 공유 성과를 확인합니다. 집계는 기능 적용 이후부터 시작됩니다.</p></div></header>
    {error ? <div className="analytics-error"><strong>통계 연결을 확인해 주세요.</strong><p>{error}</p></div> : <>
      <div className="analytics-metrics">
        <article><span>최근 30일 방문자</span><strong>{overview.last_30d_unique_visitors.toLocaleString()}</strong><small>브라우저 기준 순 방문자</small></article>
        <article><span>최근 30일 조회</span><strong>{overview.last_30d_page_views.toLocaleString()}</strong><small>모든 공개 페이지 조회</small></article>
        <article><span>오늘 조회</span><strong>{overview.today_page_views.toLocaleString()}</strong><small>방문자 {overview.today_unique_visitors.toLocaleString()}명</small></article>
        <article><span>누적 공유</span><strong>{overview.total_shares.toLocaleString()}</strong><small>최근 30일 {overview.last_30d_shares.toLocaleString()}회</small></article>
      </div>

      <section className="admin-panel analytics-chart-panel">
        <div className="panel-heading"><div><span>LAST 14 DAYS</span><h2>일별 조회 흐름</h2></div><small>전체 누적 방문자 {overview.total_unique_visitors.toLocaleString()}명 · 조회 {overview.total_page_views.toLocaleString()}회</small></div>
        {chartRows.length ? <div className="analytics-chart" aria-label="최근 14일 조회수 막대그래프">{chartRows.map((row) => <div key={row.event_date} className="analytics-bar-column"><span>{number(row.page_views)}</span><div><i style={{ height: `${Math.max(4, (number(row.page_views) / chartMax) * 100)}%` }} /></div><time>{formatDate(row.event_date)}</time></div>)}</div> : <div className="empty-state small">아직 집계된 방문이 없습니다.</div>}
      </section>

      <section className="admin-panel analytics-table-panel">
        <div className="panel-heading"><div><span>CONTENT PERFORMANCE</span><h2>게시물별 성과</h2></div><small>조회수 순</small></div>
        {contents.length ? <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>게시물</th><th>구분</th><th>조회</th><th>방문자</th><th>공유</th><th>최근 활동</th></tr></thead><tbody>{contents.map((item) => <tr key={`${item.content_type}-${item.content_id}-${item.path}`}><td><Link href={item.path} target="_blank">{item.title}</Link><small>{item.path}</small></td><td>{typeLabel(item.content_type)}</td><td>{number(item.page_views).toLocaleString()}</td><td>{number(item.unique_visitors).toLocaleString()}</td><td>{number(item.shares).toLocaleString()}</td><td>{formatDate(item.last_activity_at)}</td></tr>)}</tbody></table></div> : <div className="empty-state small">아직 조회된 게시물이 없습니다.</div>}
      </section>

      <section className="admin-panel analytics-table-panel">
        <div className="panel-heading"><div><span>TOP PAGES</span><h2>많이 본 페이지</h2></div><small>상위 20개</small></div>
        {pages.length ? <div className="analytics-table-wrap"><table className="analytics-table compact"><thead><tr><th>경로</th><th>조회</th><th>방문자</th><th>공유</th></tr></thead><tbody>{pages.map((item) => <tr key={`${item.path}-${item.content_id || 'page'}`}><td><Link href={item.path} target="_blank">{item.path}</Link></td><td>{number(item.page_views).toLocaleString()}</td><td>{number(item.unique_visitors).toLocaleString()}</td><td>{number(item.shares).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty-state small">아직 페이지 조회 기록이 없습니다.</div>}
      </section>
      <p className="analytics-privacy-note">원본 IP 주소는 저장하지 않습니다. 브라우저에서 생성한 임의 식별자로 중복 조회를 줄이며, 브라우저의 추적 거부 설정을 존중합니다.</p>
    </>}
  </div>;
}
