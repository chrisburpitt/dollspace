// src/components/PostCard.tsx
"use client";

import Link from "next/link";
import PostControls from "./PostControls";
import PostComments from "./PostComments";

interface PostCardProps {
  post: any;
  currentUserId: string;
  onPhotoClick: (urls: string[], index: number) => void;
}

export default function PostCard({ post, currentUserId, onPhotoClick }: PostCardProps) {
  const domainName = post.linkUrl ? new URL(post.linkUrl).hostname.toLowerCase() : "";
  
  // Smart Brand-Aware Icon Lookup Map for external links
  let customSocialBrandIcon = null;
  if (domainName.includes("instagram.com")) customSocialBrandIcon = "📸";
  if (domainName.includes("facebook.com")) customSocialBrandIcon = "💙";
  if (domainName.includes("tiktok.com")) customSocialBrandIcon = "🎵";
  if (domainName.includes("youtube.com") || domainName.includes("youtu.be")) customSocialBrandIcon = "📺";
  if (domainName.includes("twitter.com") || domainName.includes("x.com")) customSocialBrandIcon = "🐦";
  if (domainName.includes("pinterest.com")) customSocialBrandIcon = "📌";

  // Gather up to 3 image asset links cleanly
  const combinedImages: string[] = post.images?.map((img: any) => img.url) || [];

  return (
    <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm text-left animate-fade-in select-none">
      
      {/* 👤 ACCURATE POST AUTHOR HEADER CARD */}
      <div className="flex items-center space-x-3 mb-4">
        <Link href={`/${post.user.username}`} className="shrink-0">
          {post.user.avatarUrl ? (
            <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
          ) : (
            <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-sm">
              {post.user.displayName.charAt(0)}
            </div>
          )}
        </Link>
        <div>
          <Link href={`/${post.user.username}`} className="font-bold text-gray-900 block text-sm leading-tight hover:underline">
            {post.user.displayName}
          </Link>
          <span className="text-gray-400 text-xs">@{post.user.username}</span>
        </div>
      </div>

      {/* 📝 POST TEXT CONTENT VIEW */}
      {post.content && <p className="text-gray-800 text-base mb-4 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>}

      {/* 🖼️ UNIFIED MULTI-IMAGE GRID GALLERY WITH ANTI-THEFT PROTECTION SHIELDS */}
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
              {/* Invisible right-click overlay protect panel */}
              <div className="absolute inset-0 bg-transparent z-10" onContextMenu={(e) => e.preventDefault()} />
            </div>
          ))}
        </div>
      )}

      {/* 🔗 EMBEDDED DYNAMIC HYPERLINK RICH PREVIEW CARD */}
      {post.linkUrl && (
        <a 
          href={post.linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mb-4 rounded-2xl border border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row overflow-hidden hover:bg-gray-50/80 transition block shadow-sm"
        >
          <div className="w-full sm:w-28 h-28 sm:h-auto bg-white relative shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200/60 flex items-center justify-center p-2">
            {customSocialBrandIcon ? (
              <div className="w-full h-full bg-rose-50/60 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-rose-100/50">
                {customSocialBrandIcon}
              </div>
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
            <span className="text-[10px] uppercase font-black text-rose-400 tracking-widest block mb-0.5">
              {customSocialBrandIcon ? `✨ ${domainName.includes("instagram") ? "Instagram" : "Social"} Link` : "🔗 External Link"}
            </span>
            <h4 className="font-black text-xs text-gray-900 block truncate leading-snug">
              {customSocialBrandIcon && domainName.includes("instagram.com") && post.content.includes("instagram.com")
                ? `View Instagram Profile` 
                : post.linkTitle || post.linkUrl}
            </h4>
            <p className="text-gray-400 font-medium text-[11px] mt-0.5 line-clamp-1 leading-relaxed">
              {customSocialBrandIcon && domainName.includes("instagram.com")
                ? "Follow this user link straight over into the Instagram application."
                : post.linkDesc || "Click to open external web link safely inside a new tab space."}
            </p>
            <span className="text-[10px] text-gray-400 font-bold block mt-1 truncate">{domainName.replace("www.", "")}</span>
          </div>
        </a>
      )}

      {/* 🟢 INTERACTION CONTROLS PANELS */}
      <PostControls postId={post.id} postOwnerId={post.userId} currentUserId={currentUserId} reactions={post.reactions} />
      <PostComments postId={post.id} currentUserId={currentUserId} comments={post.comments} />
    </div>
  );
}
