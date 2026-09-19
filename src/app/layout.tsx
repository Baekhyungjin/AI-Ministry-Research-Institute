import type { Metadata } from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementPopup from '@/components/AnnouncementPopup';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ministry-ai-lab-rho.vercel.app'),
  title: { default: '목회AI연구소', template: '%s | 목회AI연구소' },
  description: '목회자를 위한 AI 연구, 실습 교육, 강의와 현장 컨설팅을 연결하는 목회AI연구소입니다.',
  openGraph: {
    title: '목회AI연구소',
    description: '기술보다 사람을, 도구보다 사명을 먼저 생각하는 AI 목회 연구 플랫폼입니다.',
    url: '/',
    siteName: '목회AI연구소',
    images: [{
      url: '/images/brand/ministry-ai-social-preview-v1.png',
      width: 1200,
      height: 630,
      alt: '목회AI연구소 — 기술보다 사람을, 도구보다 사명을 먼저',
    }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '목회AI연구소',
    description: '기술보다 사람을, 도구보다 사명을 먼저 생각하는 AI 목회 연구 플랫폼입니다.',
    images: ['/images/brand/ministry-ai-social-preview-v1.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <SiteHeader />
        <AnnouncementPopup />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
