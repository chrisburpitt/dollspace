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
    // Changed to w-full h-full so it perfectly matches whatever size the parent container is
    <div className="relative group w-full h-full flex-shrink-0">
      {user.avatarUrl ? (
        <img 
          src={user.avatarUrl} 
          alt={user.displayName} 
          // REMOVED: ring-4, ring-blue-50, border-2, border-white, and shadow
          className="w-full h-full rounded-full object-cover" 
        />
      ) : (
        // REMOVED: shadow. Changed size to w-full h-full
        <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-black text-3xl uppercase">
          {user.displayName.charAt(0)}
        </div>
      )}

      {/* The interactive browser form block */}
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
            onChange={(e) => e.target.form?.requestSubmit()} 
          />
        </label>
      </form>
    </div>
  );
}
