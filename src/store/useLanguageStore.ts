import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'zh-CN' | 'zh-TW' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'zh-CN', // Default to Simplified Chinese
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'bsc-farm-language',
    }
  )
);

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
};
