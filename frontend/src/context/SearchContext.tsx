import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Product } from '../types';

interface SearchContextType {
  query: string;
  results: Product[];
  isOpen: boolean;
  setQuery: (q: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

interface SearchProviderProps {
  children: React.ReactNode;
  products: Product[]; // live product list (from backend, via useProducts)
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children, products }) => {
  const [query, setQueryRaw] = useState('');
  const [isOpen, setOpen]    = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return products.filter(p => {
      const haystack = [
        p.title, p.titleLine2, p.category, p.subtitle,
        p.eyebrow, p.cardDesc,
        ...(p.tags ?? []),
        ...(p.features ?? []),
      ].join(' ').toLowerCase();
      return haystack.includes(lower);
    });
  }, [query, products]);

  const setQuery = useCallback((q: string) => setQueryRaw(q), []);
  const openSearch   = useCallback(() => setOpen(true), []);
  const closeSearch  = useCallback(() => { setOpen(false); setQueryRaw(''); }, []);
  const clearSearch  = useCallback(() => setQueryRaw(''), []);

  return (
    <SearchContext.Provider value={{ query, results, isOpen, setQuery, openSearch, closeSearch, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
};
