import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Locale, TranslationKey } from '@/locales/translations';

interface TranslationContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        // SSR-safe: Load from localStorage only on client
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('locale') as Locale;
            if (saved && ['en', 'fr'].includes(saved)) {
                setLocaleState(saved);
                applyLocale(saved);
            } else {
                applyLocale('en'); // Default
            }
        }
    }, []);

    const applyLocale = (newLocale: Locale) => {
        if (typeof window !== 'undefined') {
            document.documentElement.lang = newLocale;
            document.documentElement.dir = 'ltr';
        }
    };

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        applyLocale(newLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', newLocale);
        }
    }, []);

    const t = useCallback((key: TranslationKey): string => {
        return translations[locale][key] || key;
    }, [locale]);

    return (
        <TranslationContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslationContext = () => {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error('useTranslationContext must be used within a TranslationProvider');
    }
    return context;
};
