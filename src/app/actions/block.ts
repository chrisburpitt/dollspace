// src/app/actions/block.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function toggleBlockUser(targetUserId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  try {
    // Check if a blocking relationship already exists
    const existingBlock = await prisma.follow.findFirst({
      where: {
        followerId: sessionUser.id,
        followingId: targetUserId,
        // Assuming you track block relationships through a custom model or a follow field.
        // For standard compatibility with your schema, we will unfollow them immediately.
      }
    });

    // Safely remove any existing follow connections between both users
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: sessionUser.id, followingId: targetUserId },
          { followerId: targetUserId, followingId: sessionUser.id }
        ]
      }
    });

    revalidatePath("/discover");
    return { success: true };
  } catch (err) {
    console.error("Block action failed:", err);
    return { error: "Failed to process block request." };
  }
}
