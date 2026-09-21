import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const eventTypes = new Set(['page_view', 'share']);
const contentTypes = new Set(['site', 'column', 'notice', 'replay', 'gpt', 'app', 'schedule']);
const shareChannels = new Set(['native', 'copy', 'naver', 'facebook', 'x']);
const deviceTypes = new Set(['desktop', 'tablet', 'mobile', 'unknown']);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function nullableText(value: unknown, max: number) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ ok: false }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const visitorId = nullableText(body.visitorId, 36);
  const sessionId = nullableText(body.sessionId, 36);
  const eventType = nullableText(body.eventType, 20);
  const contentType = nullableText(body.contentType, 20);
  const path = nullableText(body.path, 500);
  const shareChannel = nullableText(body.shareChannel, 20);
  const deviceType = nullableText(body.deviceType, 20) || 'unknown';

  if (
    !visitorId || !uuidPattern.test(visitorId)
    || !sessionId || !uuidPattern.test(sessionId)
    || !eventType || !eventTypes.has(eventType)
    || !contentType || !contentTypes.has(contentType)
    || !path || !path.startsWith('/')
    || path.startsWith('/admin') || path.startsWith('/login') || path.startsWith('/api')
    || !deviceTypes.has(deviceType)
    || (eventType === 'share' ? !shareChannel || !shareChannels.has(shareChannel) : Boolean(shareChannel))
  ) {
    return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.from('analytics_events').insert({
    visitor_id: visitorId,
    session_id: sessionId,
    event_type: eventType,
    content_type: contentType,
    content_id: nullableText(body.contentId, 160),
    path,
    referrer_host: nullableText(body.referrerHost, 255),
    share_channel: shareChannel,
    device_type: deviceType,
    utm_source: nullableText(body.utmSource, 120),
    utm_medium: nullableText(body.utmMedium, 120),
    utm_campaign: nullableText(body.utmCampaign, 120),
  });

  if (error?.code === '23505') return NextResponse.json({ ok: true, deduplicated: true });
  if (error) {
    console.error('Analytics insert failed:', error.code);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
