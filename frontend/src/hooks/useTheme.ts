import { useThemeContext } from '@/context/ThemeContext';

export const useTheme = () => {
    const { theme, toggleTheme, setTheme } = useThemeContext();
    return { theme, toggleTheme, setTheme };
};

