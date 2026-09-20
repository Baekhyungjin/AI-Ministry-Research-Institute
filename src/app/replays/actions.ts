'use server';

import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { sendAdminNotification } from '@/lib/notification-email';
import { consumeSubmissionRateLimit } from '@/lib/submission-rate-limit';

const MINIMUM_SUPPORT_AMOUNT = 10_000;

export interface ReplaySupportInput {
  replayId: string;
  name: string;
  church: string;
  phone: string;
  email: string;
  depositorName: string;
  supportAmount: number;
  consent: boolean;
  website?: string;
}

export type ReplaySupportResult =
  | { ok: true; accessId: string; account: string; replayTitle: string; depositorName: string; supportAmount: number }
  | { ok: false; message: string };

export type ReplayViewingResult =
  | { ok: true; replayTitle: string; videoUrl: string }
  | { ok: false; message: string };

const clean = (value: string, maxLength = 160) => value.trim().slice(0, maxLength);

export async function submitReplaySupport(input: ReplaySupportInput): Promise<ReplaySupportResult> {
  if (input.website) return { ok: false, message: '신청 내용을 다시 확인해 주세요.' };

  const replayId = clean(input.replayId, 120);
  const name = clean(input.name, 80);
  const church = clean(input.church, 120);
  const phone = clean(input.phone, 40);
  const email = clean(input.email, 160).toLowerCase();
  const depositorName = clean(input.depositorName, 80);
  const supportAmount = Math.trunc(Number(input.supportAmount));

  if (!replayId || !name || !church || !phone || !email || !depositorName || !input.consent) {
    return { ok: false, message: '필수 항목과 개인정보 동의를 확인해 주세요.' };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: '이메일 주소를 확인해 주세요.' };
  if (!Number.isSafeInteger(supportAmount) || supportAmount < MINIMUM_SUPPORT_AMOUNT) {
    return { ok: false, message: '후원 금액은 10,000원 이상 입력해 주세요.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const account = process.env.REPLAY_SUPPORT_ACCOUNT?.trim();
  if (!supabaseUrl || !supabaseKey || !account) {
    return { ok: false, message: '후원 신청 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  if (!await consumeSubmissionRateLimit(supabase, await headers(), 'replay')) {
    return { ok: false, message: '신청이 너무 자주 접수되었습니다. 10분 뒤 다시 시도해 주세요.' };
  }
  const { data: replay, error: replayError } = await supabase
    .from('replays')
    .select('id,title')
    .eq('id', replayId)
    .eq('status', 'published')
    .maybeSingle();

  if (replayError || !replay) return { ok: false, message: '공개 중인 다시보기를 찾을 수 없습니다.' };

  const submissionId = `replay-access-${randomUUID()}`;
  const { error } = await supabase.from('replay_accesses').insert({
    id: submissionId,
    replay_id: replay.id,
    replay_title: replay.title,
    name,
    church,
    phone,
    email,
    depositor_name: depositorName,
    support_amount: supportAmount,
    payment_status: 'pending',
    consent: true,
    created_at: new Date().toISOString(),
  });

  if (error) return { ok: false, message: '신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' };
  await sendAdminNotification({
    subject: `[목회AI연구소] 세미나 다시보기 후원 신청 - ${name}`,
    replyTo: email,
    fields: [
      { label: '세미나', value: replay.title }, { label: '성함', value: name }, { label: '교회·기관', value: church },
      { label: '연락처', value: phone }, { label: '이메일', value: email }, { label: '입금자명', value: depositorName },
      { label: '후원 금액', value: `${supportAmount.toLocaleString('ko-KR')}원` },
    ],
    idempotencyKey: submissionId,
  });
  return { ok: true, accessId: submissionId, account, replayTitle: replay.title, depositorName, supportAmount };
}

export async function confirmReplaySupport(accessIdValue: string): Promise<ReplayViewingResult> {
  const accessId = clean(accessIdValue, 160);
  if (!accessId.startsWith('replay-access-')) return { ok: false, message: '다시보기 신청 정보를 확인해 주세요.' };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return { ok: false, message: '다시보기 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.' };

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.rpc('confirm_replay_access', { p_access_id: accessId });
  const replay = Array.isArray(data) ? data[0] : null;
  if (error || !replay?.video_url) return { ok: false, message: '영상 정보를 불러오지 못했습니다. 신청 내용을 다시 확인해 주세요.' };
  return { ok: true, replayTitle: replay.replay_title, videoUrl: replay.video_url };
}
