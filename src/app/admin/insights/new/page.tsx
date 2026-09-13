'use client';

import { useState } from 'react';

export default function NewInsightPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPremium, setIsPremium] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('UI 시연: 리포트가 성공적으로 등록되었습니다! (현재 Firebase DB 연동 전 단계)');
  };

  return (
    <div className="card" style={{ background: 'var(--background)' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem' }}>새 목회 인사이트 리포트 등록</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>리포트 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 2026년 목회 트렌드 리포트"
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>리포트 본문 (마크다운 지원)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={15}
            placeholder="마크다운 형식으로 리포트 본문을 작성하세요."
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <input
            type="checkbox"
            id="premium_insight"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <label htmlFor="premium_insight" style={{ fontWeight: 600, cursor: 'pointer' }}>프리미엄 멤버십 전용 리포트로 설정</label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
          리포트 발행하기
        </button>
      </form>
    </div>
  );
}
