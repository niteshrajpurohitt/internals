"use client";

import { createContext, useContext, useState } from "react";
import { useInitialUrlParam } from "./use-initial-url-param";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  // `null` = the user hasn't typed yet, so fall back to `?q=` from the URL.
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const initialUrlQuery = useInitialUrlParam("q") ?? "";
  const searchQuery = typedQuery ?? initialUrlQuery;

  const updateSearchQuery = (query: string) => {
    setTypedQuery(query);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.pathname === "/") {
        if (query.trim()) {
          url.searchParams.set("q", query.trim());
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState(window.history.state, "", url.toString());
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
