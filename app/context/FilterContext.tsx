"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Manages selected tags for filtering
type FilterContextType = {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
};

// Create the context with no default
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Provider makes tag filter state available to children
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <FilterContext.Provider value={{ selectedTags, setSelectedTags }}>
      {children}
    </FilterContext.Provider>
  );
};

// Hook to access the tag filter state — throws if used outside provider
export const useFilterContext = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context)
    throw new Error("useFilterContext must be used within FilterProvider");
  return context;
};
