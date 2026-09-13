import Image from 'next/image';
import { ContentBlock } from '@/lib/types';

function safeHref(value: string) {
  if (value.startsWith('/')) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return <div className="article-blocks">{blocks.map((block) => {
    if (block.type === 'paragraph') return <p key={block.id}>{block.text}</p>;
    if (block.type === 'heading') return block.level === 3 ? <h3 key={block.id}>{block.text}</h3> : <h2 key={block.id}>{block.text}</h2>;
    if (block.type === 'quote') return <blockquote key={block.id}><p>{block.text}</p>{block.caption && <cite>{block.caption}</cite>}</blockquote>;
    if (block.type === 'list') {
      const items = block.items.filter((item) => item.trim());
      return block.ordered
        ? <ol key={block.id}>{items.map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}</ol>
        : <ul key={block.id}>{items.map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}</ul>;
    }
    if (block.type === 'image' && block.imageUrl) return <figure className="article-inline-image" key={block.id}><Image src={block.imageUrl} alt={block.alt} width={1200} height={800} sizes="(max-width: 900px) 100vw, 820px" unoptimized={block.imageUrl.startsWith('data:')} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
    if (block.type === 'link') {
      const href = safeHref(block.url);
      return href ? <a className="article-link-card" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} key={block.id}><span>관련 링크</span><strong>{block.label}</strong>{block.description && <p>{block.description}</p>}<b>바로가기 →</b></a> : null;
    }
    if (block.type === 'divider') return <hr key={block.id} />;
    return null;
  })}</div>;
}
