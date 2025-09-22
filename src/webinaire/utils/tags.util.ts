// tags.util.ts
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^a-z0-9]+/g, '-') // non alnum -> -
    .replace(/(^-|-$)+/g, ''); // trim -

export const normalizeTags = (tags: string[]) =>
  Array.from(new Set(tags.map(t => t.trim()).filter(Boolean)));
