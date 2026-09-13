import type { MetadataRoute } from 'next';
import { getPublishedContentRoutes } from '@/lib/public-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ministry-ai-lab-rho.vercel.app';

const publicRoutes = [
  { path: '/', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/columns', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/insights', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/prompts', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/archive', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/schedule', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/replays', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/projects', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/gpts', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/apps', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/partners', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/notices', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/apply', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/card', priority: 0.6, changeFrequency: 'yearly' as const },
  { path: '/site-map', priority: 0.4, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getPublishedContentRoutes();
  return [...publicRoutes.map((route) => ({
    url: new URL(route.path, SITE_URL).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  })), ...routes.map((item) => ({
    url: new URL(`/${item.kind === 'column' ? 'columns' : 'notices'}/${item.id}`, SITE_URL).toString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    lastModified: item.published_at ? new Date(item.published_at) : undefined,
  }))];
}
