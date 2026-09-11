// src/components/StaticFeedBanner.tsx
"use client";

export default function StaticFeedBanner() {
  return (
    <div className="w-full relative overflow-hidden select-none animate-fade-in">
      <div className="w-full h-48 sm:h-64 bg-gray-100 relative">
        <img 
          src="https://unsplash.com" // Your hardcoded picture URL path
          alt="" 
          className="w-full h-full object-cover select-none"
        />
        <div className="absolute inset-0 bg-black/5 opacity-5" />
      </div>
    </div>
  );
}