// src/app/page.tsx (PART 1 - PROTECTED SERVER PRE-FETCH ENGINE)
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

  const defaultAvatarUrl = "https://ufs.sh";
  
  const enrichedCurrentUser = {
    ...currentUser,
    avatarUrl: currentUser?.avatarUrl || defaultAvatarUrl
  };

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

  // 🎯 THE CRASH PREVENTER MAP ENGINE:
  // Dynamically uses Array.isArray and deep optional chaining (?.) to make it 
  // physically impossible for script-generated or commentless posts to break the page loop!
  const formatPostDates = (postsArray: any[]) => {
    if (!Array.isArray(postsArray)) return [];
    return postsArray.map(post => ({
      ...post,
      createdAt: post?.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
      images: Array.isArray(post?.images) ? post.images : [],
      linkUrl: post?.linkUrl || null,
      linkTitle: post?.linkTitle || null,
      linkDesc: post?.linkDesc || null,
      linkImage: post?.linkImage || null,
      user: {
        ...post?.user,
        avatarUrl: post?.user?.avatarUrl || defaultAvatarUrl
      },
      comments: Array.isArray(post?.comments) 
        ? post.comments.map((c: any) => ({
            ...c,
            createdAt: c?.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
            user: {
              ...c?.user,
              avatarUrl: c?.user?.avatarUrl || defaultAvatarUrl
            }
          }))
        : []
    }));
  };

  const validatedHeaderUser = {
    id: currentUser.id,
    status: currentUser.status,
    role: currentUser.role || "USER",
    avatarUrl: currentUser.avatarUrl || defaultAvatarUrl
  };

// src/app/page.tsx (PART 2 - DYNAMIC REINFORCED MARKUP VIEWPORT)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      <GlobalHeader currentUser={validatedHeaderUser} />
      <StaticFeedBanner />
      <MobileNavShell 
        currentUsername={currentUser.username} 
        unreadMailCount={unreadMailCount || 0} 
      />	

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
      
        {/* LEFT COLUMN: Sidebar Navigation List Cards */}
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
          {/* 🎯 HYDRATED SAFE PASSTHROUGH MAP:
              Passes down your newly validated enriched user arrays so the editor 
              can render your custom avatars safely with no unhandled rejections! */}
          <FeedForm currentUser={enrichedCurrentUser} followersList={followingDollsList} />
          
          <FeedStream 
            globalPosts={formatPostDates(globalPosts) as any} 
            followingPosts={formatPostDates(followingPosts) as any} 
            currentUserId={currentUser.id} 
            followersList={followingDollsList} 
          />
        </main>

        {/* RIGHT COLUMN: Platform Hub Metrics Panel */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
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
