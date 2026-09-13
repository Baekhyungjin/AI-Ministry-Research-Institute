export default function MembershipPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>멤버십 안내</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--foreground)', opacity: 0.8, marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>
        사역의 퀄리티를 높이고 연구 시간을 단축시켜 줄 프리미엄 리소스를 무제한으로 누려보세요.
      </p>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', maxWidth: '900px', margin: '0 auto' }}>
        {/* Basic Plan */}
        <div className="card" style={{ padding: '3rem 2rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Basic</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Free</div>
          <ul style={{ textAlign: 'left', marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8 }}>
            <li>✓ 일부 공개 AI 프롬프트 열람</li>
            <li>✓ 월간 뉴스레터 구독</li>
            <li>✓ 커뮤니티 게시판 이용</li>
          </ul>
          <button className="btn btn-outline" style={{ width: '100%' }}>현재 플랜</button>
        </div>

        {/* Premium Plan */}
        <div className="card" style={{ padding: '3rem 2rem', border: '2px solid var(--accent)', position: 'relative', transform: 'scale(1.05)', zIndex: 1, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)' }}>
          <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>RECOMMENDED</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Premium</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>₩19,900<span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.6 }}>/월</span></div>
          <div style={{ fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '2rem' }}>첫 달 무료 체험</div>
          <ul style={{ textAlign: 'left', marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>✓ <strong>모든</strong> 프리미엄 AI 프롬프트 무제한 열람</li>
            <li>✓ 심층 목회/신학 리서치 리포트 (월 2회)</li>
            <li>✓ 자동화 문서 생성 툴 이용 권한</li>
            <li>✓ 프리미엄 전용 Q&A 지원</li>
          </ul>
          <button className="btn btn-primary" style={{ width: '100%' }}>프리미엄 구독하기</button>
        </div>
      </div>
    </div>
  );
}
