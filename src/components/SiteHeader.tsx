'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { seedContents } from '@/lib/seed-data';
import { ContentItem } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const navigation = [
  { href: '/about', label: '연구소' },
  { href: '/columns', label: '연구·콘텐츠', children: [
    { href: '/columns', label: '연구소 칼럼', description: 'AI와 목회를 함께 읽는 연구' },
    { href: '/insights', label: '목회 인사이트', description: '현장을 위한 분석과 가이드' },
    { href: '/prompts', label: '프롬프트 자료', description: '바로 활용하는 실전 도구' },
    { href: '/archive', label: '자료 아카이브', description: '매거진·출판·교육 기록' },
  ] },
  { href: '/schedule', label: '교육', children: [
    { href: '/schedule', label: '교육 일정', description: '워크숍과 세미나 일정' },
    { href: '/replays', label: '세미나 다시보기', description: '신청 후 영상 시청' },
    { href: '/apply?type=lecture', label: '강의 요청', description: '교회·기관 맞춤형 교육' },
  ] },
  { href: '/projects', label: '사역·프로젝트' },
  { href: '/gpts', label: 'GPT·앱', children: [
    { href: '/gpts', label: '무료·판매 GPT', description: '목회를 위한 AI 도구' },
    { href: '/apps', label: '연구소 앱', description: '연구 결과를 실제 앱으로' },
  ] },
  { href: '/partners', label: '파트너' },
  { href: '/notices', label: '소식' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { records: contents } = useRecords<ContentItem>('contents', seedContents, true);
  const now = Date.now();
  const latestNotice = contents
    .filter((item) => item.kind === 'notice' && item.status === 'published' && (!item.startsAt || new Date(item.startsAt).getTime() <= now) && (!item.endsAt || new Date(item.endsAt).getTime() >= now))
    .sort((a,b) => (b.priority || 0) - (a.priority || 0) || b.publishedAt.localeCompare(a.publishedAt))
    .find((item) => !item.noticePlacement || item.noticePlacement === 'strip');
  const closeMenu = () => setOpen(false);

  return (
    <>
      <div className="notice-strip"><div className="container"><span>연구소 소식</span><p>{latestNotice?.title ?? '목회AI연구소의 새로운 소식을 확인하세요.'}</p><Link href={latestNotice ? `/notices/${latestNotice.id}` : '/notices'}>자세히 보기 →</Link></div></div>
      <header className="site-header institutional-header"><div className="container nav-inner">
        <Link href="/" className="brand institutional-brand" onClick={closeMenu} aria-label="목회AI연구소 홈"><span className="official-brand-mark"><Image src="/images/brand/ministry-ai-logo.png" alt="" fill priority sizes="48px" /></span><span><strong>목회AI연구소</strong><small>MINISTRY AI LAB</small></span></Link>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-label={open ? '메뉴 닫기' : '메뉴 열기'} onClick={() => setOpen((value) => !value)}><span /><span /></button>
        <nav className={`main-nav institutional-nav ${open ? 'is-open' : ''}`} aria-label="주요 메뉴">
          {navigation.map((item) => <div className={`nav-group ${pathname.startsWith(item.href) || item.children?.some((child) => pathname.startsWith(child.href.split('?')[0])) ? 'active' : ''}`} key={item.label}><Link href={item.href} onClick={closeMenu}>{item.label}{item.children && <span aria-hidden="true">⌄</span>}</Link>{item.children && <div className="nav-dropdown">{item.children.map((child) => <Link href={child.href} onClick={closeMenu} key={child.href}><strong>{child.label}</strong><small>{child.description}</small></Link>)}</div>}</div>)}
          <Link href="/admin" className="nav-admin" onClick={closeMenu}>관리자</Link>
          <Link href="/apply" className="btn btn-primary nav-cta" onClick={closeMenu}>문의·신청</Link>
        </nav>
      </div></header>
    </>
  );
}
