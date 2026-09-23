// src/app/page.tsx (PART 1 - SECURED SERVER DATA LOOKUPS)
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
import { getPlatformDashboardMetrics } from "@/app/actions/platformMetrics";
import PlatformMetricsCard from "@/components/PlatformMetricsCard";
import MobileNavShell from "@/components/MobileNavShell"; 
import DollOfTheWeekWidget from "@/components/DollOfTheWeekWidget";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dollspace | Home",
  description: "Make yourself at home doll, this is your space xo",
};

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount(); 
  const waitingDMsCount = await prisma.directMessage.count({
    where: {
      recipientId: currentUser.id,
      isRead: false
    }
  });
  
  const totalUsersCount = await prisma.user.count({
    where: { isBanned: false }
  });

  const activeDollsOnlineCount = await prisma.user.count({
    where: {
      isBanned: false,
      status: {
        notIn: ["OFFLINE", "BANNED"] 
      }
    }
  });
  
  const dashboardMetrics = {
    onlineCount: activeDollsOnlineCount,
    totalUsers: totalUsersCount,
    unreadMailCount: await prisma.internalMail.count({ where: { recipientId: currentUser.id, isRead: false } }),
    waitingDMsCount: waitingDMsCount 
  };
  
  const dotwRecord = currentUser 
    ? await prisma.dollOfTheWeekEntry.findUnique({ where: { userId: currentUser.id } })
    : null;
  
  const followingDollsList = await prisma.follow.findMany({
    where: { followerId: currentUser.id },
    select: {
      following: {
        select: {
          username: true,
          displayName: true
        }
      }
    }
  }).then(relations => relations.map(r => r.following));

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

  const globalPosts = await prisma.post.findMany({
    include: postInclusions,
    orderBy: { createdAt: "desc" }
  });

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
    status: currentUser.status,
    role: currentUser.role || "USER"
  };


  return (
    // 🎯 THE TIMELINE THEME SYNC: 
    // We append 'dark:bg-gray-950 dark:text-gray-50' to allow the master feed container 
    // to smoothly transition background themes natively.
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      <GlobalHeader currentUser={validatedHeaderUser} />
      <StaticFeedBanner />
      <MobileNavShell 
        currentUsername={currentUser.username} 
        unreadMailCount={unreadMailCount || 0} 
      />	

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
      
        {/* 🚀 LEFT COLUMN SIDEBAR PANEL (Natively reacts to theme selectors) */}
        <aside className="hidden lg:block lg:col-span-3 lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav 
            currentUsername={currentUser.username} 
            unreadMailCount={unreadMailCount} 
          />
          {currentUser && (
            <DollOfTheWeekWidget currentUserEntry={dotwRecord} />
          )}
          <OnlineUsersSidebar users={await getOnlineDollsRoster()} />
        </aside>

        {/* CENTER COLUMN: Interactive Feed Timeline Core */}
        <main className="lg:col-span-6 space-y-6">
          <FeedForm currentUser={currentUser} followersList={followingDollsList} />
          
          <FeedStream 
            globalPosts={formatPostDates(globalPosts) as any} 
            followingPosts={formatPostDates(followingPosts) as any} 
            currentUserId={currentUser.id} 
            followersList={followingDollsList} 
          />
        </main>

        {/* RIGHT COLUMN: Interactive Insights Sidebar */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          {/* 🎯 INTRO CARD DARK CONSOLE: 
              We switch 'bg-white border-gray-200' to handle dark utility states smoothly! */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
            <h3 className="font-black text-sm text-gray-900 dark:text-gray-100 tracking-wide uppercase mb-2">
              Platform Hub
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-400 font-semibold leading-relaxed">
              Welcome back to Dollspace, {currentUser.displayName}! Share stories, pictures, or links directly to your feed for your followers to see ✨
            </p>
          </div>
          <PlatformMetricsCard metrics={dashboardMetrics} />
        </aside>

      </div>
    </div>
  );
}
