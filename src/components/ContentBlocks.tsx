import Image from 'next/image';
import { Fragment, ReactNode } from 'react';
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

function InlineMarkdown({ text }: { text: string }) {
  const pattern = /(\n|\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|`[^`\n]+`|\[[^\]\n]+\]\((?:https?:\/\/|\/)[^)\s]+\)|\*[^*\n]+\*|_[^_\n]+_)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${match.index}-${token}`;

    if (token === '\n') nodes.push(<br key={key} />);
    else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith('~~') && token.endsWith('~~')) nodes.push(<del key={key}>{token.slice(2, -2)}</del>);
    else if (token.startsWith('`') && token.endsWith('`')) nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    else {
      const link = token.match(/^\[([^\]]+)]\((.+)\)$/);
      const href = link ? safeHref(link[2]) : null;
      nodes.push(link && href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} key={key}>{link[1]}</a> : <Fragment key={key}>{token}</Fragment>);
    }
    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

export default function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return <div className="article-blocks">{blocks.map((block) => {
    if (block.type === 'paragraph') return <p key={block.id}><InlineMarkdown text={block.text} /></p>;
    if (block.type === 'heading') return block.level === 3 ? <h3 key={block.id}><InlineMarkdown text={block.text} /></h3> : <h2 key={block.id}><InlineMarkdown text={block.text} /></h2>;
    if (block.type === 'quote') return <blockquote key={block.id}><p><InlineMarkdown text={block.text} /></p>{block.caption && <cite><InlineMarkdown text={block.caption} /></cite>}</blockquote>;
    if (block.type === 'list') {
      const items = block.items.filter((item) => item.trim());
      return block.ordered
        ? <ol key={block.id}>{items.map((item, index) => <li key={`${block.id}-${index}`}><InlineMarkdown text={item} /></li>)}</ol>
        : <ul key={block.id}>{items.map((item, index) => <li key={`${block.id}-${index}`}><InlineMarkdown text={item} /></li>)}</ul>;
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
