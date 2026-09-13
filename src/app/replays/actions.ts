'use server';

import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

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
  | { ok: true; account: string; replayTitle: string; depositorName: string; supportAmount: number }
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
  const { data: replay, error: replayError } = await supabase
    .from('replays')
    .select('id,title')
    .eq('id', replayId)
    .eq('status', 'published')
    .maybeSingle();

  if (replayError || !replay) return { ok: false, message: '공개 중인 다시보기를 찾을 수 없습니다.' };

  const { error } = await supabase.from('replay_accesses').insert({
    id: `replay-access-${randomUUID()}`,
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
  return { ok: true, account, replayTitle: replay.title, depositorName, supportAmount };
}
