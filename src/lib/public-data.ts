import 'server-only';

import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { ContentBlock, ContentItem, ContentKind } from '@/lib/types';

function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

type ContentRow = {
  id: string; kind: ContentKind; title: string; excerpt: string; body: string;
  content_blocks: ContentBlock[] | null; category: string; status: 'published'; featured: boolean;
  image_url: string | null; published_at: string; created_at: string;
  notice_placement?: ContentItem['noticePlacement']; starts_at?: string; ends_at?: string;
  cta_label?: string; cta_url?: string; priority?: number;
};

function mapContent(row: ContentRow): ContentItem {
  return {
    id: row.id, kind: row.kind, title: row.title, excerpt: row.excerpt, body: row.body,
    contentBlocks: row.content_blocks ?? [], category: row.category, status: row.status,
    featured: row.featured, imageUrl: row.image_url, publishedAt: row.published_at,
    createdAt: row.created_at, noticePlacement: row.notice_placement, startsAt: row.starts_at,
    endsAt: row.ends_at, ctaLabel: row.cta_label, ctaUrl: row.cta_url, priority: row.priority,
  };
}

export const getPublishedContent = cache(async (id: string, kind: ContentKind) => {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('contents').select('*')
    .eq('id', id).eq('kind', kind).eq('status', 'published').maybeSingle();
  if (error || !data) return null;
  return mapContent(data as ContentRow);
});

export async function getPublishedContentRoutes() {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('contents')
    .select('id,kind,published_at').eq('status', 'published');
  if (error) return [];
  return (data ?? []) as Array<{ id: string; kind: ContentKind; published_at: string }>;
}
