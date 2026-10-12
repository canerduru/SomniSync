import { backendEnabled } from '@/services/supabase/client';
import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';
import { theme } from '@/theme/tokens';
import { typography } from '@/theme/typography';
export const c = theme.colors;
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  content: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 24,
  },
  eyebrow: { color: c.muted, fontSize: 10, letterSpacing: 2.4, lineHeight: 18 },
  title: {
    color: c.text,
    fontFamily: typography.serif,
    fontSize: 48,
    lineHeight: 53,
    letterSpacing: -1.6,
  },
  subtitle: { color: c.muted, fontSize: 15, lineHeight: 25, maxWidth: 520 },
  body: { color: c.text, fontSize: 16, lineHeight: 28 },
  note: { color: c.muted, fontSize: 12, lineHeight: 20 },
  rule: { height: 1, backgroundColor: c.border, width: '100%' },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
    color: c.text,
    fontSize: 15,
    backgroundColor: c.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  card: { borderWidth: 1, borderColor: c.border, padding: 24, gap: 16 },
});
export function Label({ children }: PropsWithChildren) {
  return <Text style={ui.eyebrow}>{children}</Text>;
}
export function Rule() {
  return <View style={ui.rule} />;
}
export function Button({
  title,
  onPress,
  secondary = false,
  busy = false,
  disabled = false,
  selected,
  style,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  busy?: boolean;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy, selected }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 52,
          paddingHorizontal: 20,
          paddingVertical: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: c.text,
          backgroundColor: secondary ? 'transparent' : c.text,
          opacity: disabled ? 0.35 : pressed ? 0.65 : 1,
        },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? c.text : c.background} />
      ) : (
        <Text
          style={{
            color: secondary ? c.text : c.background,
            fontSize: 12,
            letterSpacing: 1.1,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
export function TextButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ minHeight: 44, justifyContent: 'center' }}
    >
      <Text
        style={{ color: c.text, fontSize: 12, textDecorationLine: 'underline', lineHeight: 20 }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Page({ children, back = false }: PropsWithChildren<{ back?: boolean }>) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <SafeAreaView style={ui.screen} edges={back ? ['top', 'bottom'] : []}>
      {back && (
        <View style={{ ...ui.spread, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
          <TextButton
            title={`← ${t('common.back')}`}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
          <Label>{t(backendEnabled ? 'backend.badge' : 'common.demo')}</Label>
        </View>
      )}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Tag({
  slug,
  selected,
  onPress,
}: {
  slug: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const label = t(`tags.${slug}` as 'tags.water', { defaultValue: slug });
  const style = {
    borderWidth: 1,
    borderColor: selected ? c.text : c.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: selected ? c.text : 'transparent',
  };
  const text = (
    <Text style={{ color: selected ? c.background : c.muted, fontSize: 11 }}>{label}</Text>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={style}
    >
      {text}
    </Pressable>
  ) : (
    <View style={style}>{text}</View>
  );
}
export function Permission({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={{ ...ui.spread, alignItems: 'flex-start' }}>
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={{ color: c.text, fontSize: 15, lineHeight: 22 }}>{title}</Text>
        {description && <Text style={ui.note}>{description}</Text>}
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#363636', true: '#AAA' }}
        thumbColor={value ? '#FFF' : '#777'}
        ios_backgroundColor="#363636"
      />
    </View>
  );
}
export function Confirm({
  visible,
  title,
  body,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: '#000C',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{ ...ui.card, backgroundColor: c.background, width: '100%', maxWidth: 460 }}
        >
          <Text accessibilityRole="header" style={{ ...ui.title, fontSize: 30, lineHeight: 36 }}>
            {title}
          </Text>
          <Text style={ui.subtitle}>{body}</Text>
          <Button title={t('common.delete')} onPress={onConfirm} />
          <Button secondary title={t('common.cancel')} onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}
export function Empty({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href?: '/' | '/grimoire';
  action?: string;
}) {
  return (
    <View style={{ paddingVertical: 48, gap: 16 }}>
      <Text style={{ ...ui.title, fontSize: 34, lineHeight: 40 }}>{title}</Text>
      <Text style={ui.subtitle}>{body}</Text>
      {href && (
        <Link
          href={href}
          style={{ color: c.text, paddingVertical: 16, textDecorationLine: 'underline' }}
        >
          {action}
        </Link>
      )}
    </View>
  );
}
