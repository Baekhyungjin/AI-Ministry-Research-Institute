import Link from 'next/link';
import BrandSymbol from '@/components/BrandSymbol';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid institutional-footer-grid">
        <div className="footer-brand"><div className="footer-brand-lockup"><span className="footer-official-logo"><BrandSymbol /></span><span className="footer-wordmark">목회AI연구소 <small>MINISTRY AI LAB</small></span></div><h2>기술보다 사람을,<br />도구보다 사명을 먼저.</h2><p>목회자가 말씀과 사람에게 더 집중하도록<br />AI 활용의 바른 기준과 실제 방법을 연구합니다.</p></div>
        <div><h3>연구소</h3><Link href="/about">연구소 소개</Link><Link href="/projects">사역 프로젝트</Link><Link href="/notices">공지사항</Link><Link href="/site-map">전체 사이트맵</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/admin">관리자</Link></div>
        <div><h3>연구·교육</h3><Link href="/columns">연구소 칼럼</Link><Link href="/schedule">교육 일정</Link><Link href="/gpts">무료·판매 GPT</Link><Link href="/apps">연구 앱</Link><Link href="/replays">세미나 다시보기</Link></div>
        <div><h3>문의</h3><Link href="/apply?type=lecture">강의 요청</Link><Link href="/partners">파트너 모집</Link><Link href="/card">백형진 소장 명함</Link><a href="https://open.kakao.com/o/smi51Hqi" target="_blank" rel="noopener noreferrer">개인 카카오톡 ↗</a><a href="https://open.kakao.com/o/g8xjXlIg" target="_blank" rel="noopener noreferrer">연구소 오픈채팅 ↗</a></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 Ministry AI Lab. All rights reserved.</span><span>안양선민교회 현장에서 연구합니다.</span></div>
    </footer>
  );
}
