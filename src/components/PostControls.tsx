// src/components/PostControls.tsx
"use client";

import { useState } from "react";
import { deletePost, toggleReaction } from "@/app/actions/posts";

interface PostControlsProps {
  postId: string;
  postOwnerId: string;
  currentUserId: string;
  reactions: Array<{ emoji: string; userId: string }>;
}

// Let's define an array of default fun reaction selections you can pick from
const REACTION_OPTIONS = ["❤️", "🔥", "✨", "🎀", "👑", "👀"];

export default function PostControls({ postId, postOwnerId, currentUserId, reactions }: PostControlsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const isOwner = postOwnerId === currentUserId;

  // Group reactions together by emoji count for the badge indicators
  const reactionCounts = reactions.reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
      {/* 1. Active Rendered Reaction Badges */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(reactionCounts).map(([emoji, count]) => {
          const hasUserReacted = reactions.some(r => r.emoji === emoji && r.userId === currentUserId);
          return (
            <button
              key={emoji}
              onClick={() => toggleReaction(postId, currentUserId, emoji)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition border ${
                hasUserReacted 
                  ? "bg-blue-50 border-blue-200 text-blue-600" 
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Interactive Action Trigger Menus */}
      <div className="flex items-center space-x-4 relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-gray-500 hover:text-blue-600 font-semibold text-xs transition flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"
        >
          <span>➕ React</span>
        </button>

        {/* Custom Popover Emoji Overlay */}
        {showPicker && (
          <div className="absolute left-0 bottom-9 bg-white border border-gray-200 p-2 rounded-xl shadow-lg flex items-center gap-1 z-10 animate-fade-in">
            {REACTION_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  toggleReaction(postId, currentUserId, emoji);
                  setShowPicker(false);
                }}
                className="hover:scale-125 transition text-base p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Delete Control Access - only render if current visitor owns the update row */}
        {isOwner && (
          <button
            onClick={async () => {
              if (confirm("Are you sure you want to delete this update?")) {
                await deletePost(postId, currentUserId);
              }
            }}
            className="text-red-500 hover:text-red-600 font-bold text-xs transition ml-auto bg-red-50 px-3 py-1.5 rounded-xl border border-red-100"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}
