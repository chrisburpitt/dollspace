// src/app/actions/follow.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFollow(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) return { error: "You cannot follow your own profile!" };

  // 1. Check if a relationship row already exists between these two accounts
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    }
  });

  if (existingFollow) {
    // 2. Unfollow: If they already follow them, delete the row reference connection
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });
  } else {
    // 3. Follow: If it's a fresh connection, create the relationship entry row
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    });
  }

  // Flush view caches instantly across feed streams and profile pages
  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}
