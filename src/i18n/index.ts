import { tr } from './tr';
import { en } from './en';

export type Language = 'tr' | 'en';
export type Dictionary = typeof tr;

export const dictionaries: Record<Language, Dictionary> = {
  tr,
  en,
};

export const defaultLanguage: Language = 'tr';
