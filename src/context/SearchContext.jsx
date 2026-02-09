import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState({
    destination: '',
    guests: null,
    startDate: null,
    endDate: null,
  });

  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    propertyTypes: [],
    amenities: [],
    instantBook: false,
    minRating: 0,
  });

  const [savedSearches, setSavedSearches] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Update search parameters
  const updateSearchParams = (params) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 50000],
      propertyTypes: [],
      amenities: [],
      instantBook: false,
      minRating: 0,
    });
  };

  // Save search
  const saveSearch = (name) => {
    const newSearch = {
      id: Date.now(),
      name,
      params: searchParams,
      filters: filters,
      createdAt: new Date().toISOString(),
      code: 'RES' + Math.random().toString(36).substring(7).toUpperCase()
    };
    setSavedSearches(prev => [newSearch, ...prev]);
    return newSearch;
  };

  // Delete saved search
  const deleteSavedSearch = (id) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  };

  // Load saved search
  const loadSavedSearch = (search) => {
    setSearchParams(search.params);
    setFilters(search.filters);
  };

  // Add to recently viewed
  const addToRecentlyViewed = (listing) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.id !== listing.id);
      // Add to beginning and limit to 10
      return [listing, ...filtered].slice(0, 10);
    });
  };

  const value = React.useMemo(() => ({
    searchParams,
    updateSearchParams,
    filters,
    updateFilters,
    resetFilters,
    savedSearches,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearch,
    recentlyViewed,
    addToRecentlyViewed,
  }), [searchParams, filters, savedSearches, recentlyViewed]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
