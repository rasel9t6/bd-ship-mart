'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/ui/badge';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export default function SearchBar({
  className = '',
  placeholder = 'Search products...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Changed from 768 to 640 for better small screen detection
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Load popular and trending searches
  useEffect(() => {
    fetchPopularSearches();
    fetchTrendingSearches();
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPopularSearches = async () => {
    try {
      const response = await fetch('/api/search/suggestions?type=popular');
      const data = await response.json();
      setPopularSearches(data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch popular searches:', error);
    }
  };

  const fetchTrendingSearches = async () => {
    try {
      const response = await fetch('/api/search/trending?limit=6');
      const data = await response.json();
      setTrendingSearches(data.trending || []);
    } catch (error) {
      console.error('Failed to fetch trending searches:', error);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const trimmedQuery = searchQuery.trim();

    // Save to recent searches
    const updated = [
      trimmedQuery,
      ...recentSearches.filter((s) => s !== trimmedQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to search results
    router.push(`/search/${encodeURIComponent(trimmedQuery)}`);
    setShowSuggestions(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div
      ref={searchRef}
      className={`relative w-full max-w-xl mx-auto px-2 sm:px-0 ${className}`}
    >
      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className='relative'
      >
        <div className='relative'>
          <input
            ref={inputRef}
            type='text'
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (
                query.trim() ||
                recentSearches.length > 0 ||
                popularSearches.length > 0 ||
                trendingSearches.length > 0
              ) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className='w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-8 sm:pl-10 md:pl-12 pr-8 sm:pr-10 md:pr-12 text-sm md:text-base bg-white border border-gray-300 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-bondi-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md'
          />

          <Search className='absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400' />

          {query && (
            <button
              type='button'
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className='absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400 hover:text-gray-600 p-1 -m-1 rounded-full hover:bg-gray-100 transition-colors'
            >
              <X className='h-full w-full' />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white border border-gray-200 rounded-lg md:rounded-xl shadow-lg sm:shadow-xl z-50 max-h-[75vh] sm:max-h-[70vh] md:max-h-96 overflow-y-auto ${
            isMobile ? 'mx-0' : ''
          }`}
        >
          {/* Loading State */}
          {isLoading && (
            <div className='p-3 sm:p-4 md:p-6 text-center text-gray-500'>
              <div className='animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-bondi-blue-500 mx-auto'></div>
              <p className='mt-2 text-sm md:text-base'>Searching...</p>
            </div>
          )}

          {/* Search Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className='p-1.5 sm:p-2 md:p-3'>
              <div className='text-xs md:text-sm font-medium text-gray-500 px-2 md:px-3 py-1 md:py-2'>
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className='w-full text-left px-2 md:px-3 py-2 md:py-3 text-sm md:text-base hover:bg-gray-50 active:bg-gray-100 rounded-lg flex items-center gap-2 md:gap-3 transition-colors touch-manipulation'
                >
                  <Search className='h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0' />
                  <span className='truncate'>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {!isLoading && trendingSearches.length > 0 && (
            <div className='p-1.5 sm:p-2 md:p-3 border-t border-gray-100'>
              <div className='text-xs md:text-sm font-medium text-gray-500 px-2 md:px-3 py-1 md:py-2 flex items-center gap-1 md:gap-2'>
                <Zap className='h-3 w-3 md:h-4 md:w-4' />
                Trending Now
              </div>
              <div className='flex flex-wrap gap-1 md:gap-2 px-2 md:px-3'>
                {trendingSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='text-xs md:text-sm cursor-pointer hover:bg-orange-50 hover:text-orange-600 border-orange-200 active:bg-orange-100 transition-colors touch-manipulation py-1 md:py-1.5 px-2 md:px-3'
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <span className='truncate max-w-[100px] sm:max-w-[120px] md:max-w-none'>
                      {search}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!isLoading && recentSearches.length > 0 && (
            <div className='p-1.5 sm:p-2 md:p-3 border-t border-gray-100'>
              <div className='flex items-center justify-between px-2 md:px-3 py-1 md:py-2'>
                <div className='text-xs md:text-sm font-medium text-gray-500 flex items-center gap-1 md:gap-2'>
                  <Clock className='h-3 w-3 md:h-4 md:w-4' />
                  Recent
                </div>
                <button
                  onClick={clearRecentSearches}
                  className='text-xs md:text-sm text-gray-400 hover:text-gray-600 active:text-gray-700 p-1 -m-1 rounded transition-colors touch-manipulation'
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className='w-full text-left px-2 md:px-3 py-2 md:py-3 text-sm md:text-base hover:bg-gray-50 active:bg-gray-100 rounded-lg flex items-center gap-2 md:gap-3 transition-colors touch-manipulation'
                >
                  <Clock className='h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0' />
                  <span className='truncate'>{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!isLoading && popularSearches.length > 0 && (
            <div className='p-1.5 sm:p-2 md:p-3 border-t border-gray-100'>
              <div className='text-xs md:text-sm font-medium text-gray-500 px-2 md:px-3 py-1 md:py-2 flex items-center gap-1 md:gap-2'>
                <TrendingUp className='h-3 w-3 md:h-4 md:w-4' />
                Popular
              </div>
              <div className='flex flex-wrap gap-1 md:gap-2 px-2 md:px-3'>
                {popularSearches
                  .slice(0, isMobile ? 3 : 6)
                  .map((search, index) => (
                    <Badge
                      key={index}
                      variant='outline'
                      className='text-xs md:text-sm cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation py-1 md:py-1.5 px-2 md:px-3'
                      onClick={() => handleSuggestionClick(search)}
                    >
                      <span className='truncate max-w-[100px] sm:max-w-[120px] md:max-w-none'>
                        {search}
                      </span>
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading &&
            suggestions.length === 0 &&
            recentSearches.length === 0 &&
            popularSearches.length === 0 &&
            trendingSearches.length === 0 &&
            query && (
              <div className='p-3 sm:p-4 md:p-6 text-center text-gray-500'>
                <p className='text-sm md:text-base'>No suggestions found</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
