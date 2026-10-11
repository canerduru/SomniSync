/**
 * Tag Normalization Utilities
 * Handles Turkish characters, diacritics, slugification, and tag deduplication.
 */

export interface NormalizedTagResult {
  slug: string;
  labelTr: string;
  labelEn: string;
}

export function slugifyTag(text: string): string {
  if (!text) return '';

  const charMap: Record<string, string> = {
    ç: 'c',
    Ç: 'c',
    ğ: 'g',
    Ğ: 'g',
    ı: 'i',
    İ: 'i',
    ö: 'o',
    Ö: 'o',
    ş: 's',
    Ş: 's',
    ü: 'u',
    Ü: 'u',
  };

  const replaced = text
    .split('')
    .map((c) => charMap[c] || c)
    .join('');

  return replaced
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special symbols
    .replace(/\s+/g, '-')        // replace spaces with hyphens
    .replace(/-+/g, '-');        // dedupe hyphens
}

export function normalizeRawTag(raw: string, language: 'tr' | 'en' = 'tr'): NormalizedTagResult {
  const clean = raw.trim().replace(/^#/, '');
  const slug = slugifyTag(clean);

  // Capitalize title
  const formatted = clean
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return {
    slug,
    labelTr: formatted,
    labelEn: formatted,
  };
}

/**
 * Calculates Jaccard similarity score between two tag sets
 * J(A, B) = |A ∩ B| / |A ∪ B|
 */
export function calculateJaccardSimilarity(tagsA: string[], tagsB: string[]): number {
  if (tagsA.length === 0 || tagsB.length === 0) return 0;

  const setA = new Set(tagsA.map((t) => t.toLowerCase()));
  const setB = new Set(tagsB.map((t) => t.toLowerCase()));

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}
