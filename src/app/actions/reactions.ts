// src/app/actions/reactions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function togglePostReaction(postId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  try {
    // 1. Look up if this exact doll has already registered a love reaction on this update card
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        postId: postId,
        userId: sessionUser.id
      }
    });

    if (existingReaction) {
      // 🚀 ALREADY LIKED: Delete and remove the reaction row to "unlike"
      await prisma.reaction.delete({
        where: { id: existingReaction.id }
      });
      
      revalidatePath("/");
      return { success: true, action: "REMOVED" };
    } else {
      // 🚀 NOT LIKED YET: Insert a brand new reaction row record straight down to Postgres
      await prisma.reaction.create({
        data: {
          postId: postId,
          userId: sessionUser.id
        }
      });
      
      revalidatePath("/");
      return { success: true, action: "ADDED" };
    }
  } catch (err) {
    console.error("Platform post reaction toggle tracking transaction failed:", err);
    return { error: "Database transaction mapping failure." };
  }
}
