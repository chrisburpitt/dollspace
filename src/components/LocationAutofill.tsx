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
    // Block lookup queries if string length is too short to protect API limits
    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // 🚀 CRITICAL UPDATE: Fetch town suggestions using standard parameters
        const response = await fetch(
          `https://openstreetmap.org{encodeURIComponent(value)}&featuretype=settlement&addressdetails=1&limit=5`,
          {
            headers: {
              // 🛡️ IDENTIFICATION HEADERS: Directs the network loop past firewall blockers safely
              "User-Agent": "DollspaceSocialApp/1.0 (contact: admin@dollspace.internal)",
              "Accept": "application/json"
            }
          }
        );
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const results = data.map((item: any) => {
            const addr = item.address || {};
            // Extract the most distinct settlement identifier name
            const townName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || item.name || "";
            const stateName = addr.state || addr.region || addr.country || "";
            
            return townName && stateName ? `${townName}, ${stateName}` : item.display_name.split(",").slice(0, 2).join(",");
          }).filter(Boolean);

          // Clean out duplicates cleanly
          setSuggestions([...new Set(results as string[])]);
        }
      } catch (err) {
        console.error("Location lookup network error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce loop protects connection buffers

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
        <span className="absolute right-4 bottom-3 text-xs text-gray-400 font-bold animate-pulse">Searching...</span>
      )}

      {/* Suggestion Dropdown List Panel Frame Overlay */}
      {suggestions.length > 0 && (
        <div className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-gray-100 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(suggestion);
                setSuggestions([]);
              }}
              className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-bold transition flex items-center space-x-1.5"
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
