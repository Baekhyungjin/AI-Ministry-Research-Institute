'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { classifyAnalyticsPath, trackAnalyticsEvent } from '@/lib/analytics-client';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const lastKey = `ministry-ai-view:${pathname}`;
    const lastTracked = Number(sessionStorage.getItem(lastKey) || 0);
    if (Date.now() - lastTracked < 10_000) return;
    sessionStorage.setItem(lastKey, String(Date.now()));
    const classification = classifyAnalyticsPath(pathname);
    void trackAnalyticsEvent({ eventType: 'page_view', path: pathname, ...classification });
  }, [pathname]);

  return null;
}
