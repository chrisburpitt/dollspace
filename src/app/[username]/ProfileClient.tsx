// src/app/[username]/ProfileClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";
import BannerUpload from "@/components/BannerUpload";
import PostControls from "@/components/PostControls";
import EditProfileModal from "@/components/EditProfileModal";
import GlobalHeader from "@/components/GlobalHeader";
import FollowButton from "@/components/FollowButton";
import PostComments from "@/components/PostComments";
import ImageLightbox from "@/components/ImageLightbox";
import ProfileAlbums from "@/components/ProfileAlbums";

interface ProfileClientProps {
  user: any;
  isOwner: boolean;
  isFollowing: boolean;
  sessionUser: any;
  userPosts: any[];
  validatedHeaderUser: any;
}

export default function ProfileClient({ 
  user, 
  isOwner, 
  isFollowing, 
  sessionUser, 
  userPosts, 
  validatedHeaderUser 
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"FEED" | "ALBUMS">("FEED");
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string[] | null>(null);

  const filteredAlbums = (user.albums || []).filter((album: any) => {
    if (isOwner) return true;
    return !album.isPrivate;
  });
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={validatedHeaderUser} />

      <BannerUpload user={user} isOwner={isOwner} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Sidebar Navigation Panel */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 h-fit self-start">
//          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition">
                🏠 Home Feed
              </Link>
              <Link 
                href={`/${sessionUser.username}`} 
                className={`px-4 py-2.5 font-bold rounded-xl text-sm transition ${
                  isOwner ? "bg-rose-50 text-rose-500" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                👤 My Profile
              </Link>
              <Link href="/chat" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
                <span>💬 Chat Lounge</span>
              </Link>
              <Link href="/mail" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
                  <span>💌 Mailbox</span>
              </Link>
			  <Link href="/discover" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
			  <span>🔍 Find Friends</span>
              </Link>
            </nav>
//          </div>
        </aside>

        {/* src/app/[username]/ProfileClient.tsx (PART 2 - FIXED CAROUSEL HOOK TYPING) */}
        {/* CENTER COLUMN: Interactive Switch Feed Renders */}
        <main className="lg:col-span-6 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm pt-14 relative mt-12 sm:mt-16">
            <div className="absolute -top-14 left-6 sm:left-8 border-4 border-white rounded-full bg-white shadow-md overflow-hidden w-28 h-28 flex items-center justify-center shrink-0 select-none z-20">
              <AvatarUpload user={user} />
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left mt-4">
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between w-full">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">{user.displayName}</h1>
                    <p className="text-gray-400 font-medium text-sm">@{user.username}</p>
                  </div>
                  
                  {isOwner ? (
                    <EditProfileModal user={user} />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Link
                        href="/chat"
                        className="bg-white hover:bg-rose-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1"
                      >
                        <span>💌 Chat</span>
                      </Link>
                      <FollowButton 
                        currentUserId={sessionUser.id} 
                        targetUserId={user.id} 
                        initialIsFollowing={isFollowing} 
                      />
                    </div>
                  )}
                </div>
                
                {/* Biographical Badges */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  {user.age && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">🎂 {user.age} Years Old</span>}
                  {user.genderIdentity && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">⚧️ {user.genderIdentity}</span>}
                  {user.location && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">📍 {user.location}</span>}
                </div>

                {/* Deduplicated Trait Badges */}
                {user.lookingFor && user.lookingFor.trim().length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400">🔍 Looking For:</span>
                    {[...new Set(
                      user.lookingFor
                        .split(",")
                        .map((option: string) => option.trim().replace(/_/g, ' '))
                        .filter(Boolean)
                    )].map((optionLabel: any) => (
                      <span 
                        key={optionLabel} 
                        className="bg-rose-50 px-2.5 py-0.5 rounded-full text-[11px] font-black text-rose-500 uppercase tracking-wide border border-rose-100 shadow-sm"
                      >
                        {optionLabel}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-gray-600 leading-relaxed font-medium">
                  {user.bio || "Welcome to my Dollspace profile layout!"}
                </p>
                
                <div className="flex justify-center sm:justify-start space-x-6 mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 font-medium">
                  <div><strong className="text-gray-900 font-bold">{user._count.following}</strong> Following</div>
                  <div><strong className="text-gray-900 font-bold">{user._count.followers}</strong> Followers</div>
                </div>
              </div>
            </div>
          </div>

          {/* PREMIUM TAB SELECTION SLIDER BAR */}
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm font-black text-xs uppercase tracking-wide">
            <button 
              onClick={() => setActiveTab("FEED")}
              className={`flex-1 py-2.5 rounded-lg transition text-center ${activeTab === "FEED" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              📝 Updates Feed ({userPosts.length})
            </button>
            <button 
              onClick={() => setActiveTab("ALBUMS")}
              className={`flex-1 py-2.5 rounded-lg transition text-center ${activeTab === "ALBUMS" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              📸 Photo Albums ({filteredAlbums.length})
            </button>
          </div>

          {/* CONDITIONAL TAB SWITCH ROUTER */}
          {activeTab === "ALBUMS" ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <ProfileAlbums 
                albums={filteredAlbums} 
                isOwner={isOwner} 
                onPhotoClick={(url) => setActiveLightboxUrl([url])} // 🚀 FIXED: Assigns array parameter safely
              />
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2 px-1">
                <h2 className="font-black text-lg text-gray-900">Updates by {user.displayName}</h2>
                <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{userPosts.length}</span>
              </div>

              {/* Timeline Updates Stream Container List */}
              <div className="space-y-4 mt-2">
                {userPosts.map((post: any) => (
                  <div key={post.id} className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      {post.user.avatarUrl ? (
                        <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">{post.user.displayName.charAt(0)}</div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block text-sm leading-tight">{post.user.displayName}</span>
                        <span className="text-gray-400 text-xs">@{post.user.username}</span>
                      </div>
                    </div>
                    {post.content && <p className="text-gray-800 text-base mb-4">{post.content}</p>}
                    
                    {post.imageUrl && (
                      <div 
                        onClick={() => setActiveLightboxUrl([post.imageUrl])} // 🚀 FIXED: Assigns array parameter safely
                        className="rounded-xl overflow-hidden border border-gray-200 max-h-[450px] bg-gray-50 mt-2 mb-4 cursor-zoom-in group flex items-center justify-center relative hover:opacity-95 transition"
                      >
                        <img src={post.imageUrl} alt="" className="w-full h-full max-h-[450px] object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                        <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-lg tracking-wider opacity-0 group-hover:opacity-100 transition duration-200 uppercase">
                          🔍 Zoom Photo
                        </span>
                      </div>
                    )}

                    <PostControls postId={post.id} postOwnerId={post.userId} currentUserId={sessionUser.id} reactions={post.reactions} />
                    
                    <PostComments 
                      postId={post.id}
                      currentUserId={sessionUser.id}
                      comments={post.comments}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        {/* RIGHT COLUMN: Profile Insights Sidebar */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-2">Profile Metrics</h3>
            <div className="text-xs space-y-2 text-gray-600 font-semibold">
              <div className="flex justify-between border-b border-gray-50 pb-1.5 mb-1.5">
                <span>Profile Views:</span>
                <span className="text-rose-500 font-black">👀 {user.views}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Created:</span>
                <span className="text-gray-900 font-bold">{new Date(user.createdAt).toLocaleDateString('en-AU', { dateStyle: 'medium' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Posts Stored:</span>
                <span className="text-gray-900 font-bold">{userPosts.length}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Full-screen Lightbox Portal Media Preview Overlay */}
      {activeLightboxUrl && (
        <ImageLightbox 
          imageUrls={activeLightboxUrl} 
          initialIndex={0}
          onClose={() => setActiveLightboxUrl(null)} 
        />
      )}
    </div>
  );
}