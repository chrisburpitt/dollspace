// src/components/ImageLightbox.tsx
"use client";

import { useEffect, useState } from "react";

interface ImageLightboxProps {
  imageUrls: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageLightbox({ imageUrls, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
      if (e.key === "ArrowLeft") setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, imageUrls.length]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 w-10 h-10 flex items-center justify-center font-black transition z-50 text-sm">✕</button>

      {/* Slide Navigation Left Controller */}
      {imageUrls.length > 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length); }}
          className="absolute left-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full text-xs font-bold transition z-50 select-none"
        >
          ◀
        </button>
      )}

      {/* 🚀 FIXED CONTAINER SHELL WITH ANTI-THEFT TRANSPARENT OVERLAY */}
      <div className="max-w-4xl max-h-[85vh] relative flex flex-col items-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrls[currentIndex]} 
          alt="" 
          className="w-auto h-auto max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain select-none" 
          draggable="false" // 🚫 Completely blocks dragging asset blocks to the computer desktop
        />
        
        {/* 🚀 THE OVERLAY LIGHTBOX GUARD: Shield sits perfectly over the expanded photo to block right-clicks */}
        <div 
          className="absolute inset-0 bg-transparent rounded-2xl z-10 cursor-default"
          onContextMenu={(e) => e.preventDefault()} // 🚫 Locks out the mouse right-click context asset panel dropdown menu
        />

        {imageUrls.length > 1 && (
          <span className="bg-black/60 px-3 py-1 text-[11px] font-bold text-gray-300 rounded-full mt-3 tracking-widest select-none z-20">
            {currentIndex + 1} / {imageUrls.length}
          </span>
        )}
      </div>

      {/* Slide Navigation Right Controller */}
      {imageUrls.length > 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % imageUrls.length); }}
          className="absolute right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full text-xs font-bold transition z-50 select-none"
        >
          ▶
        </button>
      )}
    </div>
  );
}
