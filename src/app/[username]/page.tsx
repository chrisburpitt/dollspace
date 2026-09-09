// src/app/[username]/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import ProfileClient from "./ProfileClient"; // 🚀 IMPORTS THE EXTRACTED CLIENT VISUALS
import { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { displayName: true }
  });

  if (!user) return { title: "User Not Found | Dollspace" };

  return {
    title: `Dollspace | ${user.displayName}'s profile`,
    description: `View ${user.displayName}'s custom profile card on Dollspace.`
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // 1. Secure Server-Side Cookie Session Lookup
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login"); 

  // 2. Fetch User Relations Profile Matrix from Neon
  const user = await prisma.user.findUnique({
    where: { username },
    include: { _count: { select: { followers: true, following: true } } }
  });

  if (!user) notFound();

  // 3. Fetch Posts Stream History
  const userPosts = await prisma.post.findMany({
    where: { userId: user.id },
    include: { 
      user: true, 
      reactions: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" }
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

  // 🚀 HANDS THE PROPS SAFELY OVER the network boundary straight down into your client file
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
