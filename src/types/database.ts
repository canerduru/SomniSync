/**
 * Database Models & Row Definitions (mirrors Supabase PostgreSQL schema)
 */

export interface DbProfile {
  id: string;
  anonymous_tag: string;
  preferred_language: 'tr' | 'en';
  allow_synastry: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbDream {
  id: string;
  user_id: string;
  raw_transcript: string;
  audio_url: string | null;
  image_url: string | null;
  image_prompt: string | null;
  interpretations: DbDreamInterpretations;
  is_private: boolean;
  allow_anonymous_synastry: boolean;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface DbDreamInterpretations {
  neuroscience: string;
  jungian: string;
  astrological: string;
  scientificBasis?: unknown;
}

export interface DbTag {
  id: string;
  slug: string;
  label_tr: string;
  label_en: string;
  usage_count: number;
  created_at: string;
}

export interface DbDreamTag {
  dream_id: string;
  tag_id: string;
  created_at: string;
}

export interface DbSynastryConnection {
  id: string;
  user_a: string;
  user_b: string;
  dream_a_id: string;
  dream_b_id: string;
  resonance_score: number; // 0.0 - 1.0
  shared_tags: string[];
  status: 'pending' | 'acknowledged' | 'dismissed';
  created_at: string;
}

export interface DbCollectiveStat {
  tag_name: string;
  percentage: number;
  dream_count: number;
}
