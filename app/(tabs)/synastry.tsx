import { backendEnabled } from '@/services/supabase/client';
import { ActivityIndicator, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDreams } from '@/features/dreams/DreamProvider';
import { Button, c, Empty, Label, Page, Permission, Rule, Tag, ui } from '@/components/ui/kit';
import { useSynastry } from '@/features/synastry/useSynastry';
import { Orbit } from '@/components/ui/DreamArt';
export default function SynastryScreen() {
  const { t } = useTranslation();
  const store = useDreams();
  const wide = useWindowDimensions().width > 780;
  const social = useSynastry();
  const eligible = store.dreams.filter((d) => d.matching_opt_in);
  return (
    <Page>
      <View style={{ paddingTop: 40, gap: 20 }}>
        <Label>{t('synastry.eyebrow')}</Label>
        <Text accessibilityRole="header" style={ui.title}>
          {t('synastry.title')}
        </Text>
        <Text style={ui.subtitle}>{t('synastry.subtitle')}</Text>
      </View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 32 }}>
        <View style={{ ...ui.card, flex: 1, alignItems: 'center', paddingVertical: 32 }}>
          <Label>{t('synastry.collective')}</Label>
          <Orbit size={210} />
          {social.loading ? (
            <ActivityIndicator color={c.text} />
          ) : social.overview?.stats.status === 'ready' ? (
            <View style={{ gap: 16, width: '100%' }}>
              <Text style={ui.note}>{social.overview.stats.periodLabel}</Text>
              <Text style={ui.note}>
                {t('synastry.participants', { count: social.overview.stats.cohortSize })}
              </Text>
              {social.overview.stats.themes.map((item) => (
                <View key={item.slug} style={ui.spread}>
                  <Tag slug={item.slug} />
                  <Text style={ui.title}>
                    {new Intl.NumberFormat(store.locale, {
                      style: 'percent',
                      maximumFractionDigits: 0,
                    }).format(item.percentage / 100)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              <Text style={{ ...ui.title, fontSize: 32, lineHeight: 39, textAlign: 'center' }}>
                {t('synastry.noStats')}
              </Text>
              <Text style={{ ...ui.note, textAlign: 'center', maxWidth: 360 }}>
                {t(backendEnabled ? 'backend.noStatsBody' : 'synastry.noStatsBody')}
              </Text>
            </>
          )}
          <Rule />
          <Text style={{ ...ui.note, textAlign: 'center' }}>{t('synastry.threshold')}</Text>
        </View>
        <View style={{ flex: 1, gap: 24, paddingTop: 8 }}>
          <Label>{t('synastry.consent')}</Label>
          {store.consentError && (
            <Text accessibilityRole="alert" style={ui.note}>
              {t('auth.sync')}
            </Text>
          )}
          <Permission
            title={t('synastry.aggregate')}
            description={t('synastry.aggregateBody')}
            value={store.aggregateConsent}
            onChange={store.setAggregateConsent}
          />
          <Rule />
          <Permission
            title={t('synastry.matching')}
            description={t('synastry.matchingBody')}
            value={store.matchingConsent}
            onChange={store.setMatchingConsent}
          />
          <Text style={ui.note}>
            {t(backendEnabled ? 'backend.consent' : 'synastry.localConsent')}
          </Text>
          <Rule />
          <Label>{t('synastry.matches')}</Label>
          {social.error && <Button secondary title={t('common.retry')} onPress={social.refresh} />}

          {!store.matchingConsent ? (
            <Empty title={t('synastry.off')} body={t('synastry.offBody')} />
          ) : !eligible.length ? (
            <Empty
              title={t('synastry.chooseDream')}
              body={t('synastry.chooseDreamBody')}
              href="/grimoire"
              action={t('home.all')}
            />
          ) : social.loading ? (
            <ActivityIndicator color={c.text} />
          ) : !social.overview?.matches.length ? (
            <Empty title={t('synastry.noMatches')} body={t('synastry.noMatchesBody')} />
          ) : (
            social.overview.matches.map((match) => (
              <View key={match.id} style={{ ...ui.card, gap: 20 }}>
                {match.isDemo && <Label>{t('synastry.examples')}</Label>}
                <Text style={{ ...ui.title, fontSize: 36, lineHeight: 43 }}>{match.alias}</Text>
                <Text style={ui.subtitle}>{t('synastry.matchBody')}</Text>
                <Label>{t('synastry.shared')}</Label>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {match.sharedTags.map((slug) => (
                    <Tag key={slug} slug={slug} />
                  ))}
                </View>
                {match.isDemo && <Text style={ui.note}>{t('synastry.exampleNote')}</Text>}
              </View>
            ))
          )}
        </View>
      </View>
      <Rule />
      <Text style={ui.note}>{t(backendEnabled ? 'backend.consent' : 'synastry.withdraw')}</Text>
    </Page>
  );
}
