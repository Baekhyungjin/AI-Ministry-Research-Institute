import ContentDetail from '@/components/ContentDetail';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedContent } from '@/lib/public-data';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getPublishedContent(id, 'notice');
  if (!item) return { title: '공지를 찾을 수 없습니다' };
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/notices/${item.id}` },
    openGraph: { title: item.title, description: item.excerpt, images: item.imageUrl ? [item.imageUrl] : ['/opengraph-image.png'] },
  };
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await getPublishedContent(id, 'notice');
  if (!item) notFound();
  return <ContentDetail item={item} />;
}
