import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
    return (
        <div className="relative w-full md:w-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[--text-secondary]">
                <SearchIcon />
            </span>
            <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 p-2 pl-10 bg-[--bg-primary]/50 border border-[--border-primary] rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder:text-[--text-tertiary]"
                aria-label="Search for services by title, URL, or description"
            />
        </div>
    );
};

export default SearchBar;