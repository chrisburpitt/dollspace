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

export default function FeedForm({ currentUser }: FeedFormProps) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [selectedCount, setSelectedCount] = useState(0);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState("");

  // 🚀 AUTOMATED DAY-OF-WEEK QUESTION SYSTEM EFFECT
  useEffect(() => {
    const currentDayIndex = new Date().getDay();
    const name = currentUser.displayName;

    // 🌸 Custom prompt matrices mapped precisely to 0-6 index tracks (Sunday to Saturday)
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

  const handleFormSubmit = async (formData: FormData) => {
    if (!text.trim() && selectedCount === 0) return;

    startTransition(async () => {
      const res = await createPost(formData);
      if (res?.success) {
        setText("");
        setSelectedCount(0);
        const fileInput = document.getElementById("feed-photo-upload") as HTMLInputElement;
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

      <form action={handleFormSubmit} className="space-y-4">
        {/* Main Composition Text Box */}
        <div className="w-full border-b border-gray-50 pb-2">
          <textarea
            name="content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            /* 🚀 DYNAMIC PLACEHOLDER INJECTED HERE */
            placeholder={dynamicPlaceholder || `What's updating on your horizon, ${currentUser.displayName}?`}
            rows={3}
            disabled={isPending}
            className="w-full text-sm font-medium text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none resize-none pt-2 leading-relaxed"
          />
        </div>

        {/* Lower Toolbar Controls */}
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
              name="images"
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
              id="feed-photo-upload"
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