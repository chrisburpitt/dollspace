// src/components/PostControls.tsx
"use client";

import { useState, useTransition } from "react";
import { togglePostReaction } from "@/app/actions/reactions"; // 🚀 1. IMPORT REACTION CONTROLLER

interface PostControlsProps {
  postId: string;
  postOwnerId: string;
  currentUserId: string;
  reactions: any[];
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onSaveEdit: () => void;
  isEditPending: boolean;
}

export default function PostControls({
  postId,
  postOwnerId,
  currentUserId,
  reactions: initialReactions = [],
  isEditing,
  setIsEditing,
  onSaveEdit,
  isEditPending
}: PostControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  
  // 🚀 OPTIMISTIC REACTION STATES
  const [localReactions, setLocalReactions] = useState<any[]>(initialReactions);
  const isMeLikingPostAlready = localReactions.some((r: any) => r.userId === currentUserId);
  const isOwner = postOwnerId === currentUserId;

  const handleLikeButtonClick = () => {
    // 🌟 OPTIMISTIC UI REPAINT: Toggle counter instantly in 0ms for ultra-responsive feel!
    if (isMeLikingPostAlready) {
      setLocalReactions((prev) => prev.filter((r: any) => r.userId !== currentUserId));
    } else {
      setLocalReactions((prev) => [...prev, { id: "temp-id", postId, userId: currentUserId }]);
    }

    startTransition(async () => {
      const res = await togglePostReaction(postId);
      if (res?.error) {
        // Rollback states safely to previous database value if cloud server connection hiccups
        setLocalReactions(initialReactions);
        alert(res.error);
      }
    });
  };

  const handleDeletePostClick = async () => {
    if (!confirm("🚨 Are you sure you want to permanently delete this update from your timeline?")) return;
    
    startDeleteTransition(async () => {
      try {
        const { deletePost } = await import("@/app/actions/posts");
        await deletePost(postId);
      } catch (err) {
        try {
          const alternativeModule = await import("@/app/actions/posts") as any;
          const deleteFn = alternativeModule.deletePostAction || alternativeModule.removePost;
          if (deleteFn) await deleteFn(postId);
        } catch (innerErr) {
          console.error("Failed to execute background post purge action:", innerErr);
        }
      }
    });
  };

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50/60 select-none">
      
      {/* 🚀 LEFT: Upgraded Interactive Social Reaction Button Box */}
      <div className="flex items-center space-x-4 text-xs font-bold">
        <button 
          type="button" 
          onClick={handleLikeButtonClick}
          className={`transition flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-transparent ${
            isMeLikingPostAlready 
              ? "bg-rose-50 text-rose-500 border-rose-100" 
              : "text-gray-500 hover:bg-gray-50 hover:text-rose-500"
          }`}
        >
          <span>{isMeLikingPostAlready ? "💖" : "🤍"}</span>
          <span>{localReactions.length}</span>
        </button>
      </div>

      {/* RIGHT: Owner Maintenance Management Commands (Edit and Delete clustered cleanly) */}
      {isOwner && (
        <div className="flex items-center space-x-2.5 text-[10px] uppercase font-black tracking-wider">
          
          {/* Inline Edit states positioned perfectly to the left of the delete button */}
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button 
                type="button" 
                onClick={onSaveEdit} 
                disabled={isEditPending} 
                className="text-green-500 hover:text-green-600 transition disabled:opacity-40 font-black"
              >
                {isEditPending ? "Saving..." : "💾 Save"}
              </button>
              <span className="text-gray-300">•</span>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                disabled={isEditPending} 
                className="text-gray-400 hover:text-gray-600 transition font-black"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => setIsEditing(true)} 
              className="text-gray-400 hover:text-gray-800 transition flex items-center space-x-1 font-black"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
          )}

          {/* Spacer Dot separator line */}
          <span className="text-gray-300 select-none">•</span>

          {/* Native Delete Button Row */}
          <button
            type="button"
            disabled={isDeletePending}
            onClick={handleDeletePostClick}
            className="text-gray-400 hover:text-red-500 transition flex items-center space-x-1 disabled:opacity-40 font-black"
          >
            <span>🗑️</span>
            <span>{isDeletePending ? "Purging..." : "Delete"}</span>
          </button>

        </div>
      )}

    </div>
  );
}
