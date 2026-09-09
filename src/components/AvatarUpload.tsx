// src/components/AvatarUpload.tsx
"use client";

import { updateAvatar } from "@/app/actions/posts";

interface AvatarUploadProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export default function AvatarUpload({ user }: AvatarUploadProps) {
  return (
    <div className="relative group w-24 h-24 flex-shrink-0">
      {user.avatarUrl ? (
        <img 
          src={user.avatarUrl} 
          alt={user.displayName} 
          className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-50 border-2 border-white shadow" 
        />
      ) : (
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-black text-3xl uppercase shadow">
          {user.displayName.charAt(0)}
        </div>
      )}

      {/* The interactive browser form block is safe out here! */}
      <form 
        action={async (formData) => {
          await updateAvatar(formData, user.id);
        }} 
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 rounded-full transition-opacity cursor-pointer duration-200"
      >
        <label className="cursor-pointer text-white font-bold text-[10px] uppercase text-center p-1 tracking-wider w-full h-full flex items-center justify-center">
          <span>Upload<br />Avatar</span>
          <input 
            type="file" 
            name="avatar" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.form?.requestSubmit()} // Automatically submits the photo on click
          />
        </label>
      </form>
    </div>
  );
}
