// src/components/FeedForm.tsx
"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/posts";
import SubmitButton from "./SubmitButton"; 

interface FeedFormProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export default function FeedForm({ currentUser }: FeedFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setFileName(null);

    if (!file) return;

    // Check if file size exceeds 3MB (3 * 1024 * 1024 bytes)
    const maxSizeBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError("❌ This image is too large! Files must be smaller than 3MB.");
      e.target.value = ""; // Clear out the file selection completely
      return;
    }

    setFileName(file.name);
  };

  return (
    <form 
      action={async (formData) => {
        if (error) return; // Block submission if there's an unresolved size error
        await createPost(formData, currentUser.id);
        setFileName(null); // Clear file name on success
        setError(null);
        const form = document.getElementById("feed-form") as HTMLFormElement;
        form?.reset();
      }}
      id="feed-form"
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-left"
    >
      <div className="space-y-2">
        <textarea
          name="content"
          // 🚀 DYNAMIC PLACEHOLDER INJECTED HERE:
          placeholder={`What's on your mind, ${currentUser.displayName}?`}
          rows={3}
          className="w-full resize-none bg-gray-50 text-sm font-medium p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition text-gray-800"
        />
      </div>

      {/* File Size Error Box Layout */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
          {error}
        </div>
      )}

      {/* Visual File Attachment Indicator */}
      {fileName && !error && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-lg flex items-center justify-between">
          <span>📎 Attached: {fileName}</span>
          <button type="button" onClick={() => { setFileName(null); setError(null); }} className="text-red-500 font-bold hover:underline">Remove</button>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <label className="cursor-pointer text-sm font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 px-4 py-2 rounded-xl transition flex items-center space-x-1">
          <span>📷 Attach Photo</span>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </label>
        <span className="text-xs text-gray-400 font-medium">Max size: 3MB</span>
        <SubmitButton label="Post Update" loadingLabel="Publishing..." />
      </div>
    </form>
  );
}