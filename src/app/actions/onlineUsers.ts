// src/app/actions/onlineUsers.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export async function getOnlineDollsRoster() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return [];

  try {
    // 🚀 ZERO-DELAY ACCUMULATOR: Scans for active statuses, sorted by most recent login activity
    const onlineUsers = await prisma.user.findMany({
      where: {
        id: { not: sessionUser.id },
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
      take: 5 // Firm cap at 5 people to keep the sidebar incredibly clean
    });

    return onlineUsers;
  } catch (err) {
    console.error("Failed to fetch online sidebar roster:", err);
    return [];
  }
}
