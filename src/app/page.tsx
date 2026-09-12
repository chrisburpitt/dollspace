// src/app/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import FeedForm from "@/components/FeedForm";
import FeedStream from "@/components/FeedStream";
import { getCurrentUser } from "@/app/actions/auth";
import GlobalHeader from "@/components/GlobalHeader";
import StaticFeedBanner from "@/components/StaticFeedBanner"; 
import { getUnreadMailCount } from "@/app/actions/mailCount";
import { getOnlineDollsRoster } from "@/app/actions/onlineUsers";
import SidebarNav from "@/components/SidebarNav";
import OnlineUsersSidebar from "@/components/OnlineUsersSidebar";
import { redirect } from "next/navigation";

 export const metadata: Metadata = {
  title: "Dollspace | Home",
  description: "Make yourself at home doll, this is your space!",
  };


export default async function HomePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount(); 

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
    <StaticFeedBanner />

    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
      
      {/* 🚀 2. LEFT COLUMN SIDEBAR PANEL (Cleaned up and consolidated down to just two simple component rows!) */}
      <aside className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-20 h-fit self-start">
        
        {/* Mounts your fresh reusable navigation and passes data strings cleanly */}
        <SidebarNav 
          currentUsername={currentUser.username} 
          unreadMailCount={unreadMailCount} 
        />

        <OnlineUsersSidebar users={await getOnlineDollsRoster()} />
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
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">Welcome back to Dollspace {currentUser.displayName}! Share stories, pictures or links directly to your feed for your followers to see ✨</p>
          </div>
        </aside>

      </div>
    </div>
  );
}
