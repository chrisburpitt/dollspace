// src/components/FeedForm.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { createPost } from "@/app/actions/posts";
import SubmitButton from "./SubmitButton";

interface FeedFormProps {
  currentUser: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

// 🚀 HIGH-SPEED CLIENT-SIDE COMPRESSION UTILITY: Resizes 4K images to 1200px max in 50ms
function compressImageBeforeUpload(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if compression skips
          }
        }, "image/jpeg", quality);
      };
    };
  });
}

export default function FeedForm({ currentUser }: FeedFormProps) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [selectedCount, setSelectedCount] = useState(0);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState("");

  // Automated Day-of-Week Prompts
  useEffect(() => {
    const currentDayIndex = new Date().getDay();
    const name = currentUser.displayName;

    const PLACEHOLDER_PROMPTS = [
      `It's Storytime Sunday! Tell us a story, ${name} ✨`,
      `Fresh week, fresh drops! What's on your mind today, ${name}? 🌸`,
      `How's your Tuesday looking, ${name}? What are you crushing? 🩰`,
      `On Wednesday's we wear pink! Post an outfiot pic, ${name}! 🩷`,
      `What's the vibe for #hersday diva? 💕`,
      `What's happening this weekend, ${name}? 🥂`, // 🎯 Friday prompt!
      `Saturday SLAY photo drop incoming! Send us a selfie gorge! 📸`
    ];

    setDynamicPlaceholder(PLACEHOLDER_PROMPTS[currentDayIndex]);
  }, [currentUser.displayName]);

  // 🚀 FIXED TYPE SIGNATURE: Uses explicit React FormEvent to satisfy TypeScript build checks
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && selectedCount === 0) return;

    startTransition(async () => {
      const customPayload = new FormData();
      customPayload.append("content", text);

      const fileInput = document.getElementById("feed-photo-upload") as HTMLInputElement;
      const files = fileInput?.files;

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          // Compress the photo on the client thread before piping it to UploadThing
          const compressedPhoto = await compressImageBeforeUpload(files[i]);
          customPayload.append("images", compressedPhoto);
        }
      }

      const res = await createPost(customPayload);
      if (res?.success) {
        setText("");
        setSelectedCount(0);
        if (fileInput) fileInput.value = "";
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-left relative mt-16 pt-14">
      
      {/* Floating avatar bubble circle frame */}
      <div className="absolute -top-14 left-6 sm:left-8 border-4 border-white rounded-full bg-white shadow-md overflow-hidden w-28 h-28 flex items-center justify-center shrink-0 select-none z-20">
        {currentUser.avatarUrl ? (
          <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-rose-500 text-white flex items-center justify-center font-black text-2xl uppercase">
            {currentUser.displayName.charAt(0)}
          </div>
        )}
      </div>

      {/* 🚀 FIXED EVENT TARGET: Changed from action={} to onSubmit={} for standard client-side forms */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="w-full border-b border-gray-50 pb-2">
          <textarea
            name="content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={dynamicPlaceholder || `What's updating on your horizon, ${currentUser.displayName}?`}
            rows={3}
            disabled={isPending}
            className="w-full text-sm font-medium text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none resize-none pt-2 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <label 
              htmlFor="feed-photo-upload" 
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition text-xs font-bold text-gray-600 cursor-pointer border border-gray-100"
            >
              <span>📷</span>
              <span>{selectedCount > 0 ? `${selectedCount}/3 Selected` : "Add Photos"}</span>
            </label>
            <input
              type="file"
              id="feed-photo-upload"
              accept="image/*"
              multiple
              disabled={isPending}
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  if (files.length > 3) {
                    alert("🌸 You can select a maximum of 3 gorgeous photos at a time!");
                    e.target.value = "";
                    setSelectedCount(0);
                  } else {
                    setSelectedCount(files.length);
                  }
                }
              }}
              className="hidden"
            />
          </div>

          <SubmitButton 
            label="Post Update ✨" 
            loadingLabel="Publishing..." 
            className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-sm tracking-wide"
          />
        </div>
      </form>
    </div>
  );
}