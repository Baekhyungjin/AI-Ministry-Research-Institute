import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: '목회AI연구소 홈페이지의 개인정보 수집, 이용, 보관과 문의 방법을 안내합니다.',
};

export default function PrivacyPage() {
  return <section className="page-section soft-section"><div className="narrow-container privacy-page">
    <header className="page-hero compact"><span className="eyebrow">PRIVACY</span><h1>개인정보 처리방침</h1><p>문의와 신청 과정에서 맡겨주신 정보를 필요한 범위에서 안전하게 처리합니다.</p></header>
    <section><h2>1. 수집하는 정보</h2><p>성함, 교회·기관명, 직분·역할, 연락처, 이메일, 문의·신청 내용과 일정 정보를 수집합니다. 세미나 다시보기 후원 신청에서는 입금자명과 신청 금액을 추가로 수집합니다.</p></section>
    <section><h2>2. 이용 목적</h2><p>강의·협업·파트너·교육·다시보기 신청 확인, 일정 조율, 입금 확인, 신청자 안내와 문의 답변을 위해 사용합니다.</p></section>
    <section><h2>3. 보유 및 파기</h2><p>신청 처리 목적을 달성한 날부터 1년 동안 보관한 뒤 안전하게 파기합니다. 관계 법령에 따라 별도의 보존이 필요한 경우에는 해당 기간 동안 분리해 보관합니다.</p></section>
    <section><h2>4. 제3자 제공과 처리 위탁</h2><p>법령상 근거가 있거나 이용자가 별도로 동의한 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다. 홈페이지 운영을 위해 Supabase의 데이터베이스·저장소와 Resend의 이메일 발송 기능을 사용합니다.</p></section>
    <section><h2>5. 이용자의 권리</h2><p>본인의 개인정보에 대한 열람, 정정, 삭제와 처리 정지를 요청할 수 있습니다. 요청을 확인한 뒤 지체 없이 필요한 조치를 진행합니다.</p></section>
    <section><h2>6. 개인정보 문의</h2><p>개인정보 관련 요청과 문의는 <a href="mailto:backhung65@gmail.com">backhung65@gmail.com</a>으로 보내주세요.</p></section>
    <p className="privacy-effective">시행일: 2026년 9월 14일</p>
    <Link href="/apply" className="btn btn-secondary">문의 페이지로 돌아가기</Link>
  </div></section>;
}
