'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [schemaReady, setSchemaReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('reason') === 'admin') {
      setError('이 계정에는 관리자 권한이 없습니다. 관리자 계정으로 로그인해 주세요.');
    }
    if (supabase) {
      void supabase
        .from('contents')
        .select('id')
        .limit(1)
        .then(({ error: schemaError }) => setSchemaReady(!schemaError));
    }
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      if (supabase) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: String(form.get('password')),
        });
        if (loginError) throw loginError;
      } else if (auth) {
        await signInWithEmailAndPassword(auth, email, String(form.get('password')));
      } else {
        throw new Error('관리자 인증이 연결되지 않았습니다.');
      }
      router.push('/admin');
    } catch {
      setError('이메일 또는 비밀번호를 확인해 주세요.');
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    setError('');
    setNotice('');

    if (!supabase || !email) {
      setError('관리자 이메일을 먼저 입력해 주세요.');
      return;
    }

    setLoading(true);
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (magicLinkError) {
      setError('로그인 링크를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } else {
      setNotice('이메일로 보낸 로그인 링크를 열면 관리자 화면으로 연결됩니다.');
    }
    setLoading(false);
  }

  function enterDemo() {
    sessionStorage.setItem('miracle-admin-demo', 'true');
    router.push('/admin');
  }

  const isAuthConfigured = isSupabaseConfigured || isFirebaseConfigured;

  return (
    <section className="login-page">
      <div className="login-visual">
        <span className="eyebrow eyebrow-light">ADMIN CONSOLE</span>
        <h1>연구소의 모든 흐름을<br />한곳에서 조율합니다.</h1>
        <p>문의, 콘텐츠, 일정 데이터를 확인하고<br />공개 상태를 바로 관리하세요.</p>
        <div className="login-pattern"><i /><i /><i /></div>
      </div>
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={login}>
          <span className="brand-mark">M</span>
          <h2>관리자 로그인</h2>
          <p>{isAuthConfigured ? '관리자 권한이 부여된 계정으로 로그인하세요.' : '현재 저장소 연결 전 개발 모드입니다.'}</p>
          {schemaReady === false && (
            <div className="form-error">Supabase 주소는 연결됐지만 CMS 테이블이 아직 생성되지 않았습니다. 지금은 로컬 예시 모드로 기능을 확인할 수 있습니다.</div>
          )}
          <label>
            이메일
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            비밀번호
            <input type="password" name="password" placeholder="비밀번호" autoComplete="current-password" required />
          </label>
          {error && <div className="form-error">{error}</div>}
          {notice && <div className="form-notice">{notice}</div>}
          <button className="btn btn-primary" disabled={loading || !isAuthConfigured}>
            {loading ? '처리 중…' : '비밀번호로 로그인'}
          </button>
          {supabase && (
            <button className="btn btn-secondary" type="button" onClick={sendMagicLink} disabled={loading}>
              이메일 로그인 링크 받기
            </button>
          )}
          {process.env.NODE_ENV === 'development' && (
            <button className="btn btn-secondary" type="button" onClick={enterDemo}>로컬 예시 모드 열기</button>
          )}
          <small>운영 환경에서는 관리자 권한이 있는 계정만 글을 발행할 수 있습니다.</small>
        </form>
      </div>
    </section>
  );
}
