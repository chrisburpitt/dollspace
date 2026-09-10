// src/components/FeedForm.tsx
"use client";

import { useState, useTransition } from "react";
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
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-left">
      <form action={handleFormSubmit} className="space-y-4">
        <div className="flex items-start space-x-3">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border" />
          ) : (
            <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">
              {currentUser.displayName.charAt(0)}
            </div>
          )}
          <textarea
            name="content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's updating on your horizon? Drop a link or share code thoughts..."
            rows={3}
            disabled={isPending}
            className="flex-1 text-sm font-medium text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none resize-none pt-1"
          />
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
          <div className="flex items-center space-x-2">
            <label 
              htmlFor="feed-photo-upload" 
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition text-xs font-bold text-gray-600 cursor-pointer border border-gray-100"
            >
              <span>📷</span>
              <span>{selectedCount > 0 ? `${selectedCount}/3 Selected` : "Add Photos"}</span>
            </label>
            <input
              type="file"
              /* 🚀 FIXED: Pluralized attribute name string perfectly matches the Server Action query loop parameter! */
              name="images" 
              accept="image/*"
              multiple // Allows selecting up to 3 gorgeous photos natively
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
            className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
          />
        </div>
      </form>
    </div>
  );
}
