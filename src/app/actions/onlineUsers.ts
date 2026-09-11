// src/app/actions/onlineUsers.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export async function getOnlineDollsRoster() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return [];

  // 🕒 2-MINUTE THRESHOLD: Calculate the cutoff time for active sessions
  const cutoffTime = new Date(Date.now() - 2 * 60 * 1000);

  try {
    const onlineUsers = await prisma.user.findMany({
      where: {
        id: { not: sessionUser.id },
        // 🚀 CRITICAL FIX: Must have a recent heartbeat AND cannot be manually hiding via OFFLINE/Appear Offline status
        lastActive: { gte: cutoffTime },
        status: { in: ["ONLINE", "AWAY", "BUSY"] }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        status: true
      },
      orderBy: { lastActive: "desc" },
      take: 5
    });

    return onlineUsers;
  } catch (err) {
    console.error("Failed to query live presence roster:", err);
    return [];
  }
}
