import type { ExpoConfig } from 'expo/config';
const config: ExpoConfig = {
  name: 'SomniSync',
  slug: 'somnisync',
  version: '0.1.0',
  scheme: 'somnisync',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  plugins: [
    'expo-router',
    'expo-sharing',
    'expo-secure-store',
    [
      'expo-audio',
      {
        microphonePermission: 'Rüyanı sesli kaydetmek için mikrofon erişimi gerekir.',
        enableBackgroundRecording: false,
      },
    ],
  ],
  ios: { supportsTablet: true, bundleIdentifier: 'app.somnisync.mobile' },
  android: { package: 'app.somnisync.mobile' },
  web: { bundler: 'metro' },
  experiments: { typedRoutes: true },
};
export default config;
