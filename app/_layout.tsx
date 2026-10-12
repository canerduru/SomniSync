import '@/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AuthGate } from '@/features/auth/AuthGate';
import { DreamProvider } from '@/features/dreams/DreamProvider';
import { useReducedMotion } from 'react-native-reanimated';
import { c } from '@/components/ui/kit';
export default function RootLayout() {
  const reducedMotion = useReducedMotion();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <DreamProvider>
            <AuthGate>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: c.background },
                  animation: reducedMotion ? 'none' : 'fade',
                }}
              />
            </AuthGate>
          </DreamProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
