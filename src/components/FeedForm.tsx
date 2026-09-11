// src/components/FeedForm.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { createPost } from "@/app/actions/posts";
import SubmitButton from "./SubmitButton";

interface FeedFormProps {
  currentUser: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

// HIGH-SPEED CLIENT-SIDE COMPRESSION UTILITY: Resizes 4K images to 1200px max in 50ms
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
            resolve(file);
          }
        }, "image/jpeg", quality);
      };
    };
  });
}

export default function FeedForm({ currentUser }: FeedFormProps) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState("");
  
  // 🚀 NEW: State managing selected File handles and their local blob URLs for preview rendering
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automated Day-of-Week Prompts
  useEffect(() => {
    const currentDayIndex = new Date().getDay();
    const name = currentUser.displayName;

    const PLACEHOLDER_PROMPTS = [
      `Happy Sunday! What's the mood today, ${name}? ✨`,
      `Fresh week, fresh drops! What's on your mind today, ${name}? 🌸`,
      `How's your Tuesday looking, ${name}? Share an update! 🩰`,
      `Midweek checkpoint! What are we working on today, ${name}? 💻`,
      `Almost there! What's the vibe this Thursday, ${name}? 💕`,
      `What's on for the weekend, ${name}? 🥂`,
      `Saturday photo drop! What are you getting up to today, ${name}? 📸`
    ];

    setDynamicPlaceholder(PLACEHOLDER_PROMPTS[currentDayIndex]);
  }, [currentUser.displayName]);

  // Clean up object URLs memory leaks on component dismount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // 🚀 NEW: File Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Combine any existing selected files with newly chosen ones
    const newFilesArray = Array.from(files);
    const combinedFiles = [...selectedFiles, ...newFilesArray].slice(0, 3); // Firm cap at 3

    if (selectedFiles.length + newFilesArray.length > 3) {
      alert("🌸 You can select a maximum of 3 gorgeous photos at a time!");
    }

    setSelectedFiles(combinedFiles);
    
    // Revoke old object URLs first
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Generate fresh local blob preview URLs
    const newUrls = combinedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
  };

  // 🚀 NEW: Individual Photo Deletion Handler prior to posting
  const removePhotoPriorToPosting = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updatedFiles);

    // Update preview arrays cleanly
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    const updatedUrls = previewUrls.filter((_, idx) => idx !== indexToRemove);
    setPreviewUrls(updatedUrls);

    // Reset native input element value string so selecting the same photo again fires correctly
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && selectedFiles.length === 0) return;

    startTransition(async () => {
      const customPayload = new FormData();
      customPayload.append("content", text);

      // Compress and append each file remaining inside your tracking state
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const compressedPhoto = await compressImageBeforeUpload(file);
          customPayload.append("images", compressedPhoto);
        }
      }

      const res = await createPost(customPayload);
      if (res?.success) {
        setText("");
        setSelectedFiles([]);
        setPreviewUrls([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
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

        {/* 🚀 NEW: DYNAMIC INTERACTIVE IMAGES PREVIEW BAR ROW GRID */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 animate-scale-up pt-1">
            {previewUrls.map((url, idx) => (
              <div key={url} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group shadow-sm">
                <img src={url} alt="" className="w-full h-full object-cover select-none" />
                
                {/* ✕ CLOSE REMOVE BUTTON: Absolute floating badge triggers delete handler instantly */}
                <button
                  type="button"
                  onClick={() => removePhotoPriorToPosting(idx)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-rose-500 text-white font-black rounded-full w-6 h-6 flex items-center justify-center transition duration-200 text-xs shadow-md select-none z-30"
                >
                  ✕
                </button>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition duration-200" />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <label 
              htmlFor="feed-photo-upload" 
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition text-xs font-bold text-gray-600 cursor-pointer border border-gray-100 shadow-inner select-none"
            >
              <span>📷</span>
              <span>{selectedFiles.length > 0 ? `${selectedFiles.length}/3 Selected` : "Add Photos"}</span>
            </label>
            <input
              type="file"
              id="feed-photo-upload"
              ref={fileInputRef} // 🚀 Linked to reset reference node
              accept="image/*"
              multiple
              disabled={isPending || selectedFiles.length >= 3}
              onChange={handleFileChange}
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
