// src/components/FollowButton.tsx
"use client";

import { useState } from "react";
import { toggleFollow } from "@/app/actions/follow";

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ currentUserId, targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);

  const handleFollowClick = async () => {
    setIsPending(true);
    // Optimistic UI toggle: Change state instantly for premium responsive feel
    setIsFollowing(!isFollowing);

    await toggleFollow(currentUserId, targetUserId);
    setIsPending(false);
  };

  return (
    <button
      onClick={handleFollowClick}
      disabled={isPending}
      className={`px-5 py-2 rounded-xl text-xs font-black shadow-sm transition tracking-wide uppercase ${
        isFollowing
          ? "bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 border border-gray-200"
          : "bg-rose-500 hover:bg-rose-600 text-white"
      }`}
    >
      {isFollowing ? "✓ Following" : "➕ Follow"}
    </button>
  );
}
