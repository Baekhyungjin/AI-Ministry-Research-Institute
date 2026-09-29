import ContentDetail from '@/components/ContentDetail';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedContent } from '@/lib/public-data';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getPublishedContent(id, 'prompt');
  if (!item) return { title: '프롬프트 자료를 찾을 수 없습니다' };
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/prompts/${item.id}` },
    openGraph: { title: item.title, description: item.excerpt, images: item.imageUrl ? [item.imageUrl] : ['/images/brand/ministry-ai-social-preview-v1.png'] },
  };
}

export default async function PromptDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await getPublishedContent(id, 'prompt');
  if (!item) notFound();
  return <ContentDetail item={item} />;
}
