// src/app/actions/presence.ts (FULL INTEGRATED PRODUCTION PRESENCE SUITE)
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function touchUserPresenceHeartbeat() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return;

  try {
    // 🚀 SILENT HEARTBEAT: Stamp the exact millisecond they interacted with the site
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { lastActive: new Date() }
    });
  } catch (err) {
    console.error("Presence heartbeat dropped:", err);
  }
}

export async function forceClientPresenceNudge() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { lastActive: new Date() }
    });
    return { success: true };
  } catch (err) {
    console.error("Client pulse nudge dropped:", err);
    return { error: "Database transaction failed" };
  }
} 

// 🚀 3. THE DROP-IN STATUS OVERWRITE ACTION
// Fires directly via the GlobalHeader dropdown click handler to force-sync status fields
export async function updateUserStatusAction(newStatus: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || !sessionUser.id) return { error: "Unauthorized" };

  try {
    // Overwrite their current status dot value atomically inside Neon
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        status: newStatus,
        lastActive: new Date()
      }
    });

    // 🎯 THE CACHE CRUSHER: Forces Next.js to purge all cached layout states site-wide!
    // This guarantees your manual Away, Busy, or Offline selections stay perfectly sticky on page changes.
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to commit status change via server action:", error);
    return { error: "Database state failed to update" };
  }
}
