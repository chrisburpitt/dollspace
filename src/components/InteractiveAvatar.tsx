"use client";

import { useState, useRef } from "react";
import AvatarStudioModal from "./AvatarStudioModal";
import { uploadUserProfilePictureAction } from "@/app/actions/upload"; // Ensure this server action exists

interface InteractiveAvatarProps {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
  isEditable: boolean; // True only if viewing your own feed/profile card
  sizeClass?: string;  // Custom Tailwind size overrides
}

export default function InteractiveAvatar({ 
  userId, 
  avatarUrl, 
  displayName, 
  isEditable, 
  sizeClass = "w-24 h-24" 
}: InteractiveAvatarProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showStudio, setShowStudio] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarContainerClick = () => {
    if (!isEditable || isUploading) return;
    fileInputRef.current?.click(); // Simulates hidden file input selection
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowStudio(true);
    }
  };

  const handleSaveCroppedAvatar = async (processedBlob: Blob) => {
    setShowStudio(false);
    setIsUploading(true);

    try {
      // Package the binary canvas blob into a clean form data payload stream
      const standardCleanFile = new File([processedBlob], `avatar-${userId}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("avatar", standardCleanFile);

      // Trigger your media backend file storage row save process
      const result = await uploadUserProfilePictureAction(formData);

      if (result && result.success) {
        alert("Your profile picture has been transformed and updated successfully! 🌸");
        window.location.reload(); // Flush page caches to pull down newly painted avatar
      } else {
        alert(`Upload error: ${result?.error || "Failed to update profile pic."}`);
      }
    } catch (err) {
      console.error("Avatar save transaction failure:", err);
      alert("A system pipeline error paused your profile picture update.");
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="relative group">
      {/* 🎯 MAIN INTERACTIVE CLICK CONTAINER */}
      <div 
        onClick={handleAvatarContainerClick}
        className={`rounded-full overflow-hidden shadow-sm relative bg-gray-100 flex items-center justify-center select-none ${sizeClass} ${
          isEditable ? "cursor-pointer border-2 border-rose-400/80 hover:border-rose-500 hover:scale-[1.02] transition duration-300" : "border border-gray-100"
        }`}
      >
        {isUploading ? (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase text-rose-500 animate-pulse">Saving...</span>
          </div>
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" draggable="false" />
        ) : (
          <div className="w-full h-full bg-rose-500 text-white flex items-center justify-center font-black uppercase text-2xl shadow-inner">
            {displayName.charAt(0)}
          </div>
        )}

        {/* 📸 HOVER OVERLAY GLOW FOR OWNERS */}
        {isEditable && !isUploading && (
          <div className="absolute inset-0 bg-gray-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition duration-300">
            <span className="text-xl">📸</span>
            <span className="text-[8px] font-black text-white uppercase tracking-widest mt-0.5 whitespace-nowrap">Edit Avatar</span>
          </div>
        )}
      </div>

      {/* HIDDEN FILE TYPE INPUT SELECTOR GATES */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 🛠️ MOUNT THE AVATAR STUDIO MODAL OVERLAY ON DETECT */}
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
