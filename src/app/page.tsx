// src/app/page.tsx
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FeedForm from "@/components/FeedForm";
import PostControls from "@/components/PostControls";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";
import GlobalHeader from "@/components/GlobalHeader";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Home Feed | Dollspace",
  description: "See the latest updates from the DOLLS on Dollspace",
};

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // 1. FETCH ALL POST UPDATE STREAMS
  const feedPosts = await prisma.post.findMany({
    include: { 
      user: true,
      reactions: true 
    },
    orderBy: { createdAt: "desc" }
  });

  // 🚀 2. INJECT THE USER COUNT AGGREGATION LOOK-UP HERE
  const totalUserCount = await prisma.user.count();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={currentUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile Sidebar Navigation Layout */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-rose-500 shadow-sm" />
            ) : (
              <div className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-2xl uppercase shadow-sm">
                {currentUser.displayName.charAt(0)}
              </div>
            )}
            <h2 className="mt-4 font-black text-lg text-gray-900 leading-tight">{currentUser.displayName}</h2>
            <p className="text-gray-400 text-sm">@{currentUser.username}</p>
            <p className="mt-3 text-gray-600 text-sm line-clamp-2">{currentUser.bio || "No bio added yet."}</p>
            
            <Link 
              href={`/${currentUser.username}`} 
              className="mt-5 w-full bg-rose-500 text-white py-2 rounded-xl text-sm font-bold text-center hover:bg-rose-600 transition shadow-sm"
            >
              View Full Profile
            </Link>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hidden lg:block">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 bg-rose-50 text-rose-500 font-bold rounded-xl text-sm transition">
                🏠 Home Feed
              </Link>
              <Link href={`/${currentUser.username}`} className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition">
                👤 My Profile
              </Link>
              <Link href="/chat" className="px-4 py-2.5 text-gray-600 hover:bg-rose-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
                <span>💬 Live Chatroom</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: Main Dynamic Feed Layout Stream */}
        <main className="lg:col-span-6 space-y-6">
          <FeedForm currentUser={currentUser} />

          <div className="space-y-4">
            {feedPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 font-medium">No updates posted yet.</p>
                <p className="text-gray-400 text-xs mt-1">Write your very first post above!</p>
              </div>
            ) : (
              feedPosts.map((post) => (
                <div key={post.id} className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
                  <div className="flex items-center space-x-3 mb-4">
                    {post.user.avatarUrl ? (
                      <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">{post.user.displayName.charAt(0)}</div>
                    )}
                    <div>
                      <Link href={`/${post.user.username}`} className="font-bold text-gray-900 hover:underline block text-sm leading-tight">{post.user.displayName}</Link>
                      <span className="text-gray-400 text-xs">@{post.user.username}</span>
                    </div>
                  </div>
                  {post.content && <p className="text-gray-800 text-base whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>}
                  
                  {post.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 max-h-[450px] bg-gray-50 mt-2 mb-2">
                      <img src={post.imageUrl} alt="Attached post content" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <PostControls 
                    postId={post.id}
                    postOwnerId={post.userId}
                    currentUserId={currentUser.id}
                    reactions={post.reactions}
                  />
                </div>
              ))
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: Insight Sidebar Indicators */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-2">Platform Metrics</h3>
            <div className="text-xs space-y-2 text-gray-600 font-semibold">
              
              {/* 🚀 INJECTED: Live User Platform Metric Counter Badge */}
              <div className="flex justify-between border-b border-gray-50 pb-1.5 mb-1.5">
                <span>Registered Users:</span>
                <span className="text-rose-500 font-black">{totalUserCount}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Stream Updates:</span>
                <span className="text-gray-900 font-bold">{feedPosts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Session Entity ID:</span>
                <span className="text-gray-400 font-mono truncate max-w-[120px]">{currentUser.id}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
