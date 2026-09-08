// src/app/[username]/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";
import PostControls from "@/components/PostControls";
import { getCurrentUser } from "@/app/actions/auth"; // 👈 1. IMPORT THE AUTH HELPER
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader"; 

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // 2. FETCH THE VISITOR'S SECURE SESSION INFO
  const sessionUser = await getCurrentUser();

  const user = await prisma.user.findUnique({
    where: { username },
    include: { _count: { select: { followers: true, following: true } } }
  });

  if (!user) notFound();

  const userPosts = await prisma.post.findMany({
    where: { userId: user.id },
    include: { user: true, reactions: true },
    orderBy: { createdAt: "desc" }
  });

  // Dynamic boolean check: Is the profile being viewed owned by the logged-in visitor?
  const isOwner = sessionUser ? user.id === sessionUser.id : false;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* 🚀 DROP IN THE INTERACTIVE STATUS HEADER TO MATCH HOMEPAGE */}
      <GlobalHeader currentUser={sessionUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Sidebar Navigation Links */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 text-gray-600 hover:bg-rose-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition">
                🏠 Home Feed
              </Link>
              
              {/* 🚀 FIXED DYNAMIC LINK HERE: No more hardcoded strings! */}
              <Link 
                href={sessionUser ? `/${sessionUser.username}` : "/login"} 
                className={`px-4 py-2.5 font-bold rounded-xl text-sm transition ${
                  isOwner ? "bg-rose-50 text-rose-500" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                👤 My Profile
              </Link>
              
              <Link href="/chat" className="px-4 py-2.5 text-gray-600 hover:bg-rose-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
                💬 Live Chatrooms
              </Link>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: Profile Details Deck & Personal Post History (Takes 6 columns) */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* Main Social Profile Banner Identity Deck */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              
              {/* Interactive Client Avatar Uploader */}
              <AvatarUpload user={user} />

              <div className="flex-1 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">{user.displayName}</h1>
                    <p className="text-gray-400 font-medium text-sm">@{user.username}</p>
                  </div>
                  
                  {!isOwner && (
                    <button className="bg-gray-900 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-gray-800 transition shadow-sm">
                      Follow
                    </button>
                  )}
                </div>
                
                <p className="mt-4 text-gray-600 leading-relaxed font-medium">
                  {user.bio || "Welcome to my Dollspace profile layout!"}
                </p>
                
                {/* Visual Stats Counters */}
                <div className="flex justify-center sm:justify-start space-x-6 mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 font-medium">
                  <div><strong className="text-gray-900 font-bold">{user._count.following}</strong> Following</div>
                  <div><strong className="text-gray-900 font-bold">{user._count.followers}</strong> Followers</div>
                </div>
              </div>
            </div>
          </div>

          {/* User's Chronological Post Streams Title heading */}
          <div className="flex items-center space-x-2 px-1">
            <h2 className="font-black text-lg text-gray-900">Updates by {user.displayName}</h2>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {userPosts.length}
            </span>
          </div>

          {/* Timeline Feed Container (Filtered to just this user) */}
          <div className="space-y-4">
            {userPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 font-medium">No updates posted by this profile yet.</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <div key={post.id} className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
                  <div className="flex items-center space-x-3 mb-4">
                    {post.user.avatarUrl ? (
                      <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">{post.user.displayName.charAt(0)}</div>
                    )}
                    <div>
                      <span className="font-bold text-gray-900 block text-sm leading-tight">{post.user.displayName}</span>
                      <span className="text-gray-400 text-xs">@{post.user.username}</span>
                    </div>
                  </div>
                  {post.content && <p className="text-gray-800 text-base whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>}
                  
                  {post.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 max-h-[450px] bg-gray-50 mt-2 mb-2">
                      <img src={post.imageUrl} alt="Attached post content" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Interactive reaction & deletion controls */}
                  <PostControls 
                    postId={post.id}
                    postOwnerId={post.userId}
                    currentUserId="cl-user-id-123" // Fallback current string or inject dynamically matching currentUser
                    reactions={post.reactions}
                  />
                </div>
              ))
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: Profile Insights Sidebar (Takes 3 columns) */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-2">Profile Metrics</h3>
            <div className="text-xs space-y-2 text-gray-600 font-semibold">
              <div className="flex justify-between">
                <span>Account Created:</span>
                <span className="text-gray-900 font-bold">
                  {new Date(user.createdAt).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Posts Stored:</span>
                <span className="text-gray-900 font-bold">{userPosts.length}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
