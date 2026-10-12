import { currentReport, acceptedTags } from '../../../supabase/functions/_shared/grounding';
import type { DreamEntry } from '@/types/dream';

export type ThemeMode = 'universal' | 'symbolic';
type ThemeDefinition = { id: string; mode: ThemeMode; aliases: readonly string[] };
export const themes: readonly ThemeDefinition[] = [
  { id: 'flying', mode: 'universal', aliases: ['flying', 'flight', 'levitation'] },
  { id: 'falling', mode: 'universal', aliases: ['falling', 'fall', 'abyss'] },
  { id: 'water', mode: 'universal', aliases: ['water', 'ocean', 'sea', 'river'] },
  { id: 'teeth', mode: 'universal', aliases: ['teeth', 'tooth', 'teeth-loss'] },
  { id: 'pursuit', mode: 'universal', aliases: ['pursuit', 'chase', 'chasing', 'being-chased'] },
  { id: 'maze', mode: 'universal', aliases: ['maze', 'labyrinth', 'corridor'] },
  { id: 'shadow', mode: 'symbolic', aliases: ['shadow', 'fear', 'pursuit', 'chase', 'darkness'] },
  { id: 'depths', mode: 'symbolic', aliases: ['water', 'ocean', 'sea', 'depths'] },
  { id: 'threshold', mode: 'symbolic', aliases: ['door', 'doors', 'key', 'threshold'] },
  { id: 'descent', mode: 'symbolic', aliases: ['stairs', 'staircase', 'falling', 'descent'] },
  {
    id: 'transformation',
    mode: 'symbolic',
    aliases: ['transformation', 'mirror', 'metamorphosis'],
  },
  { id: 'transcendence', mode: 'symbolic', aliases: ['flying', 'flight', 'levitation'] },
];
export function matchesTheme(dream: Pick<DreamEntry, 'tags'>, id: string) {
  const definition = themes.find((theme) => theme.id === id);
  return !!definition && dream.tags.some((tag) => definition.aliases.includes(tag));
}
export function eligibleDreams(dreams: readonly DreamEntry[]) {
  const seen = new Set<string>();
  return dreams
    .filter((dream) => {
      if (
        dream.status !== 'ready' ||
        dream.deletion_requested_at ||
        seen.has(dream.id) ||
        !currentReport(dream.content_report, dream.transcript ?? '', dream.transcript_revision)
      )
        return false;
      if (
        !dream.event_confirmed &&
        dreams.some(
          (other) =>
            other.id !== dream.id &&
            other.status === 'ready' &&
            !other.deletion_requested_at &&
            other.dream_date === dream.dream_date &&
            other.transcript?.trim() === dream.transcript?.trim(),
        )
      )
        return false;
      seen.add(dream.id);
      return true;
    })
    .map((dream) => ({
      ...dream,
      tags: acceptedTags(
        currentReport(dream.content_report, dream.transcript ?? '', dream.transcript_revision),
      ),
    }));
}
export function analyzeThemes(dreams: readonly DreamEntry[], mode: ThemeMode) {
  const eligible = eligibleDreams(dreams);
  const axes = themes
    .filter((theme) => theme.mode === mode)
    .map((theme) => {
      const count = eligible.filter((dream) => matchesTheme(dream, theme.id)).length;
      return {
        id: theme.id,
        count,
        percentage: eligible.length ? Math.round((count / eligible.length) * 100) : 0,
      };
    });
  const maximum = Math.max(0, ...axes.map((axis) => axis.count));
  return {
    total: eligible.length,
    axes,
    dominant: axes.filter((axis) => maximum > 0 && axis.count === maximum).map((axis) => axis.id),
  };
}
