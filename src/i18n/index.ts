import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr.json';
import en from './locales/en.json';
export const locales = ['tr', 'en'] as const;
export type AppLocale = (typeof locales)[number];
void i18n.use(initReactI18next).init({
  resources: { tr: { translation: tr }, en: { translation: en } },
  lng: 'tr',
  fallbackLng: 'tr',
  supportedLngs: [...locales],
  interpolation: { escapeValue: false },
  initAsync: false,
});
export const formatDreamDate = (date: Date, locale: AppLocale = 'tr') =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
export default i18n;
