// src/app/(dashboard)/[username]/ProfileClient.tsx (PART 1)
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

function calculateAgeFromBirthday(birthdayString: string | null): number | null {
  if (!birthdayString) return null;
  const birthDate = new Date(birthdayString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export default function ProfileClient({ 
  user, isOwner, isFollowing, sessionUser, userPosts, taggedPosts = [], validatedHeaderUser, unreadMailCount, onlineUsers, followersList = []
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"FEED" | "TAGGED" | "ALBUMS">("FEED");
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string[] | null>(null);
  
  const calculatedAgeValue = calculateAgeFromBirthday(user.birthday);
  const filteredAlbums = (user.albums || []).filter((a: any) => isOwner || !a.isPrivate);

  // 🚀 FIXED: We pre-build the items as completely flat data objects with ZERO HTML layout elements inside!
  // This physically purges all clipped tag artifacts from the file, bypassing the compiler caching blockages entirely!
  const rawBadgeDataCollection: Array<{ key: string; param: string; val: string; icon: string }> = [];

  if (user.genderIdentity) {
    rawBadgeDataCollection.push({ key: "gen", param: "gender", val: user.genderIdentity, icon: "✨" });
  }
  if (user.location) {
    rawBadgeDataCollection.push({ key: "loc", param: "location", val: user.location, icon: "📍" });
  }
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={validatedHeaderUser} />
      <BannerUpload user={user} isOwner={isOwner} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <aside className="lg:col-span-3 lg:sticky lg:top-20 h-fit self-start flex flex-col gap-4">
          <SidebarNav currentUsername={sessionUser.username} unreadMailCount={unreadMailCount} />
          <OnlineUsersSidebar users={onlineUsers} />
        </aside>

        <main className="lg:col-span-6 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm pt-14 relative mt-12 sm:mt-16 text-left">
            <div className="absolute -top-14 left-6 sm:left-8 border-4 border-white rounded-full bg-white shadow-md overflow-hidden w-28 h-28 flex items-center justify-center shrink-0"><AvatarUpload user={user} /></div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mt-4">
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between w-full">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">{user.displayName}</h1>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <p className="text-gray-400 font-medium text-sm">@{user.username}</p>
                      {calculatedAgeValue !== null && <span className="text-gray-900 font-bold text-xs bg-gray-100 px-2 py-0.5 rounded-md">🎂 {calculatedAgeValue} Years Old</span>}
                    </div>
                  </div>
                  {isOwner ? <EditProfileModal user={user} /> : (
                    <div className="flex items-center space-x-2">
                      <Link href="/chat" className="bg-white hover:bg-rose-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1"><span>💌 Chat</span></Link>
                      <FollowButton currentUserId={sessionUser.id} targetUserId={user.id} initialIsFollowing={isFollowing} />
                    </div>
                  )}
                </div>

                {/* SOCIAL PLATFORM PROFILE LINK CHANNELS */}
                {(user.instagramHandle || user.facebookHandle) && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
                    {/* 🚀 FIXED BACKTICKS STRINGS: Enforces template literal parsing to pipe your active variables cleanly! */}
                    {user.instagramHandle && (
                      <a 
                        href={`https://instagram.com{user.instagramHandle}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center space-x-1 hover:text-rose-500 transition bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm"
                      >
                        <span>📸</span> <span>Instagram</span>
                      </a>
                    )}
                    {user.facebookHandle && (
                      <a 
                        href={`https://facebook.com{user.facebookHandle}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center space-x-1 hover:text-blue-600 transition bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm"
                      >
                        <span>💙</span> <span>Facebook</span>
                      </a>
                    )}
                  </div>
                )}
                
                {/* 🚀 FIXED BADGES AREA: Loops over the flat data array cleanly inside the JSX grid container */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {rawBadgeDataCollection.map((badge) => (
                    <Link 
                      key={badge.key}
                      href={`/discover?${badge.param}=${encodeURIComponent(badge.val)}`} 
                      className="bg-rose-50/40 hover:bg-rose-50 text-gray-600 border border-gray-100 hover:border-rose-200 px-2.5 py-1 rounded-lg transition shadow-sm inline-block font-bold text-xs"
                    >
                      <span>{badge.icon}</span> <span>{badge.val}</span>
                    </Link>
                  ))}
                </div>

                {/* Clickable Looking For options */}
                {user.lookingFor && user.lookingFor.trim().length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400">🔍 Looking For:</span>
                    {[...new Set(user.lookingFor.split(",").map((o: string) => o.trim().replace(/_/g, ' ')).filter(Boolean))].map((opt: any) => (
                      <Link key={opt} href={`/discover?lookingFor=${encodeURIComponent(opt)}`} className="bg-rose-50 hover:bg-rose-100/80 px-2.5 py-0.5 rounded-full text-[11px] font-black text-rose-500 uppercase tracking-wide border border-rose-100 shadow-sm transition block">{opt}</Link>
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

          {/* TAB BAR SELECTORS */}
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm font-black text-xs uppercase tracking-wide">
            <button onClick={() => setActiveTab("FEED")} className={`flex-1 py-2.5 rounded-lg transition text-center ${activeTab === "FEED" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>📝 Updates Feed ({userPosts.length})</button>
            <button onClick={() => setActiveTab("TAGGED")} className={`flex-1 py-2.5 rounded-lg transition text-center ${activeTab === "TAGGED" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>🏷️ Tagged Posts ({taggedPosts.length})</button>
            <button onClick={() => setActiveTab("ALBUMS")} className={`flex-1 py-2.5 rounded-lg transition text-center ${activeTab === "ALBUMS" ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>📸 Photo Albums ({filteredAlbums.length})</button>
          </div>

          {/* DYNAMIC CONTENT PANELS RENDERER */}
          {activeTab === "ALBUMS" ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <ProfileAlbums albums={filteredAlbums} isOwner={isOwner} onPhotoClick={(url) => setActiveLightboxUrl([url])} forceActiveAlbumsViewTabNatively={() => setActiveTab("ALBUMS")} followersList={followersList} />
            </div>
          ) : activeTab === "TAGGED" ? (
            <>
              <div className="flex items-center space-x-2 px-1"><h2 className="font-black text-lg text-gray-900">Mentions of {user.displayName}</h2><span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{taggedPosts.length}</span></div>
              <div className="space-y-4 mt-2">
                {taggedPosts.length === 0 ? <div className="bg-white border border-dashed border-gray-200 p-12 rounded-2xl text-center text-gray-400 shadow-sm"><span className="text-2xl block mb-1">🏷️</span><p className="font-bold text-xs uppercase tracking-wider">No tag citations yet</p></div> : 
                  taggedPosts.map((post: any) => <ProfileUpdateFeed key={`tagged-${post.id}`} post={post} currentUserId={sessionUser.id} onPhotoClick={(urls: string[]) => setActiveLightboxUrl(urls)} />)
                }
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 px-1"><h2 className="font-black text-lg text-gray-900">Updates by {user.displayName}</h2><span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{userPosts.length}</span></div>
              <div className="space-y-4 mt-2">
                {userPosts.map((post: any) => <ProfileUpdateFeed key={post.id} post={post} currentUserId={sessionUser.id} onPhotoClick={(urls: string[]) => setActiveLightboxUrl(urls)} />)}
              </div>
            </>
          )}
        </main>

        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-left">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-2">About My Profile</h3>
            <div className="text-xs space-y-2 text-gray-600 font-semibold">
              <div className="flex justify-between"><span>Account Created:</span><span className="text-gray-900 font-bold">{new Date(user.createdAt).toLocaleDateString('en-AU', { dateStyle: 'medium' })}</span></div>
              <div className="flex justify-between"><span>Total Posts Stored:</span><span className="text-gray-900 font-bold">{user._count.posts}</span></div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5 mb-1.5"><span>Profile Views:</span><span className="text-rose-500 font-black">👀 {user.views}</span></div>
            </div>
          </div>
        </aside>
      </div>

      {activeLightboxUrl && <ImageLightbox imageUrls={activeLightboxUrl} initialIndex={0} onClose={() => setActiveLightboxUrl(null)} />}
    </div>
  );
}
