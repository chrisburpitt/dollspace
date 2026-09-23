// src/components/AvatarUploadField.tsx (PART 3 - THE STUDIO INTEGRATION GATES)
"use client";

import { useState } from "react";
import AvatarStudioModal from "./AvatarStudioModal";
import { uploadUserProfilePictureAction } from "@/app/actions/upload"; // Target your media save action

export default function AvatarUploadField({ currentUser }: { currentUser: any }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showStudio, setShowStudio] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 📁 1. Intercept the standard file selection click row
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowStudio(true); // Launch the interactive editor overlay instantly!
    }
  };

  // 🚀 2. Receive the canvas processed JPEG blob and ship it to the remote backend rows
  const handleSaveCroppedAvatar = async (processedBlob: Blob) => {
    setShowStudio(false);
    setIsUploading(true);

    try {
      // Re-package the canvas blob back into a standard form data file stream
      const standardCleanFile = new File([processedBlob], `avatar-${currentUser.id}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("avatar", standardCleanFile);

      // Trigger your existing media backend save process
      const result = await uploadUserProfilePictureAction(formData);

      if (result.success) {
        alert("Your new profile picture has been processed and saved! 🌸");
        window.location.reload(); // Flush page caches to pull down the newly painted avatar
      } else {
        alert(`Upload error: ${result.error || "Failed to update profile pic."}`);
      }
    } catch (err) {
      console.error("Avatar save transaction failure:", err);
      alert("A hardware glitch paused your profile image update.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Visual Input Selector Wrapper Button */}
      <div className="relative group cursor-pointer">
        <label htmlFor="avatar-file-input" className="cursor-pointer block">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-rose-400 shadow-sm relative bg-gray-100 flex items-center justify-center">
            {isUploading ? (
              <span className="text-[10px] font-black uppercase text-rose-500 animate-pulse">Uploading...</span>
            ) : currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">📸</span>
            )}
          </div>
        </label>
        
        <input 
          id="avatar-file-input"
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* 🎯 THE OVERLAY PORTAL TRIGGER MOUNT */}
      {showStudio && selectedFile && (
        <AvatarStudioModal
          file={selectedFile}
          onClose={() => { setShowStudio(false); setSelectedFile(null); }}
          onSave={handleSaveCroppedAvatar}
        />
      )}
    </div>
  );
}
