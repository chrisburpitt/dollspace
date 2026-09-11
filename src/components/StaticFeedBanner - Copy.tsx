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

      {/* 🌸 HOVER BUBBLE CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="absolute -top-12 left-8 flex items-end space-x-4">
          {/* Static Platform Icon Badge acting as the overlapping avatar frame */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-rose-500 text-white shadow-md flex items-center justify-center font-black text-2xl tracking-tighter uppercase select-none select-none">
            ✨ DS
          </div>
          
          {/* Fixed Hub Branding Labels */}
          <div className="mb-2 hidden sm:block bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/40 shadow-sm text-left">
            <h1 className="text-sm font-black text-gray-900 tracking-tight leading-none">Dollspace Network</h1>
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">Community Timeline</p>
          </div>
        </div>
      </div>
    </div>
  );
}
