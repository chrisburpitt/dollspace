// src/components/FeedStream.tsx (PART 1 - MULTI-IMAGE & RICH LINK PREVIEW EXTENSION)
"use client";

import { useState } from "react";
import Link from "next/link";
import FeedTabs from "./FeedTabs";
import PostControls from "./PostControls";
import PostComments from "./PostComments";
import ImageLightbox from "./ImageLightbox";

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface PostImageItem {
  id: string;
  url: string;
}

interface PostItem {
  id: string;
  content: string;
  userId: string;
  user: UserItem;
  images: PostImageItem[]; // Upgraded to array selection collection
  imageUrl?: string | null; // 🚀 ADDED BACKWARD COMPATIBLE FIELD
  linkUrl: string | null;
  linkTitle: string | null;
  linkDesc: string | null;
  linkImage: string | null;
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
  
  // Carousel State Trackers
  const [lightboxState, setLightboxUrlState] = useState<{ urls: string[]; index: number } | null>(null);

  const displayPosts = activeTab === "global" ? globalPosts : followingPosts;

  // src/components/FeedStream.tsx (PART 2 - MULTI-IMAGE & RICH LINK PREVIEW EXTENSION)
  return (
    <div className="space-y-4">
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {displayPosts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm animate-fade-in">
          <span className="text-3xl block mb-2">🌸</span>
          <p className="text-gray-400 font-bold text-sm">No updates to show here.</p>
        </div>
      ) : (
        displayPosts.map((post) => {
          // 🚀 FIXED: Combines new child relation array paths with your single historical image columns seamlessly!
          const combinedImages = [
            ...(post.images && post.images.length > 0 ? post.images.map(img => img.url) : []),
            ...(post.imageUrl ? [post.imageUrl] : [])
          ];
  
          const hasImages = combinedImages.length > 0;

          return (
            <div 
              key={post.id} 
              id={`post-${post.id}`}
              className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition animate-fade-in text-left scroll-mt-20"
            >
              {/* Creator Card Heading Header Section */}
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
    
             {/* 🚀 UPGRADED MAPPING LAYER: Adaptive responsive grid loops over combined images instantly */}
             {hasImages && (
               <div className={`grid gap-2 mb-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 max-h-[400px] ${
                 combinedImages.length === 2 ? "grid-cols-2" : combinedImages.length >= 3 ? "grid-cols-3" : "grid-cols-1"
               }`}>
                 {combinedImages.map((imgUrl, idx) => (
                   <div 
                     key={`${post.id}-img-${idx}`}
                     onClick={() => setLightboxUrlState({ urls: combinedImages, index: idx })}
                     className="w-full h-full min-h-[220px] max-h-[400px] cursor-zoom-in relative overflow-hidden group flex items-center justify-center"
                   >
                     <img 
                       src={imgUrl} 
                       alt="" 
                       className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.01]" 
                     />
                   </div>
                 ))}
               </div>
            )}

              {/* 🚀 NEW: EMBEDDED DYNAMIC HYPERLINK RICH PREVIEW CARD */}
              {post.linkUrl && (
                (() => {
                  const domainName = new URL(post.linkUrl).hostname.toLowerCase();
                  
                  // 🚀 Smart Brand-Aware Icon Lookup Map
                  let customSocialBrandIcon = null;
                  if (domainName.includes("instagram.com")) customSocialBrandIcon = "📸";
                  if (domainName.includes("facebook.com")) customSocialBrandIcon = "💙";
                  if (domainName.includes("tiktok.com")) customSocialBrandIcon = "🎵";
                  if (domainName.includes("youtube.com") || domainName.includes("youtu.be")) customSocialBrandIcon = "📺";
                  if (domainName.includes("twitter.com") || domainName.includes("x.com")) customSocialBrandIcon = "🐦";
                  if (domainName.includes("pinterest.com")) customSocialBrandIcon = "📌";

                  return (
                    <a 
                      href={post.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mb-4 rounded-2xl border border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row overflow-hidden hover:bg-gray-50/80 transition block shadow-sm select-none"
                    >
                      {/* THUMBNAIL CONTAINER BOX */}
                      <div className="w-full sm:w-28 h-28 sm:h-auto bg-white relative shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200/60 flex items-center justify-center p-2">
                        {customSocialBrandIcon ? (
                          /* 🎯 FIXED: Instagram gets a gorgeous, stylized native fallback icon directly! */
                          <div className="w-full h-full bg-rose-50/60 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-rose-100/50">
                            {customSocialBrandIcon}
                          </div>
                        ) : post.linkImage ? (
                          <img 
                            src={post.linkImage} 
                            alt="" 
                            className="w-full h-full object-contain rounded-lg" 
                            onError={(e) => {
                              // Standardized global web globe fallback icon if hotlinking crashes
                              (e.target as HTMLImageElement).style.display = "none";
                              const fallbackContainer = (e.target as HTMLImageElement).parentElement;
                              if (fallbackContainer) {
                                const labelNode = document.createElement("div");
                                labelNode.className = "w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-xl text-gray-400 font-bold border border-gray-100";
                                labelNode.innerText = "🌐";
                                fallbackContainer.appendChild(labelNode);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-xl text-gray-400 font-bold border border-gray-100">
                            🌐
                          </div>
                        )}
                      </div>

                      {/* CARD DETAILS WRAPPER */}
                      <div className="p-4 flex flex-col justify-center min-w-0 flex-1 text-left">
                        <span className="text-[10px] uppercase font-black text-rose-400 tracking-widest block mb-0.5">
                          {customSocialBrandIcon ? `✨ Instagram Profile` : "🔗 External Link"}
                        </span>
                        <h4 className="font-black text-xs text-gray-900 block truncate leading-snug">
                          {customSocialBrandIcon && domainName.includes("instagram.com")
                            ? `View Instagram Profile` 
                            : post.linkTitle || post.linkUrl}
                        </h4>
                        <p className="text-gray-400 font-medium text-[11px] mt-0.5 line-clamp-1 leading-relaxed">
                          {customSocialBrandIcon && domainName.includes("instagram.com")
                            ? "Follow this user link straight over into the Instagram application."
                            : post.linkDesc || "Click to open external web link safely inside a new tab space."}
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold block mt-1 truncate">
                          {domainName.replace("www.", "")}
                        </span>
                      </div>
                    </a>
                  );
                })()
              )}

              <PostControls postId={post.id} postOwnerId={post.userId} currentUserId={currentUserId} reactions={post.reactions} />
              <PostComments postId={post.id} currentUserId={currentUserId} comments={post.comments} />

            </div>
          );
        })
      )}

      {/* MODAL LIGHTBOX WORKSPACE CAROUSEL */}
      {lightboxState && (
        <ImageLightbox 
          imageUrls={lightboxState.urls}
          initialIndex={lightboxState.index}
          onClose={() => setLightboxUrlState(null)}
        />
      )}
    </div>
  );
}
