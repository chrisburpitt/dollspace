// src/components/LocationAutofill.tsx (FIXED TURBOPACK SYNTAX ACCENT)
"use client";

import { useState, useEffect, useTransition } from "react";

interface LocationAutofillProps {
  value: string;
  onChange: (val: string) => void;
  hideLabel?: boolean; // Optional tag toggle configuration
}

export default function LocationAutofill({ value, onChange, hideLabel = false }: LocationAutofillProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false); 
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value.trim())}&limit=5`,
          {
            headers: {
              "User-Agent": "DollspaceApp_V2_Client/2.0 (contact: support@dollspace.internal)"
            }
          }
        );
        
        if (!response.ok) throw new Error("Network validation check failed.");
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          const results = data.map((item: any) => {
            const addr = item.address || {};
            const mainName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || item.name || "";
            const stateOrCountry = addr.state || addr.country || "";
            
            return mainName && stateOrCountry ? `${mainName}, ${stateOrCountry}` : null;
          }).filter(Boolean);

          setSuggestions([...new Set(results as string[])]);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Cloud location tracking lookup error inside debouncer loop:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  const handleCaptureDeviceLocationCoords = () => {
    if (!navigator.geolocation) {
      alert("🌸 Sorry, your browser doesn't support automatic GPS location lookups.");
      return;
    }

    setIsGpsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://openstreetmap.org{latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "User-Agent": "DollspaceApp_V2_Client/2.0" } }
          );
          
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const townName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || "";
            const countryArea = addr.state || addr.country || "";

            if (townName && countryArea) {
              onChange(`${townName}, ${countryArea}`);
            } else if (data.display_name) {
              const shortSummary = data.display_name.split(",").slice(0, 2).join(",").trim();
              onChange(shortSummary);
            }
          }
        } catch (err) {
          console.error("Reverse geocoding capture loop failure:", err);
          alert("🌸 Location lookup failed. Please try typing your town name manually.");
        } finally {
          setIsGpsLocating(false);
        }
      },
      (error) => {
        setIsGpsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert("🌸 Location access denied. Check your phone settings to give Dollspace access!");
        }
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  return (
    <div className="relative w-full text-left">
      {/* 🚀 PERFECTLY BALANCED CONDITIONAL LABELLING CLOSURES */}
      {!hideLabel && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Location</label>
          <button
            type="button"
            disabled={isGpsLocating}
            onClick={handleCaptureDeviceLocationCoords}
            className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 transition flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100/60 cursor-pointer shadow-2xs"
          >
            {isGpsLocating ? "⏳ Locating..." : "📍 Use My Location"}
          </button>
        </div>
      )}

      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. Brisbane"
          className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition text-left h-11"
        />
        
        {isSearching && (
          <span className="absolute right-4 text-[9px] text-rose-500 font-black animate-pulse bg-rose-50 px-2 py-0.5 rounded-md shadow-inner z-10">
            SCANNING...
          </span>
        )}
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-gray-100 max-h-48 overflow-y-auto animate-scale-up">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(suggestion);
                setSuggestions([]); 
              }}
              className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-bold transition flex items-center space-x-2 cursor-pointer"
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
