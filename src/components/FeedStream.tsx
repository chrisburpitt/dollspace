// src/components/FeedStream.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import FeedTabs from "./FeedTabs";
import PostControls from "./PostControls";
import PostComments from "./PostComments";
import ImageLightbox from "./ImageLightbox"; // 🚀 IMPORT THE LIGHTBOX

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface PostItem {
  id: string;
  content: string;
  imageUrl: string | null;
  userId: string;
  user: UserItem;
  reactions: any[];
  comments: any[];
}

interface FeedStreamProps {
  globalPosts: PostItem[];
  followingPosts: PostItem[];
  currentUserId: string;
}

export default function FeedStream({ globalPosts, followingPosts, currentUserId }: FeedStreamProps) {
  const [activeTab, setActiveTab] = useState<"global" | "following">("global");
  
  // 🚀 ACTIVE STATE: Tracks which image URL token is currently clicked into full preview overlay modal focus hooks
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  const displayPosts = activeTab === "global" ? globalPosts : followingPosts;

  return (
    <div className="space-y-4">
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {displayPosts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm animate-fade-in">
          <span className="text-3xl block mb-2">🌸</span>
          <p className="text-gray-400 font-bold text-sm">No updates to show here.</p>
          <p className="text-gray-400 text-xs mt-1">
            {activeTab === "following" 
              ? "Follow some other creators to light up this stream!" 
              : "Write your very first post above!"}
          </p>
        </div>
      ) : (
        displayPosts.map((post) => (
          <div 
            key={post.id} 
            id={`post-${post.id}`}
            className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition animate-fade-in text-left scroll-mt-20"
          >
            <div className="flex items-center space-x-3 mb-4">
              {post.user.avatarUrl ? (
                <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
              ) : (
                <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">
                  {post.user.displayName.charAt(0)}
                </div>
              )}
              <div>
                <Link href={`/${post.user.username}`} className="font-bold text-gray-900 hover:underline block text-sm leading-tight">
                  {post.user.displayName}
                </Link>
                <span className="text-gray-400 text-xs">@{post.user.username}</span>
              </div>
            </div>
            
            {post.content && <p className="text-gray-800 text-base whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>}
            
            {/* 🚀 FIXED PHOTO DRAWER CONTAINER: Completely stops cropping, uses max scaling, and adds click triggers */}
            {post.imageUrl && (
              <div 
                onClick={() => setActiveLightboxUrl(post.imageUrl)}
                className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50 mt-2 mb-4 cursor-zoom-in group max-h-[500px] flex items-center justify-center relative hover:opacity-95 transition"
                title="Click to view full image resolution"
              >
                <img 
                  src={post.imageUrl} 
                  alt="Attached post content" 
                  className="w-full max-h-[500px] object-contain transition-transform duration-300 group-hover:scale-[1.01]" 
                />
                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-lg tracking-wider opacity-0 group-hover:opacity-100 transition duration-200 uppercase">
                  🔍 Zoom Photo
                </span>
              </div>
            )}

            <PostControls 
              postId={post.id}
              postOwnerId={post.userId}
              currentUserId={currentUserId}
              reactions={post.reactions}
            />

            <PostComments 
              postId={post.id}
              currentUserId={currentUserId}
              comments={post.comments}
            />
          </div>
        ))
      )}

      {/* 🚀 GLOBAL LAYER PORTAL TRIGGER MODULE MOUNT POINT */}
      {activeLightboxUrl && (
        <ImageLightbox 
          imageUrl={activeLightboxUrl} 
          onClose={() => setActiveLightboxUrl(null)} 
        />
      )}

    </div>
  );
}
