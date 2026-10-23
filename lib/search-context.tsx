"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setSearchQuery(q);
    }
  }, []);

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set("q", query.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery: updateSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
