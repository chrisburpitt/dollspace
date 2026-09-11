// src/app/[username]/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import ProfileClient from "./ProfileClient";
import { getUnreadMailCount } from "@/app/actions/mailCount"; 
import { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

// 🎯 GENERATE METADATA: Stays completely clean, selecting only the display name
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
  const unreadMailCount = await getUnreadMailCount(); 

}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // 1. Secure Server-Side Session Lookup
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login"); 

  // 2. FETCH MAIN PROFILE DETAILS (UPGRADED HIGH-SPEED MATRIX)
  const user = await prisma.user.findUnique({
    where: { username },
    include: { 
      _count: { 
        select: { 
          followers: true, 
          following: true,
          posts: true // 🚀 FAST-TRACK: Let Postgres count your posts natively in 0ms!
        } 
      },
      albums: {
        include: { photos: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) notFound();

  // 3. Fetch Posts history stream (Limit payload to top 20 to lock-in lightning speed)
  const userPosts = await prisma.post.findMany({
    where: { userId: user.id },
    include: { 
      user: true, 
      reactions: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" },
    take: 20 // 🚀 PAGINATION LOCK: Prevents endless data-bloat delays
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
    />
  );
}
