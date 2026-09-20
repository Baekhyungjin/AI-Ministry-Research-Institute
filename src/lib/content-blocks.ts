import { ContentBlock } from './types';

export function createContentBlock(type: ContentBlock['type']): ContentBlock {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  if (type === 'heading') return { id, type, text: '', level: 2 };
  if (type === 'quote') return { id, type, text: '', caption: '' };
  if (type === 'list') return { id, type, items: [''], ordered: false };
  if (type === 'image') return { id, type, imageUrl: null, alt: '', caption: '' };
  if (type === 'link') return { id, type, label: '', url: '', description: '' };
  if (type === 'divider') return { id, type };
  return { id, type: 'paragraph', text: '' };
}

export function legacyBodyToBlocks(body: string): ContentBlock[] {
  const paragraphs = body.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean);
  return paragraphs.length
    ? paragraphs.map((text) => ({ ...createContentBlock('paragraph'), text } as ContentBlock))
    : [createContentBlock('paragraph')];
}

export function markdownToBlocks(markdown: string): ContentBlock[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ContentBlock[] = [];
  let paragraphLines: string[] = [];

  const pushParagraph = () => {
    const text = paragraphLines.map((line) => line.trim()).filter(Boolean).join(' ').trim();
    paragraphLines = [];
    if (!text) return;
    const block = createContentBlock('paragraph');
    if (block.type === 'paragraph') blocks.push({ ...block, text });
  };

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      pushParagraph();
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      pushParagraph();
      const block = createContentBlock('heading');
      if (block.type === 'heading') blocks.push({ ...block, text: heading[2].trim(), level: heading[1].length <= 2 ? 2 : 3 });
      index += 1;
      continue;
    }

    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      pushParagraph();
      blocks.push(createContentBlock('divider'));
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      pushParagraph();
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      const block = createContentBlock('quote');
      if (block.type === 'quote') blocks.push({ ...block, text: quoteLines.join('\n').trim() });
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    if (unordered) {
      pushParagraph();
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^[-*+]\s+(.+)$/);
        if (!match) break;
        items.push(match[1].trim());
        index += 1;
      }
      const block = createContentBlock('list');
      if (block.type === 'list') blocks.push({ ...block, items, ordered: false });
      continue;
    }

    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      pushParagraph();
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^\d+[.)]\s+(.+)$/);
        if (!match) break;
        items.push(match[1].trim());
        index += 1;
      }
      const block = createContentBlock('list');
      if (block.type === 'list') blocks.push({ ...block, items, ordered: true });
      continue;
    }

    const standaloneLink = trimmed.match(/^\[([^\]]+)]\(((?:https?:\/\/|\/)[^)\s]+)\)$/);
    if (standaloneLink) {
      pushParagraph();
      const block = createContentBlock('link');
      if (block.type === 'link') blocks.push({ ...block, label: standaloneLink[1].trim(), url: standaloneLink[2] });
      index += 1;
      continue;
    }

    paragraphLines.push(line);
    index += 1;
  }

  pushParagraph();
  return blocks.length ? blocks : [createContentBlock('paragraph')];
}

export function blocksToPlainText(blocks: ContentBlock[]) {
  return blocks.map((block) => {
    if (block.type === 'divider') return '';
    if (block.type === 'list') return block.items.filter(Boolean).join('\n');
    if (block.type === 'image') return block.caption || block.alt;
    if (block.type === 'link') return [block.label, block.description].filter(Boolean).join(' - ');
    return block.text;
  }).filter(Boolean).join('\n\n');
}

export function contentBlockImageUrls(blocks?: ContentBlock[]) {
  return (blocks ?? [])
    .filter((block): block is Extract<ContentBlock, { type: 'image' }> => block.type === 'image')
    .map((block) => block.imageUrl)
    .filter((url): url is string => Boolean(url));
}

export function hasMeaningfulContent(blocks: ContentBlock[]) {
  return blocks.some((block) => {
    if (block.type === 'divider') return false;
    if (block.type === 'list') return block.items.some((item) => item.trim());
    if (block.type === 'image') return Boolean(block.imageUrl);
    if (block.type === 'link') return Boolean(block.label.trim() && block.url.trim());
    return Boolean(block.text.trim());
  });
}
