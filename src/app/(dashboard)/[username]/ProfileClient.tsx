// src/app/(dashboard)/[username]/ProfileClient.tsx (PART 1 - FIXED CHUNK SPLIT)
"use client";

import { useState } from "react";
import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";
import BannerUpload from "@/components/BannerUpload";
import EditProfileModal from "@/components/EditProfileModal";
import GlobalHeader from "@/components/GlobalHeader";
import FollowButton from "@/components/FollowButton";
import ImageLightbox from "@/components/ImageLightbox";
import ProfileAlbums from "@/components/ProfileAlbums";
import SidebarNav from "@/components/SidebarNav";
import OnlineUsersSidebar from "@/components/OnlineUsersSidebar";
import ProfileUpdateFeed from "@/components/ProfileUpdateFeed";

interface ProfileClientProps {
  user: any;
  isOwner: boolean;
  isFollowing: boolean;
  sessionUser: any;
  userPosts: any[];
  taggedPosts: any[];
  validatedHeaderUser: any;
  unreadMailCount: number;
  onlineUsers: any[];
  followersList?: any[];
}

export default function ProfileClient({ 
  user, 
  isOwner, 
  isFollowing, 
  sessionUser, 
  userPosts, 
  taggedPosts = [], 
  validatedHeaderUser,
  unreadMailCount,
  onlineUsers,
  followersList = []
}: ProfileClientProps) {
  // 🚀 TABS STATE PRESERVATION: Retains the active viewing layout pane correctly across upload refreshes
  const [activeTab, setActiveTab] = useState<"FEED" | "TAGGED" | "ALBUMS">("FEED");
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
        
        {/* LEFT BAR ASPECT COLUMN MODULES */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 h-fit self-start flex flex-col gap-4">
          <SidebarNav currentUsername={sessionUser.username} unreadMailCount={unreadMailCount} />
          <OnlineUsersSidebar users={onlineUsers} />
        </aside>

        {/* src/app/(dashboard)/[username]/ProfileClient.tsx (PART 2 - FIXED CHUNK SPLIT) */}
        {/* CENTER COLUMN: Interactive Switch Feed Renders */}
        <main className="lg:col-span-6 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm pt-14 relative mt-12 sm:mt-16">
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
                      <Link href="/chat" className="bg-white hover:bg-rose-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1">
                        <span>💌 Chat</span>
                      </Link>
                      <FollowButton currentUserId={sessionUser.id} targetUserId={user.id} initialIsFollowing={isFollowing} />
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  {user.age && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">🎂 {user.age} Years Old</span>}
                  {user.genderIdentity && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">⚧️ {user.genderIdentity}</span>}
                  {user.location && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">📍 {user.location}</span>}
                </div>

                {user.lookingFor && user.lookingFor.trim().length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400">🔍 Looking For:</span>
                    {[...new Set(user.lookingFor.split(",").map((option: string) => option.trim().replace(/_/g, ' ')).filter(Boolean))].map((optionLabel: any) => (
                      <span key={optionLabel} className="bg-rose-50 px-2.5 py-0.5 rounded-full text-[11px] font-black text-rose-500 uppercase tracking-wide border border-rose-100 shadow-sm">
                        {optionLabel}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-gray-600 leading-relaxed font-medium">{user.bio || "Welcome to my Dollspace profile layout!"}</p>
                
                <div className="flex justify-center sm:justify-start space-x-6 mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 font-medium">
                  <div><strong className="text-gray-900 font-bold">{user._count.following}</strong> Following</div>
                  <div><strong className="text-gray-900 font-bold">{user._count.followers}</strong> Followers</div>
                </div>
              </div>
            </div>
          </div>

          {/* THREE PIECE TAB SLIDER SELECTION BAR */}
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm font-black text-xs uppercase tracking-wide">
            <button 
              onClick={() => setActiveTab("FEED")}
              className={`flex-1 py-2.5 rounded-lg transition text-center ${activeTab === "FEED" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              📝 Updates Feed ({userPosts.length})
            </button>
            <button 
              onClick={() => setActiveTab("TAGGED")}
              className={`flex-1 py-2.5 rounded-lg transition text-center ${activeTab === "TAGGED" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              🏷️ Tagged Posts ({taggedPosts.length})
            </button>
            <button 
              onClick={() => setActiveTab("ALBUMS")}
              className={`flex-1 py-2.5 rounded-lg transition text-center ${activeTab === "ALBUMS" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              📸 Photo Albums ({filteredAlbums.length})
            </button>
          </div>

          {/* THREE-WAY CONDITIONAL DISPLAY ROUTER PORTALS */}
          {activeTab === "ALBUMS" ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <ProfileAlbums 
                albums={filteredAlbums} 
                isOwner={isOwner} 
                onPhotoClick={(url) => setActiveLightboxUrl([url])} 
                forceActiveAlbumsViewTabNatively={() => setActiveTab("ALBUMS")}
                // 🚀 FIXED: Feeds your permanent network list directly into the photo studio inspector!
                followersList={followersList} 
              />
            </div>
          ) : activeTab === "TAGGED" ? (
            <>
              <div className="flex items-center space-x-2 px-1">
                <h2 className="font-black text-lg text-gray-900">Mentions of {user.displayName}</h2>
                <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{taggedPosts.length}</span>
              </div>
              <div className="space-y-4 mt-2">
                {taggedPosts.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 p-12 rounded-2xl text-center text-gray-400 shadow-sm">
                    <span className="text-2xl block mb-1">🏷️</span>
                    <p className="font-bold text-xs uppercase tracking-wider">No tag citations yet</p>
                  </div>
                ) : (
                  taggedPosts.map((post: any) => (
                    <ProfileUpdateFeed key={`tagged-${post.id}`} post={post} currentUserId={sessionUser.id} onPhotoClick={(urlsArray: string[]) => setActiveLightboxUrl(urlsArray)} />
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 px-1">
                <h2 className="font-black text-lg text-gray-900">Updates by {user.displayName}</h2>
                <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{userPosts.length}</span>
              </div>
              <div className="space-y-4 mt-2">
                {userPosts.map((post: any) => (
                  <ProfileUpdateFeed key={post.id} post={post} currentUserId={sessionUser.id} onPhotoClick={(urlsArray: string[]) => setActiveLightboxUrl(urlsArray)} />
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
              <div className="flex justify-between"><span>Account Created:</span><span className="text-gray-900 font-bold">{new Date(user.createdAt).toLocaleDateString('en-AU', { dateStyle: 'medium' })}</span></div>
              <div className="flex justify-between"><span>Total Posts Stored:</span><span className="text-gray-900 font-bold">{user._count.posts}</span></div>
			  <div className="flex justify-between border-b border-gray-50 pb-1.5 mb-1.5"><span>Profile Views:</span><span className="text-rose-500 font-black">👀 {user.views}</span></div>
            </div>
          </div>
        </aside>
      </div>

      {activeLightboxUrl && (
        <ImageLightbox imageUrls={activeLightboxUrl} initialIndex={0} onClose={() => setActiveLightboxUrl(null)} />
      )}
    </div>
  );
}
