import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { extractYouTubeVideoId } from '@/lib/youtube';

const CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000';

function fallbackThumbnail() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#101d38"/><stop offset="1" stop-color="#315ea8"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><text x="64" y="82" fill="#fff" font-family="Arial,sans-serif" font-size="26" font-weight="700" letter-spacing="5">SEMINAR REPLAY</text><circle cx="640" cy="360" r="76" fill="#fff" opacity=".18"/><path d="M620 315l70 45-70 45z" fill="#fff"/></svg>`;
  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': CACHE_CONTROL } });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id || id.length > 140) return fallbackThumbnail();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return fallbackThumbnail();

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data } = await supabase
    .from('replays')
    .select('video_url')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();
  const videoId = extractYouTubeVideoId(data?.video_url ?? '');
  if (!videoId) return fallbackThumbnail();

  for (const quality of ['maxresdefault', 'hqdefault']) {
    try {
      const response = await fetch(`https://i.ytimg.com/vi/${videoId}/${quality}.jpg`, {
        next: { revalidate: 604800 },
      });
      if (!response.ok) continue;
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) continue;
      return new NextResponse(await response.arrayBuffer(), {
        headers: { 'Content-Type': contentType, 'Cache-Control': CACHE_CONTROL },
      });
    } catch {
      // Try the lower-resolution YouTube thumbnail before using the local fallback.
    }
  }

  return fallbackThumbnail();
}
