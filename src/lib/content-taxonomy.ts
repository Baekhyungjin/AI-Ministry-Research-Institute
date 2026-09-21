export const columnCategories = [
  {
    label: '설교와 성경 연구',
    aliases: ['설교와 성경 연구', '설교·성경 연구', '설교 연구', '성경 연구'],
  },
  {
    label: '교회 행정과 콘텐츠',
    aliases: ['교회 행정과 콘텐츠', '교회 행정', '교회 콘텐츠', '행정·콘텐츠'],
  },
  {
    label: 'AI 윤리와 목회',
    aliases: ['AI 윤리와 목회', 'AI 윤리', 'AI 목회', '목회 AI'],
  },
] as const;

function normalizeCategory(value: string) {
  return value.toLocaleLowerCase('ko-KR').replace(/[\s·・/&]+/g, '');
}

export function matchesColumnCategory(itemCategory: string, selectedCategory: string) {
  const selected = columnCategories.find((entry) => entry.label === selectedCategory);
  const candidates = selected?.aliases ?? [selectedCategory];
  const normalizedItem = normalizeCategory(itemCategory);
  return candidates.some((candidate) => normalizeCategory(candidate) === normalizedItem);
}

export function isCanonicalColumnCategoryAlias(category: string) {
  const normalized = normalizeCategory(category);
  return columnCategories.some((entry) => entry.aliases.some((alias) => normalizeCategory(alias) === normalized));
}

export function columnCategoryHref(category: string) {
  return `/columns?category=${encodeURIComponent(category)}`;
}
