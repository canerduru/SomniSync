import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme/tokens';
import { typography } from '@/theme/typography';
export function FoundationScreen({ title, children }: PropsWithChildren<{ title: string }>) {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>{t('foundation.eyebrow')}</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{t('foundation.description')}</Text>
      {children}
      <Text style={styles.privacy}>{t('foundation.private')}</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: theme.space.lg,
    paddingTop: theme.space.xxl,
    gap: theme.space.lg,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  eyebrow: { color: theme.colors.muted, fontSize: typography.label, letterSpacing: 3 },
  title: { color: theme.colors.text, fontFamily: typography.serif, fontSize: typography.title },
  body: { color: theme.colors.muted, fontSize: typography.body, lineHeight: typography.lineHeight },
  privacy: {
    color: theme.colors.muted,
    fontSize: typography.label,
    marginTop: theme.space.xxl,
    lineHeight: 20,
  },
});
