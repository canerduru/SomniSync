import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Dictionary, dictionaries, defaultLanguage } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('somnisync_lang') as Language;
      return saved === 'en' || saved === 'tr' ? saved : defaultLanguage;
    } catch {
      return defaultLanguage;
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('somnisync_lang', lang);
    } catch {
      // storage unavailable
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: dictionaries[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
