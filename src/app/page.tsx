// src/app/page.tsx
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FeedForm from "@/components/FeedForm";
import FeedStream from "@/components/FeedStream"; // 👈 IMPORT OUR SPLIT STREAM WRAPPER
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

  // 1. QUERY ALL RELATIONSHIPS: Compile an array list of target IDs this user follows
  const followingRelations = await prisma.follow.findMany({
    where: { followerId: currentUser.id },
    select: { followingId: true }
  });

  const followingIds = followingRelations.map((f) => f.followingId);

  // 2. DATA BLOCK A: Fetch the complete global website post stream
  const globalPosts = await prisma.post.findMany({
    include: { 
      user: true,
      reactions: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. DATA BLOCK B: Fetch ONLY the updates posted by accounts you follow
  const followingPosts = await prisma.post.findMany({
    where: {
      userId: { in: followingIds } // 🎯 Filters list instantly via Prisma matching logic
    },
    include: { 
      user: true,
      reactions: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalUserCount = await prisma.user.count();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={currentUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Sidebar Navigation Layout */}
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

        {/* CENTER COLUMN: Interactive Posting Box & Dynamic Tabbed Streams */}
        <main className="lg:col-span-6 space-y-6">
          <FeedForm currentUser={currentUser} />

          {/* 🚀 REMOVED OLD LOOP MAP AND MOUNTED THE INTELLIGENT STREAM COMPONENT */}
          <FeedStream 
            globalPosts={globalPosts} 
            followingPosts={followingPosts} 
            currentUserId={currentUser.id} 
          />
        </main>

        {/* RIGHT COLUMN: Insight Sidebar Indicators */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-2">Platform Metrics</h3>
            <div className="text-xs space-y-2 text-gray-600 font-semibold">
              <div className="flex justify-between border-b border-gray-50 pb-1.5 mb-1.5">
                <span>Registered Users:</span>
                <span className="text-rose-500 font-black">{totalUserCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Stream Updates:</span>
                <span className="text-gray-900 font-bold">{globalPosts.length}</span>
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