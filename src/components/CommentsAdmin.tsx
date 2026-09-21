'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type AdminComment = {
  id: string;
  content_type: 'column' | 'notice';
  content_id: string;
  author_name: string;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
  updated_at: string;
};

type ContentTitle = { id: string; title: string; kind: 'column' | 'notice' };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export default function CommentsAdmin() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [editing, setEditing] = useState<AdminComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const client = supabase;
    if (!client) { setMessage('Supabase 연결 설정을 확인해 주세요.'); setLoading(false); return; }
    const [commentResult, contentResult] = await Promise.all([
      client.from('comments').select('id,content_type,content_id,author_name,body,status,created_at,updated_at').order('created_at', { ascending: false }),
      client.from('contents').select('id,title,kind').in('kind', ['column', 'notice']),
    ]);
    if (commentResult.error) setMessage('댓글을 불러오지 못했습니다. 관리자 권한과 DB 구조를 확인해 주세요.');
    else setComments((commentResult.data ?? []) as AdminComment[]);
    if (!contentResult.error) {
      setTitles(Object.fromEntries(((contentResult.data ?? []) as ContentTitle[]).map((item) => [item.id, item.title])));
    }
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = useMemo(() => filter === 'all' ? comments : comments.filter((item) => item.status === filter), [comments, filter]);

  async function toggleStatus(item: AdminComment) {
    if (!supabase) return;
    const nextStatus = item.status === 'published' ? 'hidden' : 'published';
    const { error } = await supabase.from('comments').update({ status: nextStatus }).eq('id', item.id);
    if (error) setMessage('댓글 공개 상태를 변경하지 못했습니다.');
    else {
      setComments((current) => current.map((row) => row.id === item.id ? { ...row, status: nextStatus } : row));
      setMessage(nextStatus === 'hidden' ? '댓글을 숨겼습니다.' : '댓글을 다시 공개했습니다.');
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !editing) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const authorName = String(form.get('authorName') ?? '').trim().slice(0, 30);
    const body = String(form.get('body') ?? '').trim().slice(0, 2000);
    if (authorName.length < 2 || body.length < 2) {
      setMessage('작성자 이름과 댓글 내용을 확인해 주세요.'); setSaving(false); return;
    }
    const { error } = await supabase.from('comments').update({ author_name: authorName, body }).eq('id', editing.id);
    if (error) setMessage('댓글을 수정하지 못했습니다.');
    else {
      setComments((current) => current.map((row) => row.id === editing.id ? { ...row, author_name: authorName, body, updated_at: new Date().toISOString() } : row));
      setEditing(null);
      setMessage('댓글을 수정했습니다.');
    }
    setSaving(false);
  }

  async function remove(item: AdminComment) {
    if (!supabase || !confirm(`‘${item.author_name}’님의 댓글을 완전히 삭제할까요?`)) return;
    const { error } = await supabase.from('comments').delete().eq('id', item.id);
    if (error) setMessage('댓글을 삭제하지 못했습니다.');
    else {
      setComments((current) => current.filter((row) => row.id !== item.id));
      setMessage('댓글을 삭제했습니다.');
    }
  }

  if (loading) return <div className="admin-loading">댓글을 불러오고 있습니다.</div>;

  return <div className="comments-admin">
    <header className="admin-page-header"><div><span>COMMENT MODERATION</span><h1>댓글 관리</h1><p>칼럼과 공지에 등록된 댓글을 수정·숨김·삭제할 수 있습니다.</p></div></header>
    <div className="comment-admin-summary">
      <article><span>전체 댓글</span><strong>{comments.length}</strong></article>
      <article><span>공개</span><strong>{comments.filter((item) => item.status === 'published').length}</strong></article>
      <article><span>숨김</span><strong>{comments.filter((item) => item.status === 'hidden').length}</strong></article>
    </div>
    <section className="admin-panel">
      <div className="panel-heading comment-admin-toolbar"><div><span>ALL COMMENTS</span><h2>등록된 댓글</h2></div><div className="filter-tabs">{(['all', 'published', 'hidden'] as const).map((value) => <button type="button" className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}>{value === 'all' ? '전체' : value === 'published' ? '공개' : '숨김'}</button>)}</div></div>
      {message && <div className="form-success" role="status">{message}</div>}
      {visible.length ? <div className="comment-admin-list">{visible.map((item) => {
        const path = item.content_type === 'column' ? `/columns/${item.content_id}` : `/notices/${item.content_id}`;
        return <article className="comment-admin-item" key={item.id}>
          <header><div><span className={`comment-status ${item.status}`}>{item.status === 'published' ? '공개' : '숨김'}</span><strong>{item.author_name}</strong><time>{formatDate(item.created_at)}</time></div><Link href={path} target="_blank">게시물 보기 ↗</Link></header>
          <h3>{titles[item.content_id] || item.content_id}</h3>
          <p>{item.body}</p>
          <footer><button type="button" onClick={() => setEditing(item)}>수정</button><button type="button" onClick={() => void toggleStatus(item)}>{item.status === 'published' ? '숨기기' : '공개하기'}</button><button type="button" className="danger" onClick={() => void remove(item)}>삭제</button></footer>
        </article>;
      })}</div> : <div className="empty-state small">조건에 맞는 댓글이 없습니다.</div>}
    </section>
    {editing && <div className="comment-admin-modal" role="dialog" aria-modal="true" aria-labelledby="comment-edit-title"><form onSubmit={saveEdit}><h2 id="comment-edit-title">댓글 수정</h2><label>작성자 이름<input name="authorName" defaultValue={editing.author_name} minLength={2} maxLength={30} required /></label><label>댓글 내용<textarea name="body" defaultValue={editing.body} minLength={2} maxLength={2000} rows={7} required /></label><div><button type="button" onClick={() => setEditing(null)}>취소</button><button className="btn btn-primary" disabled={saving}>{saving ? '저장 중…' : '변경 저장'}</button></div></form></div>}
  </div>;
}
