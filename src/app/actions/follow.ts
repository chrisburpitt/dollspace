// src/app/actions/follow.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

// ACTION: Follow or Unfollow a user profile dynamically
export async function toggleFollow(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) return { error: "You cannot follow yourself." };

  // Check if a relationship row already exists between these two accounts
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollow) {
    // If they already follow them, unfollow by deleting the relationship row
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });
  } else {
    // Otherwise, establish the new follow relationship link
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    // 🚀 TRIGGER NOTIFICATION EVENT ROW SUCCESSFUL
    await createNotification({
      type: "FOLLOW",
      recipientId: targetUserId,
      issuerId: currentUserId,
    });
  }

  // Instantly revalidate the cache paths to update the counters in the UI
  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}
