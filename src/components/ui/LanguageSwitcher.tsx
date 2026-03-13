'use client';

import { useLangStore } from '@/store/useLangStore';

export function LanguageSwitcher() {
    const { language, setLanguage } = useLangStore();

    return (
        <div className="fixed top-4 right-4 flex gap-2 z-50 bg-white/80 backdrop-blur pb-1 pl-2 rounded-bl-xl border-b border-l border-zinc-100/50">
            <button
                onClick={() => setLanguage('nl')}
                className={`text-sm font-medium px-2 py-1 rounded-md transition-colors ${language === 'nl' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
            >
                NL
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`text-sm font-medium px-2 py-1 rounded-md transition-colors ${language === 'en' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('ko')}
                className={`text-sm font-medium px-2 py-1 rounded-md transition-colors ${language === 'ko' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
            >
                KR
            </button>
        </div>
    );
}
