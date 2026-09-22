// src/app/actions/privacySettings.ts (THE SOCIAL RESTORATION ENGINE)
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// 🔍 1. FETCH SYSTEM: Gather all active locks created by the session user
export async function getPersonalBlockRoster() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return [];

  try {
    const list = await prisma.userBlockRelation.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" }
    });

    // Resolve the display names and handles for everyone on the list
    const enrichedList = await Promise.all(
      list.map(async (relation) => {
        const targetDoll = await prisma.user.findUnique({
          where: { id: relation.targetId },
          select: { username: true, displayName: true, avatarUrl: true }
        });

        return {
          id: relation.id,
          targetId: relation.targetId,
          type: relation.type, // BLOCK or IGNORE
          expiresAt: relation.expiresAt ? relation.expiresAt.toISOString() : null,
          doll: targetDoll || { username: "unknown", displayName: "Deleted Doll", avatarUrl: null }
        };
      })
    );

    return enrichedList;
  } catch (err) {
    console.error("Failed to gather privacy roster maps:", err);
    return [];
  }
}

// 🔓 2. RESTORATION ACTION: Lift blocks or temporary ignore windows instantly
export async function liftBlockRelationAction(relationId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  try {
    await prisma.userBlockRelation.delete({
      where: {
        id: relationId,
        userId: sessionUser.id // Security guard: Ensures you can only wipe your own lists!
      }
    });

    // 🎯 REVALIDATION ROUTE HARMONIZATION: Updated to sync with the new endpoint!
    revalidatePath("/settings/blocked");
    revalidatePath("/chat");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete restriction record row:", err);
    return { error: "Database transaction failed." };
  }
}
