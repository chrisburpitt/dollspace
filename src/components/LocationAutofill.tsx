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
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(false);
      try {
        const response = await fetch(
          `https://openstreetmap.org{encodeURIComponent(value)}&featuretype=settlement&addressdetails=1&limit=5`
        );
        const data = await response.json();
        
        const results = data.map((item: any) => {
          const city = item.address.city || item.address.town || item.address.village || item.address.suburb || "";
          const state = item.address.state || "";
          return city ? `${city}, ${state}` : item.display_name.split(",")[0];
        });

        setSuggestions([...new Set(results as string[])]);
      } catch (err) {
        console.error("Location lookup error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce loop

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  return (
    <div className="relative">
      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Location</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start typing your town..."
        className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
      
      {isSearching && (
        <span className="absolute right-3 top-10 text-[10px] text-gray-400 animate-pulse">Searching...</span>
      )}

      {suggestions.length > 0 && (
        <div className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 divide-y divide-gray-50">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(suggestion);
                setSuggestions([]);
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-bold transition"
            >
              📍 {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
