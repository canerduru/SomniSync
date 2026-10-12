import { Platform } from 'react-native';
export const typography = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
  title: 42,
  body: 16,
  label: 12,
  lineHeight: 25,
} as const;
