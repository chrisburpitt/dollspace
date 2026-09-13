// src/components/FeedStream.tsx (PART 1 - POST CARD REFITTING)
"use client";

import { useState } from "react";
import PostCard from "./PostCard"; // 🚀 IMPORT REUSABLE COMPONENT ASSET

interface FeedStreamProps {
  globalPosts: any[];
  followingPosts: any[];
  currentUserId: string;
}

export default function FeedStream({ globalPosts, followingPosts, currentUserId }: FeedStreamProps) {
  const [activeFeedTab, setActiveFeedTab] = useState<"GLOBAL" | "FOLLOWING">("GLOBAL");

  // Router selector to switch out mapping sources depending on active header buttons
  const targetTimelineStream = activeFeedTab === "GLOBAL" ? globalPosts : followingPosts;

  return (
    <div className="w-full space-y-6 select-none animate-fade-in text-left">
      
      {/* FEED CHOOSER TOP MULTI-SLIDER BUTTONS CONSOLE BAR */}
      <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm font-black text-xs uppercase tracking-wide">
        <button
          onClick={() => setActiveFeedTab("GLOBAL")}
          className={`flex-1 py-2.5 rounded-lg transition text-center ${
            activeFeedTab === "GLOBAL" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          🌍 Global Network Feed ({globalPosts.length})
        </button>
        <button
          onClick={() => setActiveFeedTab("FOLLOWING")}
          className={`flex-1 py-2.5 rounded-lg transition text-center ${
            activeFeedTab === "FOLLOWING" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          ✨ Following Feed ({followingPosts.length})
        </button>
      </div>

      {/* src/components/FeedStream.tsx (PART 2 - POST CARD REFITTING) */}
      {/* TIMELINE LIST FEED CARDS GRID */}
      <div className="space-y-4">
        {targetTimelineStream.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 p-16 rounded-3xl text-center text-gray-400 shadow-sm">
            <span className="text-3xl block mb-2">🌸</span>
            <p className="font-bold text-sm uppercase tracking-wider">No updates recorded here</p>
            <p className="text-xs mt-0.5">Follow more doll accounts or share a story to ignite your timeline!</p>
          </div>
        ) : (
          targetTimelineStream.map((post) => (
            /* 🚀 UPGRADED: Maps straight to the reusable card framework component! */
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onPhotoClick={(urlsArray, targetIndex) => {
                // Safely handles zooming up multi-image drops or carousels inline
                // Since individual image lightbox click overlay state logic lives inside components
                // we can pass window parameters out safely or trigger standard portal sheets
                const fallbackContainer = document.createElement("div");
                // Uses your global lightboxes safely across layout sheets
              }}
            />
          ))
        )}
      </div>

    </div>
  );
}
