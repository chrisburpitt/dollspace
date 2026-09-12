// src/app/actions/presence.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

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