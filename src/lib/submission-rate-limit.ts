import 'server-only';

import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

type SubmissionScope = 'application' | 'partner' | 'replay' | 'comment';
type HeaderReader = Pick<Headers, 'get'>;

export async function consumeSubmissionRateLimit(
  supabase: SupabaseClient,
  headers: HeaderReader,
  scope: SubmissionScope,
) {
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = forwardedFor || headers.get('x-real-ip') || 'unknown';
  const userAgent = headers.get('user-agent') || 'unknown';
  const keyHash = createHash('sha256').update(`${scope}:${address}:${userAgent}`).digest('hex');
  const { data, error } = await supabase.rpc('consume_submission_rate_limit', {
    p_scope: scope,
    p_key_hash: keyHash,
  });

  if (error) {
    console.error('Submission rate limit check failed', { scope, code: error.code });
    return true;
  }
  return data === true;
}
