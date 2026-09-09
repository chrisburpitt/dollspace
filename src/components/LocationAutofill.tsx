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
        // 🚀 BULLETPROOF QUERY ALTERATION: Removed restrictive settlement parameters to allow flexible text parsing
        const response = await fetch(
          `https://openstreetmap.org{encodeURIComponent(value)}&addressdetails=1&limit=5`,
          {
            headers: {
              "User-Agent": "DollspaceSocialApp/1.0 (contact: admin@dollspace.internal)",
              "Accept": "application/json"
            }
          }
        );
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const results = data.map((item: any) => {
            const addr = item.address || {};
            
            // 🏙️ Extract the best matching town name label variants
            const townName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.city_district || "";
            
            // 🗺️ Extract state/region data
            const stateName = addr.state || addr.state_district || addr.region || addr.country || "";
            
            if (townName && stateName) {
              return `${townName}, ${stateName}`;
            }
            
            // Fallback: Grab the first two segments of the long default text node line if parameters are deeply hidden
            return item.display_name.split(",").slice(0, 2).map((s: string) => s.trim()).join(", ");
          }).filter(Boolean);

          // Deduplicate the list cleanly
          setSuggestions([...new Set(results as string[])]);
        }
      } catch (err) {
        console.error("Location lookup autocomplete error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // Fast 400ms debounce loop protects connection buffers

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
        <span className="absolute right-4 bottom-3.5 text-[10px] text-rose-400 font-bold animate-pulse">Searching...</span>
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
                setSuggestions([]); // Instantly sweeps out the overlay drawer menu
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
