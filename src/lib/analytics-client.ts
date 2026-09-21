'use client';

export type AnalyticsContentType = 'site' | 'column' | 'notice' | 'replay' | 'gpt' | 'app' | 'schedule';
export type AnalyticsEventType = 'page_view' | 'share';
export type ShareChannel = 'native' | 'copy' | 'naver' | 'facebook' | 'x';

type AnalyticsPayload = {
  eventType: AnalyticsEventType;
  contentType: AnalyticsContentType;
  contentId?: string | null;
  path?: string;
  shareChannel?: ShareChannel | null;
};

const visitorKey = 'ministry-ai-visitor-id';
const sessionKey = 'ministry-ai-session-id';

function getOrCreateId(storage: Storage, key: string) {
  const saved = storage.getItem(key);
  if (saved) return saved;
  const id = crypto.randomUUID();
  storage.setItem(key, id);
  return id;
}

function getReferrerHost() {
  if (!document.referrer) return null;
  try {
    const referrer = new URL(document.referrer);
    return referrer.hostname === window.location.hostname ? null : referrer.hostname;
  } catch {
    return null;
  }
}

function getDeviceType() {
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1180) return 'tablet';
  return 'desktop';
}

export function classifyAnalyticsPath(pathname: string): {
  contentType: AnalyticsContentType;
  contentId: string | null;
} {
  const patterns: Array<[RegExp, AnalyticsContentType]> = [
    [/^\/columns\/([^/]+)\/?$/, 'column'],
    [/^\/notices\/([^/]+)\/?$/, 'notice'],
    [/^\/replays\/([^/]+)\/?$/, 'replay'],
    [/^\/gpts\/([^/]+)\/?$/, 'gpt'],
    [/^\/apps\/([^/]+)\/?$/, 'app'],
    [/^\/schedule\/([^/]+)\/?$/, 'schedule'],
  ];

  for (const [pattern, contentType] of patterns) {
    const match = pathname.match(pattern);
    if (match?.[1]) return { contentType, contentId: decodeURIComponent(match[1]) };
  }
  return { contentType: 'site', contentId: null };
}

export async function trackAnalyticsEvent(payload: AnalyticsPayload) {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1') return;
  const path = payload.path || window.location.pathname;
  if (path.startsWith('/admin') || path.startsWith('/login') || path.startsWith('/api')) return;

  const params = new URLSearchParams(window.location.search);
  const body = {
    visitorId: getOrCreateId(localStorage, visitorKey),
    sessionId: getOrCreateId(sessionStorage, sessionKey),
    eventType: payload.eventType,
    contentType: payload.contentType,
    contentId: payload.contentId || null,
    path,
    referrerHost: getReferrerHost(),
    shareChannel: payload.shareChannel || null,
    deviceType: getDeviceType(),
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
  };

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt reading or sharing content.
  }
}
