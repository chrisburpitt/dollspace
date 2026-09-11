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
