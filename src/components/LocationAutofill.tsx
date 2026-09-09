// src/components/LocationAutofill.tsx
"use client";

import { useState, useEffect } from "react";

interface LocationAutofillProps {
  value: string;
  onChange: (val: string) => void;
}

export default function LocationAutofill({ value, onChange }: LocationAutofillProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // 1. Guard check: Don't query until user types at least 3 characters
    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // 🚀 SWITCHED TO GEONAMES API: Completely unrestricted cloud city directory index pipeline
        const response = await fetch(
          `https://geonames.org{encodeURIComponent(value)}&maxRows=5&username=demo&cities=cities15000`,
          { method: "GET" }
        );
        
        const data = await response.json();
        
        if (data && Array.isArray(data.geonames)) {
          const results = data.geonames.map((item: any) => {
            const cityName = item.name || "";
            const stateName = item.adminName1 || item.countryName || "";
            return cityName && stateName ? `${cityName}, ${stateName}` : null;
          }).filter(Boolean);

          // Remove duplicates cleanly
          setSuggestions([...new Set(results as string[])]);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Geonames location lookup error:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce loop protects request parameters safely

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  return (
    <div className="relative">
      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Location</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start typing your town or state..."
        className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition"
      />
      
      {isSearching && (
        <span className="absolute right-4 bottom-3.5 text-[10px] text-rose-500 font-black animate-pulse bg-rose-50 px-2 py-0.5 rounded-md shadow-sm z-10">
          SEARCHING...
        </span>
      )}

      {/* Suggestion Dropdown Panel Canvas Overlay */}
      {suggestions.length > 0 && (
        <div className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-gray-100 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(suggestion);
                setSuggestions([]); // Instantly closes the drawer selection menu layout
              }}
              className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-bold transition flex items-center space-x-2"
            >
              <span>📍</span>
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
