import type { Metadata } from 'next';
import ArchiveCatalog from '@/components/ArchiveCatalog';

export const metadata: Metadata = {
  title: '자료 아카이브',
  description: '목회AI연구소의 월간 매거진, 강의 포스터와 연구 이미지를 모아 봅니다.',
};

export default function ArchivePage() {
  return <section className="page-section archive-page">
    <div className="container">
      <div className="page-hero"><span className="eyebrow">VISUAL ARCHIVE</span><h1>연구와 교육의 기록을<br />이미지로 모았습니다.</h1><p>8월과 9월에 파트너와 강의 참여자에게 전달한 자료에서 대표 이미지와 현장 기록을 선별했습니다.</p></div>
      <ArchiveCatalog />
    </div>
  </section>;
}
