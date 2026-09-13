import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '전체 사이트맵',
  description: '목회AI연구소 홈페이지의 연구, 교육, 도구, 소식과 문의 메뉴를 한눈에 확인합니다.',
};

const groups = [
  { label: 'INSTITUTE', title: '연구소', links: [
    ['/about', '연구소 소개', '사명, 연구 방식과 백형진 소장 소개'],
    ['/projects', '사역 프로젝트', '현장에서 진행하는 연구와 실험'],
    ['/partners', '파트너 모집', '협력 교회와 개인 참여 안내'],
    ['/card', '백형진 소장 명함', '연락처 확인과 명함 저장'],
  ] },
  { label: 'RESEARCH', title: '연구·콘텐츠', links: [
    ['/columns', '연구소 칼럼', '관리자가 등록하는 연구와 칼럼'],
    ['/insights', '목회 인사이트', '목회 현장을 위한 분석과 가이드'],
    ['/prompts', '프롬프트 자료', '바로 활용할 수 있는 실전 자료'],
    ['/archive', '자료 아카이브', '매거진, 포스터와 교육 기록'],
  ] },
  { label: 'EDUCATION', title: '교육·일정', links: [
    ['/schedule', '교육 일정', '세미나 일정 확인과 신청'],
    ['/replays', '세미나 다시보기', '정보 등록 후 지난 교육 시청'],
    ['/apply?type=lecture', '강의 요청', '교회·기관 맞춤 강의 문의'],
  ] },
  { label: 'TOOLS', title: 'GPT·앱', links: [
    ['/gpts', '무료·판매 GPT', '목회와 교회 업무를 위한 GPT'],
    ['/apps', '연구 결과 앱', '연구 결과를 구현한 웹 도구'],
  ] },
  { label: 'NEWS', title: '소식·문의', links: [
    ['/notices', '공지사항', '연구소의 운영 소식과 안내'],
    ['/apply', '문의 및 강의 신청', '일반 문의, 일정·강의 신청 접수'],
    ['/privacy', '개인정보처리방침', '신청 데이터의 수집·보관·삭제 기준'],
  ] },
  { label: 'ADMIN', title: '운영자', links: [
    ['/login', '관리자 로그인', '승인된 운영자 전용 로그인'],
    ['/admin', '운영 현황', '접수와 콘텐츠 현황 확인'],
  ] },
];

const flow = [
  ['01', '발견', '칼럼·공지·SNS에서 연구소를 발견합니다.'],
  ['02', '신뢰', '연구소 소개와 프로젝트, 교육 기록을 확인합니다.'],
  ['03', '참여', '일정·GPT·앱·세미나를 선택해 이용합니다.'],
  ['04', '연결', '문의·강의·파트너 신청이 관리자 화면에 기록됩니다.'],
];

export default function SiteMapPage() {
  return <section className="page-section soft-section">
    <div className="container">
      <header className="page-hero sitemap-hero"><span className="eyebrow">SITE MAP</span><h1>필요한 정보로<br />바로 이동하세요.</h1><p className="sitemap-intro">연구소 소개부터 연구자료, 교육 일정, AI 도구와 문의까지 홈페이지의 전체 구조를 정리했습니다.</p></header>
      <div className="sitemap-grid">{groups.map((group) => <section className="sitemap-group" key={group.label}><span>{group.label}</span><h2>{group.title}</h2><div className="sitemap-links">{group.links.map(([href, title, description]) => <Link href={href} key={href}><div><strong>{title}</strong><small>{description}</small></div><b aria-hidden="true">→</b></Link>)}</div></section>)}</div>
      <section className="sitemap-flow"><h2>방문자 이용 흐름</h2><ol>{flow.map(([number, title, description]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{description}</p></li>)}</ol></section>
    </div>
  </section>;
}
