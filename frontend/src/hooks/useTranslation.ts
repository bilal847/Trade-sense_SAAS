import { useState, useEffect } from 'react';
import { translations, Locale, TranslationKey } from '@/locales/translations';

export const useTranslation = () => {
    const [locale, setLocaleState] = useState<Locale>('en'); // Default English

    useEffect(() => {
        // SSR-safe: Load from localStorage only on client
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('locale') as Locale;
            if (saved && ['en', 'fr'].includes(saved)) {
                setLocaleState(saved);
                applyLocale(saved);
            } else {
                applyLocale('en');
            }
        }
    }, []);

    const applyLocale = (newLocale: Locale) => {
        if (typeof window !== 'undefined') {
            document.documentElement.dir = 'ltr'; // Always LTR since AR is gone
            document.documentElement.lang = newLocale;
        }
    };

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        applyLocale(newLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', newLocale);
        }
    };

    const t = (key: TranslationKey): string => {
        return translations[locale][key] || key;
    };

    return { t, locale, setLocale };
};
