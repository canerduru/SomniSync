import type { Database } from './database';
import type { ContentReport } from '../../supabase/functions/_shared/grounding';
import type { Journal } from '../../supabase/functions/_shared/journal';
export type Dream = Omit<
  Database['public']['Tables']['dreams']['Row'],
  'content_report' | 'journal'
> & { content_report?: ContentReport | null; journal?: Journal | null };
export type DreamEntry = Dream & { tags: string[]; imageUri: string | null };
