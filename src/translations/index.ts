import { zhCN, Translations } from './zh-CN';
import { zhTW } from './zh-TW';
import { en } from './en';
import { Language, useLanguageStore } from '../store/useLanguageStore';

// All translations
const translations: Record<Language, Translations> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en': en,
};

// Get translations for current language
export const getTranslations = (lang: Language): Translations => {
  return translations[lang] || zhCN;
};

// Hook to get current translations
export const useTranslation = () => {
  const { language } = useLanguageStore();
  return getTranslations(language);
};

// Shorthand hook that returns t function and current language
export const useT = () => {
  const { language, setLanguage } = useLanguageStore();
  const t = getTranslations(language);
  return { t, language, setLanguage };
};

export { zhCN, zhTW, en };
export type { Translations };
