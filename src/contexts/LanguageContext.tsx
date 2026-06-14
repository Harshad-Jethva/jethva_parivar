import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../lib/translations';

type TranslationKey = keyof typeof translations['en'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  getLocalizedContent: (obj: { en?: string; gu?: string; hi?: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('temple-language');
    return (saved as Language) || 'gu';
  });

  useEffect(() => {
    localStorage.setItem('temple-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const getLocalizedContent = (obj: { en?: string; gu?: string; hi?: string }): string => {
    return obj[language] || obj['en'] || obj['gu'] || obj['hi'] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedContent }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
