import { JournalSummary } from '@/features/journal/JournalSummary';
import { backendEnabled } from '@/services/supabase/client';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDreams } from '@/features/dreams/DreamProvider';
import { Button, c, Empty, Label, Page, Tag, TextButton, ui } from '@/components/ui/kit';
import { DreamRadar } from '@/features/insights/DreamRadar';
import { matchesTheme } from '@/features/insights/themes';
import { DreamVisual } from '@/components/ui/DreamArt';
export function validDate(value: string) {
  return (
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value)
  );
}
export default function GrimoireScreen() {
  const { t } = useTranslation();
  const store = useDreams();
  const wide = useWindowDimensions().width > 780;
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [theme, setTheme] = useState('');
  const [dates, setDates] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const dateError = !validDate(from) || !validDate(to) || !!(from && to && from > to);
  const tags = [...new Set(store.dreams.flatMap((d) => d.tags))];
  const filtered = useMemo(
    () =>
      store.dreams.filter((d) => {
        const q = search.toLocaleLowerCase(store.locale).trim();
        const searchable = [
          d.title,
          d.transcript,
          ...d.tags.map((slug) => t(`tags.${slug}` as 'tags.water', { defaultValue: slug })),
          ...d.tags,
        ]
          .join(' ')
          .toLocaleLowerCase(store.locale);
        return (
          (!q || searchable.includes(q)) &&
          (!tag || d.tags.includes(tag)) &&
          (!theme ||
            (d.status === 'ready' && !d.deletion_requested_at && matchesTheme(d, theme))) &&
          (!from || d.dream_date >= from) &&
          (!to || d.dream_date <= to)
        );
      }),
    [store.dreams, store.locale, search, tag, theme, from, to, t],
  );
  const reset = () => {
    setSearch('');
    setTag('');
    setTheme('');
    setFrom('');
    setTo('');
  };
  return (
    <Page>
      <View style={{ paddingTop: 40, gap: 20 }}>
        <Label>{t('archive.eyebrow')}</Label>
        <View style={ui.spread}>
          <Text accessibilityRole="header" style={ui.title}>
            {t('archive.title')}
          </Text>
          <Label>{String(store.dreams.length).padStart(2, '0')}</Label>
        </View>
        <Text style={ui.subtitle}>{t('archive.subtitle')}</Text>
        <Text style={ui.note}>
          {t(backendEnabled ? 'backend.count' : 'archive.count', { count: store.dreams.length })}
        </Text>
      </View>
      {!store.loading && !store.error && (
        <View style={{ gap: 28 }}>
          <DreamRadar dreams={store.dreams} selected={theme} onSelect={setTheme} />
          <JournalSummary dreams={store.dreams} />
        </View>
      )}
      {theme ? (
        <Text style={ui.note}>
          {t('radar.active', { theme: t(`radar.themes.${theme}` as 'radar.themes.water') })}
        </Text>
      ) : null}
      <View style={{ gap: 12 }}>
        <TextInput
          accessibilityLabel={t('archive.search')}
          placeholder={`⌕  ${t('archive.search')}`}
          placeholderTextColor={c.faint}
          style={ui.input}
          value={search}
          onChangeText={setSearch}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Tag slug={t('archive.all')} selected={!tag} onPress={() => setTag('')} />
          {tags.map((slug) => (
            <Tag
              key={slug}
              slug={slug}
              selected={slug === tag}
              onPress={() => setTag(tag === slug ? '' : slug)}
            />
          ))}
        </View>
        <View style={ui.spread}>
          <TextButton title={t('archive.date')} onPress={() => setDates(!dates)} />
          {(search || tag || theme || from || to) && (
            <TextButton title={t('common.reset')} onPress={reset} />
          )}
        </View>
        {dates && (
          <View style={{ gap: 12, flexDirection: wide ? 'row' : 'column' }}>
            <TextInput
              accessibilityLabel={t('archive.from')}
              placeholder={t('archive.from')}
              placeholderTextColor={c.faint}
              value={from}
              onChangeText={setFrom}
              maxLength={10}
              style={[ui.input, { flex: 1 }]}
            />
            <TextInput
              accessibilityLabel={t('archive.to')}
              placeholder={t('archive.to')}
              placeholderTextColor={c.faint}
              value={to}
              onChangeText={setTo}
              maxLength={10}
              style={[ui.input, { flex: 1 }]}
            />
          </View>
        )}
        {dateError && (
          <Text accessibilityRole="alert" style={ui.note}>
            {t('archive.invalidDate')}
          </Text>
        )}
      </View>
      {store.loading ? (
        <ActivityIndicator color={c.text} />
      ) : store.error ? (
        <Button
          title={t('common.retry')}
          onPress={() => {
            void store.refresh();
          }}
        />
      ) : dateError ? null : !store.dreams.length ? (
        <Empty
          title={t('archive.empty')}
          body={t('archive.emptyBody')}
          href="/"
          action={t('archive.create')}
        />
      ) : !filtered.length ? (
        <Empty title={t('archive.noResults')} body={t('archive.noResultsBody')} />
      ) : (
        <View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: 24 }}>
          {filtered.map((dream, index) => (
            <View key={dream.id} style={{ width: wide ? '31.7%' : '100%' }}>
              <Link href={{ pathname: '/dreams/[id]', params: { id: dream.id } }} asChild>
                <Pressable accessibilityLabel={t('archive.open', { title: dream.title })}>
                  <DreamVisual uri={dream.imageUri} height={wide ? 320 : 300} />
                  <View style={{ paddingTop: 16, gap: 10 }}>
                    <View style={ui.spread}>
                      <Label>{dream.dream_date}</Label>
                      <Text style={ui.eyebrow}>/{String(index + 1).padStart(2, '0')}</Text>
                    </View>
                    <Text style={{ ...ui.title, fontSize: 29, lineHeight: 35 }}>{dream.title}</Text>
                    <Text style={ui.note}>
                      {t(
                        dream.analysis_source === 'live'
                          ? 'ai.sample'
                          : backendEnabled
                            ? 'backend.sample'
                            : 'archive.sample',
                      )}{' '}
                      · {t('common.private')}
                    </Text>
                  </View>
                </Pressable>
              </Link>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 16,
                  marginBottom: 24,
                }}
              >
                {dream.tags.map((slug) => (
                  <Tag key={slug} slug={slug} onPress={() => setTag(slug)} />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Page>
  );
}
