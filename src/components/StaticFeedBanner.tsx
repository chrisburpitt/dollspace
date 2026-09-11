// src/components/StaticFeedBanner.tsx
"use client";

export default function StaticFeedBanner() {
  return (
    <div className="w-full relative overflow-hidden select-none animate-fade-in">
      <div className="w-full h-48 sm:h-64 bg-gray-100 relative">
        <img 
          src="https://utfs.io/f/T14G2VLSOknFc6dR0AlK1Hn5ixAZuvfbOVMImXoph7CyWt0g" // Your hardcoded picture URL path
          alt="" 
          className="w-full h-full object-cover select-none"
        />
        <div className="absolute inset-0 bg-black/5 opacity-5" />
      </div>
    </div>
  );
}