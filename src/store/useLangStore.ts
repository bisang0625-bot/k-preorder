import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'nl' | 'en' | 'ko';

interface LangState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLangStore = create<LangState>()(
    persist(
        (set) => ({
            language: 'nl', // default
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'hanok-lang-storage',
        }
    )
);
