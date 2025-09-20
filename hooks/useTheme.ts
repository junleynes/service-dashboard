import { useLocalStorage } from './useLocalStorage';
import { useEffect } from 'react';

export type Theme = 'dark' | 'light';

export function useTheme(): [Theme, (theme: Theme) => void] {
    const [theme, setTheme] = useLocalStorage<Theme>('dashboard-theme', 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        // Set a default theme if none is stored
        const currentTheme = theme || 'dark';
        root.classList.add(currentTheme);
    }, [theme]);

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme);
    };

    return [theme, handleSetTheme];
}