'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { isSupabaseAdmin, isSupabaseConfigured, supabase } from '@/lib/supabase';

const adminLinks = [
  { href: '/admin', label: '운영 현황', exact: true },
  { href: '/admin/applications', label: '문의·신청 관리' },
  { href: '/admin/content', label: '칼럼·공지 관리' },
  { href: '/admin/schedules', label: '일정 관리' },
  { href: '/admin/resources', label: 'GPT·앱·다시보기' },
  { href: '/admin/leads', label: '파트너·시청 신청' },
  { href: '/admin/analytics', label: '방문·조회 통계' },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [dataMode, setDataMode] = useState<'demo' | 'ready' | 'missing' | 'local'>('local');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && sessionStorage.getItem('miracle-admin-demo') === 'true') {
      queueMicrotask(() => {
        setDataMode('demo');
        setChecking(false);
      });
      return;
    }

    const supabaseClient = supabase;
    if (supabaseClient) {
      const verify = async () => {
        const { data, error } = await supabaseClient.auth.getUser();
        if (error || !data.user || !isSupabaseAdmin(data.user.app_metadata)) {
          if (data.user) await supabaseClient.auth.signOut();
          router.replace(data.user ? '/login?reason=admin' : '/login');
          return;
        }
        const { error: schemaError } = await supabaseClient.from('contents').select('id').limit(1);
        setDataMode(schemaError ? 'missing' : 'ready');
        setChecking(false);
      };
      void verify();
      const { data } = supabaseClient.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') router.replace('/login');
      });
      return () => data.subscription.unsubscribe();
    }

    router.replace('/login');
  }, [router]);

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    sessionStorage.removeItem('miracle-admin-demo');
    document.cookie = 'miracle-admin-demo=; path=/; max-age=0; samesite=lax';
    router.push('/login');
  }

  if (checking) return <div className="admin-loading">관리자 권한을 확인하고 있습니다.</div>;
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div><span className="admin-kicker">CONTROL CENTER</span><h2>연구소 운영실</h2><span className={`data-mode ${dataMode === 'ready' ? 'live' : ''}`}>{dataMode === 'demo' ? '로컬 예시 모드' : dataMode === 'ready' ? 'Supabase 운영 모드' : dataMode === 'missing' ? 'DB 구조 확인 필요' : isSupabaseConfigured ? 'Supabase 설정됨' : '로컬 관리자 모드'}</span></div>
        <nav>{adminLinks.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return <Link href={link.href} className={active ? 'active' : ''} key={link.href}>{link.label}<span>→</span></Link>;
        })}</nav>
        <div className="admin-sidebar-bottom"><Link href="/">← 사용자 홈페이지</Link><button type="button" onClick={logout}>로그아웃</button></div>
      </aside>
      <section className="admin-main">{children}</section>
    </div>
  );
}
