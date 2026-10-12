import { backendEnabled } from '@/services/supabase/client';
import { Link, Slot, usePathname } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { c, Label, ui } from '@/components/ui/kit';
const routes = [
  ['/', 'record', '01'],
  ['/grimoire', 'grimoire', '02'],
  ['/synastry', 'synastry', '03'],
] as const;
export default function TabsLayout() {
  const { t } = useTranslation();
  const pathname = usePathname();
  return (
    <SafeAreaView style={ui.screen}>
      <View style={{ borderBottomWidth: 1, borderColor: c.border }}>
        <View
          style={{
            ...ui.spread,
            width: '100%',
            maxWidth: 1120,
            alignSelf: 'center',
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Link
            href="/"
            style={{ color: c.text, fontSize: 16, letterSpacing: 3, paddingVertical: 12 }}
          >
            SOMNISYNC<Text style={{ fontSize: 10 }}> ◌</Text>
          </Link>
          <View style={ui.row}>
            <View
              style={{
                borderWidth: 1,
                borderColor: c.border,
                paddingHorizontal: 7,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: c.muted, fontSize: 8, letterSpacing: 1 }}>
                {t(backendEnabled ? 'backend.badge' : 'common.demo')}
              </Text>
            </View>
            <Link
              href="/settings"
              accessibilityLabel={t('navigation.settings')}
              style={{ color: c.text, fontSize: 20, padding: 12 }}
            >
              ☷
            </Link>
          </View>
        </View>
      </View>
      <Slot />
      <View style={{ borderTopWidth: 1, borderColor: c.border }}>
        <View
          accessibilityRole="tablist"
          style={{ flexDirection: 'row', width: '100%', maxWidth: 580, alignSelf: 'center' }}
        >
          {routes.map(([href, key, num]) => (
            <Link
              key={key}
              href={href}
              accessibilityRole="tab"
              accessibilityState={{ selected: pathname === href }}
              style={{
                flex: 1,
                textAlign: 'center',
                paddingVertical: 18,
                borderTopWidth: 1,
                borderTopColor: pathname === href ? c.text : 'transparent',
                color: pathname === href ? c.text : c.faint,
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              <Text style={{ fontSize: 8 }}>{num} </Text>
              {t(`navigation.${key}`)}
            </Link>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
