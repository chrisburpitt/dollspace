// src/components/AvatarUpload.tsx (PERMISSIONS LOCK & LIGHTBOX SYSTEM)
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageLightbox from "./ImageLightbox"; // 🚀 Import your existing full-screen photo viewer component!

interface AvatarUploadProps {
  user: {
    id: string;
    avatarUrl: string | null;
    displayName: string;
  };
  isOwner: boolean; // 🚀 Incoming ownership constraint validator parameter
}

export default function AvatarUpload({ user, isOwner }: AvatarUploadProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarUrlPreview] = useState(user.avatarUrl);
  
  // 🚀 LIGHTBOX MODAL TRIGGER STATE
  const [showFullscreenPhoto, setShowFullscreenPhoto] = useState(false);

  const handleAvatarFileSelectionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !isOwner) return; // Guard check blocks malicious injections

    const file = files[0];
    
    // Optimistic UI Local Update: Show it on screen instantly
    const localUrlPreviewPath = URL.createObjectURL(file);
    setAvatarUrlPreview(localUrlPreviewPath);

    startTransition(async () => {
      try {
        const payload = new FormData();
        payload.append("avatar", file);

        const res = await fetch("/api/user/avatar", {
          method: "POST",
          body: payload,
        });

        if (res.ok) {
          router.refresh();
        } else {
          alert("Failed to update avatar photo asset registry records.");
        }
      } catch (err) {
        console.error("Avatar streaming file upload crashed:", err);
      }
    });
  };

  return (
    <div className="w-full h-full relative group select-none">
      
      {/* 🚀 CONDITIONAL RENDER: OWNER INTERFACE (Show upload overlay mask triggers) */}
      {isOwner ? (
        <label className="w-full h-full block cursor-pointer relative overflow-hidden">
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-rose-500 text-white flex items-center justify-center font-black text-2xl uppercase">
              {user.displayName.charAt(0)}
            </div>
          )}
          
          {/* Hover Darkening Overlay Effect Mask */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-wider">
            {isPending ? "⏳ Loading" : "📸 Change"}
          </div>

          <input
            type="file"
            accept="image/*"
            disabled={isPending}
            onChange={handleAvatarFileSelectionChange}
            className="hidden"
          />
        </label>
      ) : (
        /* 🚀 CONDITIONAL RENDER: VISITOR INTERFACE (Clicking launches full screen picture modal view) */
        <button
          type="button"
          onClick={() => setShowFullscreenPhoto(true)}
          className="w-full h-full block overflow-hidden focus:outline-none cursor-zoom-in"
          title={`Click to view ${user.displayName}'s avatar full size`}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="w-full h-full object-cover transition duration-300 hover:scale-[1.02]" />
          ) : (
            <div className="w-full h-full bg-rose-500 text-white flex items-center justify-center font-black text-2xl uppercase">
              {user.displayName.charAt(0)}
            </div>
          )}
        </button>
      )}

      {/* 🚀 LIGHTBOX CANVAS PANEL PORTAL MOUNT */}
      {showFullscreenPhoto && avatarPreview && (
        <ImageLightbox 
          imageUrls={[avatarPreview]} 
          initialIndex={0} 
          onClose={() => setShowFullscreenPhoto(false)} 
        />
      )}
    </div>
  );
}
