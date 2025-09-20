import React from 'react';
import SearchBar from './SearchBar';
import { SettingsIcon } from './icons/SettingsIcon';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
    appName: string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ appName, searchQuery, setSearchQuery, onSettingsClick }) => {
  return (
    <header className="bg-[--bg-secondary]/50 backdrop-blur-sm shadow-lg sticky top-0 z-10 border-b border-[--border-primary]/20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[--text-primary] tracking-wider">
            {appName}
            </h1>
            <p className="text-[--text-secondary] mt-1">Your personal launchpad for web apps and services.</p>
        </div>
        <div className="flex items-center gap-4">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <ThemeSwitcher />
            <button
                onClick={onSettingsClick}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-px"
                aria-label="Open settings"
            >
                <SettingsIcon />
                <span className="hidden md:inline">Settings</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;