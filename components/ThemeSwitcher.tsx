import React from 'react';
import { useTheme, Theme } from '../hooks/useTheme';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

const ThemeSwitcher: React.FC = () => {
    const [theme, setTheme] = useTheme();

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
    };

    return (
        <div className="flex items-center gap-2 p-1 rounded-full bg-[--bg-primary]">
            <button
                onClick={() => handleThemeChange('light')}
                className={`p-2 rounded-full transition-colors duration-300 ${
                    theme === 'light' ? 'bg-cyan-500 text-white' : 'hover:bg-[--bg-tertiary] text-[--text-secondary]'
                }`}
                aria-label="Switch to light theme"
            >
                <SunIcon />
            </button>
            <button
                onClick={() => handleThemeChange('dark')}
                className={`p-2 rounded-full transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-cyan-500 text-white' : 'hover:bg-[--bg-tertiary] text-[--text-secondary]'
                }`}
                aria-label="Switch to dark theme"
            >
                <MoonIcon />
            </button>
        </div>
    );
};

export default ThemeSwitcher;
