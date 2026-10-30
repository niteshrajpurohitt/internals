"use client";

import { createContext, useContext, useState } from "react";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return new URLSearchParams(window.location.search).get("q") || "";
      } catch {
        return "";
      }
    }
    return "";
  });

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.pathname === "/") {
        if (query.trim()) {
          url.searchParams.set("q", query.trim());
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState({}, "", url.toString());
      }
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
