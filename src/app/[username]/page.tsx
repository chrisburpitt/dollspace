// src/app/[username]/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getUnreadMailCount } from "@/app/actions/mailCount";
import { getOnlineDollsRoster } from "@/app/actions/onlineUsers"; 
import ProfileClient from "./ProfileClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { displayName: true }
  });

  if (!user) return { title: "Dollspace | User Not Found" };

  return {
    title: `Dollspace | ${user.displayName}'s Profile`,
    description: `View ${user.displayName}'s custom profile card on Dollspace.`
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login"); 

  // Fetch real-time mail counters for the sidebar nav
  const unreadMailCount = await getUnreadMailCount();
  const onlineUsers = await getOnlineDollsRoster(); 

  const user = await prisma.user.findUnique({
    where: { username },
    include: { 
      _count: { 
        select: { followers: true, following: true, posts: true } 
      },
      albums: {
        include: { photos: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) notFound();

  const userPosts = await prisma.post.findMany({
    where: { userId: user.id },
    include: { 
      user: true, 
      reactions: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" },
    take: 20 
  });

  const isFollowingResult = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: sessionUser.id,
        followingId: user.id,
      },
    },
  });

  const isFollowing = !!isFollowingResult;
  const isOwner = user.id === sessionUser.id;

  const validatedHeaderUser = {
    id: sessionUser.id,
    status: sessionUser.status || "ONLINE",
    notificationsReceived: sessionUser.notificationsReceived || []
  };

  return (
    <ProfileClient 
      user={user} 
      isOwner={isOwner} 
      isFollowing={isFollowing} 
      sessionUser={sessionUser} 
      userPosts={userPosts} 
      validatedHeaderUser={validatedHeaderUser} 
      unreadMailCount={unreadMailCount}
	  onlineUsers={onlineUsers} 
    />
  );
}
