// src/app/actions/reactions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function togglePostReaction(postId: string, targetEmoji: string = "❤️") {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  try {
    // Look up if this user has already left ANY reaction on this post
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        postId: postId,
        userId: sessionUser.id
      }
    });

    if (existingReaction) {
      // 🚀 SWAP OR UNLIKE: If they click the exact same emoji, remove it. If different, update it!
      if (existingReaction.emoji === targetEmoji) {
        await prisma.reaction.delete({ where: { id: existingReaction.id } });
        revalidatePath("/");
        return { success: true, action: "REMOVED" };
      } else {
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { emoji: targetEmoji }
        });
        revalidatePath("/");
        return { success: true, action: "UPDATED" };
      }
    } else {
      // 🚀 FRESH REACTION: Create a new row with the chosen emoji string
      await prisma.reaction.create({
        data: {
          postId: postId,
          userId: sessionUser.id,
          emoji: targetEmoji
        }
      });
      
      revalidatePath("/");
      return { success: true, action: "ADDED" };
    }
  } catch (err) {
    console.error("Multi-reaction toggle tracking failed:", err);
    return { error: "Database transaction mapping failure." };
  }
}
