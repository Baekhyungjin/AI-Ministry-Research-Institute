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
