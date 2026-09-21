import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { consumeSubmissionRateLimit } from '@/lib/submission-rate-limit';

export const runtime = 'nodejs';

type CommentAction = 'create' | 'update' | 'delete';
type CommentPayload = {
  action?: CommentAction;
  contentType?: string;
  contentId?: string;
  commentId?: string;
  authorName?: string;
  body?: string;
  password?: string;
  website?: string;
};

const contentTypes = new Set(['column', 'notice']);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key
    ? createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;
}

export async function GET(request: Request) {
  const client = getClient();
  if (!client) return NextResponse.json({ ok: false, message: '댓글 시스템 연결을 확인하고 있습니다.' }, { status: 503 });

  const url = new URL(request.url);
  const contentType = clean(url.searchParams.get('contentType'), 20);
  const contentId = clean(url.searchParams.get('contentId'), 180);
  if (!contentTypes.has(contentType) || !contentId) {
    return NextResponse.json({ ok: false, message: '게시물 정보를 확인해 주세요.' }, { status: 400 });
  }

  const { data, error } = await client
    .from('comments')
    .select('id,content_type,content_id,author_name,body,status,created_at,updated_at')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Comment list failed', error.code);
    return NextResponse.json({ ok: false, message: '댓글을 불러오지 못했습니다.' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, comments: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const client = getClient();
  if (!client) return NextResponse.json({ ok: false, message: '댓글 시스템 연결을 확인하고 있습니다.' }, { status: 503 });

  let payload: CommentPayload;
  try {
    payload = await request.json() as CommentPayload;
  } catch {
    return NextResponse.json({ ok: false, message: '댓글 형식을 확인해 주세요.' }, { status: 400 });
  }

  if (clean(payload.website, 120)) {
    return NextResponse.json({ ok: false, message: '댓글 내용을 다시 확인해 주세요.' }, { status: 400 });
  }
  if (!await consumeSubmissionRateLimit(client, request.headers, 'comment')) {
    return NextResponse.json({ ok: false, message: '요청이 너무 많습니다. 10분 뒤 다시 시도해 주세요.' }, { status: 429 });
  }

  const action = payload.action;
  const password = clean(payload.password, 32);
  if (!action || password.length < 4) {
    return NextResponse.json({ ok: false, message: '댓글 비밀번호는 4자 이상 입력해 주세요.' }, { status: 400 });
  }

  if (action === 'create') {
    const contentType = clean(payload.contentType, 20);
    const contentId = clean(payload.contentId, 180);
    const authorName = clean(payload.authorName, 30);
    const body = clean(payload.body, 2000);
    if (!contentTypes.has(contentType) || !contentId || authorName.length < 2 || body.length < 2) {
      return NextResponse.json({ ok: false, message: '이름과 댓글 내용을 확인해 주세요.' }, { status: 400 });
    }
    const { data, error } = await client.rpc('create_public_comment', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_author_name: authorName,
      p_body: body,
      p_password: password,
    });
    if (error) {
      console.error('Comment create failed', error.code);
      const unavailable = error.message.includes('CONTENT_NOT_AVAILABLE');
      return NextResponse.json({ ok: false, message: unavailable ? '현재 댓글을 작성할 수 없는 게시물입니다.' : '댓글을 저장하지 못했습니다.' }, { status: unavailable ? 409 : 500 });
    }
    return NextResponse.json({ ok: true, id: data }, { status: 201 });
  }

  const commentId = clean(payload.commentId, 36);
  if (!uuidPattern.test(commentId)) {
    return NextResponse.json({ ok: false, message: '댓글 정보를 확인해 주세요.' }, { status: 400 });
  }

  if (action === 'update') {
    const body = clean(payload.body, 2000);
    if (body.length < 2) return NextResponse.json({ ok: false, message: '댓글 내용을 2자 이상 입력해 주세요.' }, { status: 400 });
    const { data, error } = await client.rpc('update_public_comment', {
      p_comment_id: commentId,
      p_body: body,
      p_password: password,
    });
    if (error || data !== true) {
      return NextResponse.json({ ok: false, message: '비밀번호가 맞지 않거나 수정할 수 없는 댓글입니다.' }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    const { data, error } = await client.rpc('delete_public_comment', {
      p_comment_id: commentId,
      p_password: password,
    });
    if (error || data !== true) {
      return NextResponse.json({ ok: false, message: '비밀번호가 맞지 않거나 삭제할 수 없는 댓글입니다.' }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, message: '지원하지 않는 요청입니다.' }, { status: 400 });
}
