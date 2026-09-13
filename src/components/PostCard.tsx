// src/components/PostCard.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import PostControls from "./PostControls";
import PostComments from "./PostComments";
import { editPostContent } from "@/app/actions/editPost";

interface PostCardProps {
  post: any;
  currentUserId: string;
  onPhotoClick: (urls: string[], index: number) => void;
  followersList?: Array<{ username: string; displayName: string }>;
}

export default function PostCard({ post, currentUserId, onPhotoClick, followersList = [] }: PostCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || "");
  
  const hasCommentsPresent = post.comments && post.comments.length > 0;

  const domainName = post.linkUrl ? new URL(post.linkUrl).hostname.toLowerCase() : "";
  let customSocialBrandIcon = null;
  if (domainName.includes("instagram.com")) customSocialBrandIcon = "📸";
  if (domainName.includes("facebook.com")) customSocialBrandIcon = "💙";
  if (domainName.includes("tiktok.com")) customSocialBrandIcon = "🎵";
  if (domainName.includes("youtube.com") || domainName.includes("youtu.be")) customSocialBrandIcon = "📺";
  if (domainName.includes("twitter.com") || domainName.includes("x.com")) customSocialBrandIcon = "🐦";
  if (domainName.includes("pinterest.com")) customSocialBrandIcon = "📌";

  const combinedImages: string[] = post.images?.map((img: any) => img.url) || [];

  const handleSaveInlineEdit = () => {
    if (!editText.trim() || editText.trim() === post.content) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const res = await editPostContent(post.id, editText);
      if (res.success) {
        post.content = editText.trim(); // Optimistic repaint
        setIsEditing(false);
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

  return (
    <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm text-left animate-fade-in select-none">
      
      {/* 👤 AUTHOR HEADER PANEL (Cleaned up: Edit button removed from here) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link href={`/${post.user.username}`} className="shrink-0">
            {post.user.avatarUrl ? (
              <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
            ) : (
              <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                {post.user.displayName.charAt(0)}
              </div>
            )}
          </Link>
          <div className="text-left">
            <Link href={`/${post.user.username}`} className="font-bold text-gray-900 block text-sm leading-tight hover:underline">
              {post.user.displayName}
            </Link>
            <span className="text-gray-400 text-xs">@{post.user.username}</span>
          </div>
        </div>
      </div>

      {/* TEXT AREA EDITOR VIEW OR MARKDOWN DISPLAY */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-sm border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:bg-white text-gray-800 font-medium resize-none leading-relaxed"
            rows={3}
            disabled={isPending}
          />
        </div>
      ) : (
        post.content && (
          <p className="text-gray-800 text-base mb-4 font-medium leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )
      )}

      {/* GALLERY IMAGES */}
      {combinedImages.length > 0 && (
        <div className={`grid gap-2 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 mb-4 ${
          combinedImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
        }`}>
          {combinedImages.map((imgUrl, idx) => (
            <div 
              key={`${post.id}-img-${idx}`}
              onClick={() => onPhotoClick(combinedImages, idx)}
              className="w-full h-full min-h-[220px] max-h-[400px] cursor-zoom-in relative overflow-hidden group flex items-center justify-center"
            >
              <img src={imgUrl} alt="" className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.01]" draggable="false" />
              <div className="absolute inset-0 bg-transparent z-10" onContextMenu={(e) => e.preventDefault()} />
            </div>
          ))}
        </div>
      )}

      {/* RICH DYNAMIC LINK PREVIEWS */}
      {post.linkUrl && (
        <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="mb-4 rounded-2xl border border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row overflow-hidden hover:bg-gray-50/80 transition block shadow-sm">
          <div className="w-full sm:w-28 h-28 sm:h-auto bg-white relative shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200/60 flex items-center justify-center p-2">
            {customSocialBrandIcon ? (
              <div className="w-full h-full bg-rose-50/60 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-rose-100/50">{customSocialBrandIcon}</div>
            ) : post.linkImage ? (
              <div className="w-full h-full relative">
                <img src={post.linkImage} alt="" className="w-full h-full object-contain rounded-lg" draggable="false" />
                <div className="absolute inset-0 bg-transparent z-10" onContextMenu={(e) => e.preventDefault()} />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-xl text-gray-400 font-bold border border-gray-100">🌐</div>
            )}
          </div>
          <div className="p-4 flex flex-col justify-center min-w-0 flex-1 text-left">
            <span className="text-[10px] uppercase font-black text-rose-400 tracking-widest block mb-0.5">{customSocialBrandIcon ? `✨ Social Link` : "🔗 External Link"}</span>
            <h4 className="font-black text-xs text-gray-900 block truncate leading-snug">{post.linkTitle || post.linkUrl}</h4>
            <p className="text-gray-400 font-medium text-[11px] mt-0.5 line-clamp-1 leading-relaxed">{post.linkDesc || "Click to open link safely."}</p>
            <span className="text-[10px] text-gray-400 font-bold block mt-1 truncate">{domainName.replace("www.", "")}</span>
          </div>
        </a>
      )}

      {/* 🚀 CONTROLS TOOLBAR: Passing inline editing state control handlers directly to the action bar */}
      <PostControls 
        postId={post.id} 
        postOwnerId={post.userId} 
        currentUserId={currentUserId} 
        reactions={post.reactions}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSaveEdit={handleSaveInlineEdit}
        isEditPending={isPending}
      />
      
      <PostComments 
        postId={post.id} 
        currentUserId={currentUserId} 
        comments={post.comments} 
        initialOpen={hasCommentsPresent} 
      />
    </div>
  );
}
