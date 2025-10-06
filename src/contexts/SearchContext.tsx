// src/context/SearchContext.tsx
import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import productService from '@/services/productService';
import { useCountryCurrency } from './CountryCurrencyContext';

export interface UIProduct {
  name: string;
  slug: string;
  cover_image: string | null;
  price: number;
  currency: { code: string; symbol: string };
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  results: UIProduct[];
  filteredResults: UIProduct[];
  isSearching: boolean;
  errorMsg: string | null;
  clearSearch: () => void;

  // optional client-side filters/sorts
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';
  setSortBy: (s: SearchContextType['sortBy']) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({
  children,
  debounceMs = 300,
}: {
  children: React.ReactNode;
  debounceMs?: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UIProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { selectedCountry } = useCountryCurrency();

  // optional client-side extras
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] =
    useState<SearchContextType['sortBy']>('featured');

  useEffect(() => {
    const q = searchQuery.trim();
    const abort = new AbortController();

    if (!q) {
      setResults([]);
      setIsSearching(false);
      setErrorMsg(null);
      return () => abort.abort();
    }

    setIsSearching(true);
    setErrorMsg(null);

    const t = setTimeout(async () => {
      try {
        // Use selected country ID from context
        const res = await productService.searchByQuery(selectedCountry?.id || 1, q, abort.signal);
        if (res.error) throw new Error(res.message || 'API error');

        const items = (res.details?.products ?? []) as UIProduct[];
        setResults(items);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setErrorMsg(e?.message || 'Failed to search products');
          setResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      abort.abort();
      clearTimeout(t);
    };
  }, [searchQuery, selectedCountry?.id, debounceMs]);

  // backend already returns newest-first; we add optional price/name sorting
  const filteredResults = useMemo(() => {
    let list = results.filter(
      (p) => typeof p.price === 'number' && p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-low':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
      default:
        // keep backend order (newest-first)
        break;
    }

    return list;
  }, [results, priceRange, sortBy]);

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsSearching(false);
    setErrorMsg(null);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        results,
        filteredResults,
        isSearching,
        errorMsg,
        clearSearch,
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within a SearchProvider');
  return ctx;
}
