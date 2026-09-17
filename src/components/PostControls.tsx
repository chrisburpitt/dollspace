// src/components/PostControls.tsx
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { togglePostReaction } from "@/app/actions/reactions";

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

const REACTION_EMOJIS = ["❤️", "🔥", "✨", "🎀", "👑", "👀"];

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
  const [showEmojiDock, setShowEmojiDock] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [localReactions, setLocalReactions] = useState<any[]>(initialReactions);
  const myExistingReaction = localReactions.find((r: any) => r.userId === currentUserId);
  const isOwner = postOwnerId === currentUserId;

  // 🚀 MOBILE OUTSIDE CLICK CLOSER: Shuts the emoji dock if a touch user clicks anywhere else
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowEmojiDock(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const aggregatedCounts = localReactions.reduce((acc: Record<string, number>, curr: any) => {
    const key = curr.emoji || "❤️";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const handleSelectReactionEmoji = (chosenEmoji: string) => {
    setShowEmojiDock(false);

    setLocalReactions((prev) => {
      const filtered = prev.filter((r: any) => r.userId !== currentUserId);
      if (myExistingReaction && myExistingReaction.emoji === chosenEmoji) {
        return filtered;
      }
      return [...filtered, { id: "temp-id", postId, userId: currentUserId, emoji: chosenEmoji }];
    });

    startTransition(async () => {
      const res = await togglePostReaction(postId, chosenEmoji);
      if (res?.error) {
        setLocalReactions(initialReactions);
        alert(res.error);
      }
    });
  };

  // 🚀 FIXED TOUCH HANDLER: Mobile taps open the menu first, subsequent clicks send reactions
  const handleMainButtonClick = (e: React.MouseEvent) => {
    // If the emoji dock is closed, open it instead of instantly reacting
    if (!showEmojiDock) {
      e.preventDefault();
      setShowEmojiDock(true);
    } else {
      // If it's already open, submit their current reaction or default heart
      handleSelectReactionEmoji(myExistingReaction?.emoji || "❤️");
    }
  };

  const handleDeletePostClick = async () => {
    if (!confirm("🚨 Are you sure you want to permanently delete this update from your timeline?")) return;
    startDeleteTransition(async () => {
      try {
        const { deletePost } = await import("@/app/actions/posts");
        await deletePost(postId);
      } catch (err) {
        console.error("Deletion failure:", err);
      }
    });
  };

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50/60 relative select-none">
      
      {/* Attached containerRef to handle clicking outside safely */}
      <div 
        ref={containerRef}
        className="flex items-center space-x-2 relative group"
        onMouseEnter={() => setShowEmojiDock(true)}
        onMouseLeave={() => setShowEmojiDock(false)}
      >
        <button
          type="button"
          onClick={handleMainButtonClick} // 🚀 FIXED TRIGGER
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition border shadow-sm ${
            myExistingReaction
              ? "bg-rose-50 text-rose-500 border-rose-100"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span className="text-sm font-medium leading-none font-bold text-gray-500">{myExistingReaction ? "✨" : "+"}</span>
          <span>React</span>
        </button>

        {/* 🚀 EXTRA LAYER TIER (z-50): Ensures overlay stays floating on mobile view grids */}
        {showEmojiDock && (
          <div className="absolute left-0 bottom-0 pb-11 w-64 z-50 cursor-default">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-2.5 flex items-center space-x-3.5 animate-scale-up border-b-2">
              {REACTION_EMOJIS.map((emoji) => {
                const isCurrentSelection = myExistingReaction?.emoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectReactionEmoji(emoji)}
                    className={`text-xl hover:scale-125 active:scale-95 transition duration-150 transform select-none ${
                      isCurrentSelection ? "filter drop-shadow-[0_0_4px_rgba(244,63,94,0.4)] scale-110" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Counters summary display tags row */}
        <div className="flex items-center space-x-1 pl-1">
          {Object.entries(aggregatedCounts).map(([emojiChar, totalValue]) => (
            <button
              key={emojiChar}
              onClick={() => handleSelectReactionEmoji(emojiChar)}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-black border transition ${
                myExistingReaction?.emoji === emojiChar
                  ? "bg-rose-50 border-rose-100 text-rose-600 shadow-sm"
                  : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span>{emojiChar}</span>
              <span>{totalValue}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR ACTIONS BUTTONS PANEL */}
      {isOwner && (
        <div className="flex items-center space-x-2.5 text-[10px] uppercase font-black tracking-wider">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button type="button" onClick={onSaveEdit} disabled={isEditPending} className="text-green-500 hover:text-green-600 transition disabled:opacity-40 font-black">
                {isEditPending ? "Saving..." : "💾 Save"}
              </button>
              <span className="text-gray-300">•</span>
              <button type="button" onClick={() => setIsEditing(false)} disabled={isEditPending} className="text-gray-400 hover:text-gray-600 transition font-black">Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-gray-800 transition flex items-center space-x-1 font-black">
              <span>✏️</span>
              <span>Edit</span>
            </button>
          )}

          <span className="text-gray-300 select-none">•</span>

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
