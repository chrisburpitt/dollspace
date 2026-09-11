// src/components/StaticFeedBanner.tsx
"use client";

export default function StaticFeedBanner() {
  return (
    <div className="w-full relative select-none animate-fade-in">
      {/* 🏞️ BACKGROUND BANNER BOX (Matches profile dimensions and blush-pink gradient fallback layout) */}
      <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 relative overflow-hidden shadow-sm">
        {/* Decorative background grid overlays for an elegant layout feel */}
        <div className="absolute inset-0 bg-white/5 opacity-10 backdrop-blur-[1px]" />
        
        {/* Soft, modern ambient light flares */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 right-10 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
