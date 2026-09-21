import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: '목회AI연구소 홈페이지의 개인정보 수집, 이용, 보관과 문의 방법을 안내합니다.',
};

export default function PrivacyPage() {
  return <section className="page-section soft-section"><div className="narrow-container privacy-page">
    <header className="page-hero compact"><span className="eyebrow">PRIVACY</span><h1>개인정보 처리방침</h1><p>문의와 신청 과정에서 맡겨주신 정보를 필요한 범위에서 안전하게 처리합니다.</p></header>
    <section><h2>1. 수집하는 정보</h2><p>성함, 교회·기관명, 직분·역할, 연락처, 이메일, 문의·신청 내용과 일정 정보를 수집합니다. 유료 세미나와 다시보기 후원 신청에서는 입금자명, 신청 금액, 입금 상태와 채팅방 안내 확인 여부를 추가로 수집합니다. 댓글 작성 시 작성자 이름 또는 별칭, 댓글 내용과 수정·삭제용 비밀번호의 암호화된 해시를 수집하며 비밀번호 원문은 저장하지 않습니다. 홈페이지 이용 과정에서는 브라우저에서 임의 생성한 식별자, 방문 경로, 게시물 조회·공유 기록, 유입 도메인, 기기 유형과 캠페인 식별 정보가 수집될 수 있습니다. 홈페이지 분석 기능은 원본 IP 주소를 저장하지 않습니다.</p></section>
    <section><h2>2. 이용 목적</h2><p>강의·협업·파트너·교육·다시보기 신청 확인, 일정 조율, 입금 확인, 신청자 안내와 문의 답변을 위해 사용합니다. 댓글 정보는 의견 교류, 작성자 본인의 수정·삭제 확인과 부적절한 게시물 관리에 사용합니다. 방문·조회 정보는 홈페이지 이용 현황과 콘텐츠 반응을 파악하고 서비스를 개선하는 데 사용합니다.</p></section>
    <section><h2>3. 보유 및 파기</h2><p>신청 정보는 처리 목적을 달성한 날부터 1년 동안, 방문 통계 정보는 수집일부터 13개월 동안 보관한 뒤 안전하게 파기합니다. 댓글은 작성자 또는 관리자가 삭제할 때까지 공개되며, 운영상 숨김 처리한 댓글은 처리일로부터 최대 1년 뒤 파기합니다. 관계 법령에 따라 별도의 보존이 필요한 경우에는 해당 기간 동안 분리해 보관합니다.</p></section>
    <section><h2>4. 제3자 제공과 처리 위탁</h2><p>법령상 근거가 있거나 이용자가 별도로 동의한 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다. 홈페이지 운영을 위해 Supabase의 데이터베이스·저장소와 Resend의 이메일 발송 기능을 사용합니다.</p></section>
    <section><h2>5. 이용자의 권리</h2><p>본인의 개인정보에 대한 열람, 정정, 삭제와 처리 정지를 요청할 수 있습니다. 요청을 확인한 뒤 지체 없이 필요한 조치를 진행합니다.</p></section>
    <section><h2>6. 개인정보 문의</h2><p>개인정보 관련 요청과 문의는 <a href="mailto:backhung65@gmail.com">backhung65@gmail.com</a>으로 보내주세요.</p></section>
    <p className="privacy-effective">시행일: 2026년 9월 21일</p>
    <Link href="/apply" className="btn btn-secondary">문의 페이지로 돌아가기</Link>
  </div></section>;
}
