'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type CommentItem = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type ManageState = {
  id: string;
  mode: 'edit' | 'delete';
  body: string;
  password: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export default function CommentsSection({ contentType, contentId }: { contentType: 'column' | 'notice'; contentId: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [manage, setManage] = useState<ManageState | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const params = new URLSearchParams({ contentType, contentId });
      const response = await fetch(`/api/comments?${params}`, { cache: 'no-store' });
      const data = await response.json() as { ok?: boolean; comments?: CommentItem[]; message?: string };
      if (!response.ok) throw new Error(data.message || '댓글을 불러오지 못했습니다.');
      setComments(data.comments ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '댓글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [contentId, contentType]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadComments(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadComments]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create', contentType, contentId,
          authorName: formData.get('authorName'), body: formData.get('body'),
          password: formData.get('password'), website: formData.get('website'),
        }),
      });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message || '댓글을 저장하지 못했습니다.');
      form.reset();
      setMessage('댓글이 등록되었습니다.');
      await loadComments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '댓글을 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function submitManage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manage) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: manage.mode === 'edit' ? 'update' : 'delete',
          commentId: manage.id,
          body: manage.body,
          password: manage.password,
        }),
      });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message || '댓글을 변경하지 못했습니다.');
      setMessage(manage.mode === 'edit' ? '댓글을 수정했습니다.' : '댓글을 삭제했습니다.');
      setManage(null);
      await loadComments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '댓글을 변경하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return <section className="comments-section" aria-labelledby="comments-title">
    <header className="comments-heading">
      <div><span>COMMENTS</span><h2 id="comments-title">댓글 <b>{comments.length}</b></h2></div>
      <p>목회 현장의 생각과 질문을 나눠주세요.</p>
    </header>

    <form className="comment-form" onSubmit={submitComment}>
      <div className="comment-form-row">
        <label>작성자 이름<input name="authorName" minLength={2} maxLength={30} required autoComplete="name" placeholder="이름 또는 별칭" /></label>
        <label>댓글 비밀번호<input name="password" type="password" minLength={4} maxLength={32} required autoComplete="new-password" placeholder="수정·삭제용 4자 이상" /></label>
      </div>
      <label className="comment-body-label">댓글<textarea name="body" minLength={2} maxLength={2000} rows={4} required placeholder="서로를 존중하는 댓글을 남겨주세요." /></label>
      <label className="comment-honeypot" aria-hidden="true">웹사이트<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <div className="comment-form-footer"><small>비밀번호는 암호화되어 저장되며 관리자도 확인할 수 없습니다.</small><button className="btn btn-primary" disabled={saving}>{saving ? '처리 중…' : '댓글 등록'}</button></div>
    </form>

    {message && <p className="comment-message" role="status">{message}</p>}
    {loading ? <div className="comments-empty">댓글을 불러오고 있습니다.</div> : comments.length ? <div className="comment-list">{comments.map((comment) => {
      const isManaging = manage?.id === comment.id;
      return <article className="comment-item" key={comment.id}>
        <header><strong>{comment.author_name}</strong><time>{formatDate(comment.created_at)}{comment.updated_at !== comment.created_at ? ' · 수정됨' : ''}</time></header>
        <p>{comment.body}</p>
        {!isManaging && <div className="comment-actions"><button type="button" onClick={() => setManage({ id: comment.id, mode: 'edit', body: comment.body, password: '' })}>수정</button><button type="button" onClick={() => setManage({ id: comment.id, mode: 'delete', body: comment.body, password: '' })}>삭제</button></div>}
        {isManaging && <form className="comment-manage" onSubmit={submitManage}>
          {manage.mode === 'edit' ? <textarea value={manage.body} minLength={2} maxLength={2000} rows={3} onChange={(event) => setManage({ ...manage, body: event.target.value })} required /> : <p>이 댓글을 삭제하시겠습니까?</p>}
          <div><input type="password" value={manage.password} minLength={4} maxLength={32} autoComplete="current-password" onChange={(event) => setManage({ ...manage, password: event.target.value })} placeholder="작성할 때 입력한 비밀번호" required /><button type="submit" disabled={saving}>{manage.mode === 'edit' ? '수정 저장' : '삭제 확인'}</button><button type="button" onClick={() => setManage(null)}>취소</button></div>
        </form>}
      </article>;
    })}</div> : <div className="comments-empty">첫 댓글을 남겨주세요.</div>}
  </section>;
}
