// src/components/ImageLightbox.tsx
"use client";

import { useEffect } from "react";

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  // Prevent underlying body scroll lines from moving while modal is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // Dismiss full viewport display cleanly on pressing the Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
    >
      {/* Absolute Header Top Right Close Label Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 w-10 h-10 flex items-center justify-center font-black transition border border-white/10 shadow-lg text-sm"
      >
        ✕
      </button>

      {/* High-Resolution Fully Aspect-Preserved Main Display Image Node Container */}
      <div className="max-w-5xl max-h-[90vh] relative animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrl} 
          alt="Full size media preview" 
          className="w-auto h-auto max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-white/5 object-contain select-none"
        />
      </div>
    </div>
  );
}
