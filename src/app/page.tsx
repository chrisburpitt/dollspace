// src/app/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FeedForm from "@/components/FeedForm";
import FeedStream from "@/components/FeedStream";
import { getCurrentUser } from "@/app/actions/auth";
import GlobalHeader from "@/components/GlobalHeader";
import StaticFeedBanner from "@/components/StaticFeedBanner"; 
import { redirect } from "next/navigation";

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // Relational inclusion parameters for home feed queries
  const postInclusions = {
    user: {
      select: { id: true, username: true, displayName: true, avatarUrl: true }
    },
    reactions: true,
    images: {
      select: { id: true, url: true }
    },
    comments: {
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "asc" as const }
    }
  };

  // 1. FETCH GLOBAL POSTS
  const globalPosts = await prisma.post.findMany({
    include: postInclusions,
    orderBy: { createdAt: "desc" }
  });

  // 2. FETCH FOLLOWING POSTS
  const followingRelations = await prisma.follow.findMany({
    where: { followerId: currentUser.id },
    select: { followingId: true }
  });
  const followingIds = followingRelations.map(f => f.followingId);

  const followingPosts = await prisma.post.findMany({
    where: { userId: { in: followingIds } },
    include: postInclusions,
    orderBy: { createdAt: "desc" }
  });

  // Format database dates safely into string parameters for typesafe client cascading passing
  const formatPostDates = (postsArray: any[]) => postsArray.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    images: post.images || [],
    linkUrl: post.linkUrl || null,
    linkTitle: post.linkTitle || null,
    linkDesc: post.linkDesc || null,
    linkImage: post.linkImage || null,
  }));

  const validatedHeaderUser = {
    id: currentUser.id,
    status: currentUser.status || "ONLINE"
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={validatedHeaderUser} />

      {/* 🚀 Mounts the banner completely free, exactly like the profile page layout! */}
      <StaticFeedBanner />

      {/* Main Structural Grid Container (Matches the profile page grid spacing perfectly) */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Sidebar Navigation Panel */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 bg-rose-50 text-rose-500 font-bold rounded-xl text-sm transition">
                🏠 Home Feed
              </Link>
              <Link href={`/${currentUser.username}`} className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition">
                👤 My Profile
              </Link>
              <Link href="/chat" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
                <span>💬 Chat Lounge</span>
              </Link>
			  <Link href="/mail" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
                <span>💌 Mailbox</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: Interactive Feed Timeline Core */}
        <main className="lg:col-span-6 space-y-6">
          <FeedForm currentUser={currentUser} />
          <FeedStream 
            globalPosts={formatPostDates(globalPosts) as any} 
            followingPosts={formatPostDates(followingPosts) as any} 
            currentUserId={currentUser.id} 
          />
        </main>

        {/* RIGHT COLUMN: Interactive Insights Sidebar */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-2">Platform Hub</h3>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">Welcome back to Dollspace $(name)! Share stories, pictures or links directly to your feed for your followers to see ✨</p>
          </div>
        </aside>

      </div>
    </div>
  );
}
