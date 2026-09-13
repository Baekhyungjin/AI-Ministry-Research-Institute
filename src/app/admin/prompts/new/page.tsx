'use client';

import { useState } from 'react';
// import { collection, addDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';

export default function NewPromptPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('설교 준비');
  const [content, setContent] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Firebase 연동 로직 (현재는 UI 시연을 위해 주석 처리)
    /*
    try {
      await addDoc(collection(db, 'prompts'), {
        title,
        category,
        content,
        isPremium,
        views: 0,
        createdAt: new Date()
      });
      alert('성공적으로 등록되었습니다!');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('오류가 발생했습니다.');
    }
    */
    alert('UI 시연: 프롬프트가 성공적으로 등록되었습니다! (현재 Firebase DB 연동 전 단계)');
  };

  return (
    <div className="card" style={{ background: 'var(--background)' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem' }}>새 AI 프롬프트 등록</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>프롬프트 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 주일학교 공과공부 아이스브레이킹"
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', outline: 'none', fontFamily: 'inherit' }}
          >
            <option value="설교 준비">설교 준비</option>
            <option value="행정/기획">행정/기획</option>
            <option value="목회 돌봄">목회 돌봄</option>
            <option value="교육/훈련">교육/훈련</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>프롬프트 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="AI에게 입력할 프롬프트 본문을 작성하세요."
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <input
            type="checkbox"
            id="premium"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <label htmlFor="premium" style={{ fontWeight: 600, cursor: 'pointer' }}>프리미엄 멤버십 전용 자료로 설정</label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
          프롬프트 데이터베이스에 등록하기
        </button>
      </form>
    </div>
  );
}
