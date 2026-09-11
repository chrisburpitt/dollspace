// src/components/StaticFeedBanner.tsx
"use client";

export default function StaticFeedBanner() {
  return (
    <div className="w-full relative overflow-hidden select-none animate-fade-in shadow-sm">
      {/* 🚀 HARDCODED PICTURE CANVAS (Matches the profile banner height perfectly) */}
      <div className="w-full h-52 sm:h-72 bg-gray-100 relative">
        <img 
          src="https://unsplash.com" // 🎯 Swap this URL out with any image path you want to hardcode!
          alt="" 
          className="w-full h-full object-cover select-none"
          priority-attr="true"
        />
        {/* Soft elegant glass overlay to keep color text readable */}
        <div className="absolute inset-0 bg-black/5 opacity-5" />
      </div>
    </div>
  );
}
