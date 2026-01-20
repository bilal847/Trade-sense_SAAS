import { useTranslationContext } from '@/context/TranslationContext';

export const useTranslation = () => {
    return useTranslationContext();
};
