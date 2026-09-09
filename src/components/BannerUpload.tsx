// src/components/BannerUpload.tsx
"use client";

import { useState, useTransition } from "react";
import { updateBanner } from "@/app/actions/posts";

interface BannerUploadProps {
  user: {
    id: string;
    bannerUrl: string | null;
    displayName: string;
  };
  isOwner: boolean;
}

export default function BannerUpload({ user, isOwner }: BannerUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [localBanner, setLocalBanner] = useState(user.bannerUrl);

  return (
    <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-rose-100 to-pink-100 relative group overflow-hidden transition-all duration-300">
      
      {/* 🏞 Render the Landscape Cloud Banner Image Asset */}
      {localBanner ? (
        <img 
          src={localBanner} 
          alt="" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-rose-300/40 select-none">
          <span className="text-7xl font-black tracking-widest uppercase">Dollspace</span>
        </div>
      )}

      {/* 🚀 HIDDEN INTERACTIVE CURSOR OVERLAY: Renders only if user owns this profile */}
      {isOwner && (
        <form 
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        >
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-white font-black text-xs uppercase tracking-widest space-y-2">
            <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-md hover:scale-105 transition duration-200">
              {isPending ? "Uploading..." : "📷 Change Cover Banner"}
            </span>
            <input 
              type="file" 
              name="banner" 
              accept="image/*" 
              disabled={isPending}
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                // Create a temporary local blob string URL to show the image instantly
                setLocalBanner(URL.createObjectURL(file));

                const formData = new FormData();
                formData.append("banner", file);

                startTransition(async () => {
                  await updateBanner(formData, user.id);
                });
              }}
            />
          </label>
        </form>
      )}
    </div>
  );
}
