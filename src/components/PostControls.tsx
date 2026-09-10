// src/components/PostControls.tsx
"use client";

import { useState, useTransition } from "react";
import { deletePost, toggleReaction } from "@/app/actions/posts";

interface PostControlsProps {
  postId: string;
  postOwnerId: string;
  currentUserId: string;
  reactions: any[];
}

export default function PostControls({ postId, postOwnerId, currentUserId, reactions }: PostControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [localReactions, setLocalReactions] = useState(reactions);
  
  const hasLiked = localReactions.some((r) => r.userId === currentUserId);
  const isOwner = postOwnerId === currentUserId;

  const handleLikeToggle = () => {
    // Optimistic fast UI flip
    if (hasLiked) {
      setLocalReactions((prev) => prev.filter((r) => r.userId !== currentUserId));
    } else {
      setLocalReactions((prev) => [...prev, { postId, userId: currentUserId }]);
    }

    startTransition(async () => {
      // 🚀 FIXED: Fires with exactly 1 single argument to match updated typesafe server actions
      await toggleReaction(postId); 
    });
  };

  const handleDeleteClick = () => {
    if (!confirm("🌸 Are you sure you want to permanently delete this update post?")) return;
    startTransition(async () => {
      await deletePost(postId);
    });
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4 text-xs font-bold text-gray-500">
      <button 
        onClick={handleLikeToggle}
        disabled={isPending}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition ${
          hasLiked ? "bg-rose-50 text-rose-500" : "hover:bg-gray-50 text-gray-600"
        }`}
      >
        <span>{hasLiked ? "❤️" : "🤍"}</span>
        <span>{localReactions.length} Likes</span>
      </button>

      {isOwner && (
        <button 
          onClick={handleDeleteClick}
          disabled={isPending}
          className="text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 transition"
        >
          🗑️ Delete Update
        </button>
      )}
    </div>
  );
}
