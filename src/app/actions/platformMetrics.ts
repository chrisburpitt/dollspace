// src/app/actions/platformMetrics.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export interface PlatformMetricsSummary {
  onlineCount: number;
  unreadMailCount: number;
  waitingDMsCount: number;
}

export async function getPlatformDashboardMetrics(): Promise<PlatformMetricsSummary> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { onlineCount: 0, unreadMailCount: 0, waitingDMsCount: 0 };
  }

  const cutoffTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes presence limit

  try {
    // 🚀 EXECUTE PARALLEL TRANSACTION COUNTS: Queries Neon simultaneously for maximum performance
    const [onlineCount, unreadMailCount, waitingDMsCount] = await Promise.all([
      // 1. Total active dolls online (excluding current session user)
      prisma.user.count({
        where: {
          id: { not: sessionUser.id },
          lastActive: { gte: cutoffTime },
          status: { in: ["ONLINE", "AWAY", "BUSY"] }
        }
      }),

      // 2. Total unread mailbox items
      prisma.user.findUnique({
        where: { id: sessionUser.id }
      }).then(() => prisma.internalMail.count({
        where: {
          recipientId: sessionUser.id,
          isRead: false,
          recipientDeleted: false,
          recipientArchived: false
        }
      })),

      // 3. Total waiting private direct chat messages (unread where recipient matches)
      // Note: Maps to your custom Message/Chat model fields from our DM boards session
      prisma.message ? prisma.message.count({
        where: {
          receiverId: sessionUser.id,
          isRead: false
        }
      }) : Promise.resolve(0) // Safe fallback to 0 if table names differ slightly
    ]);

    return {
      onlineCount,
      unreadMailCount,
      waitingDMsCount: waitingDMsCount || 0
    };
  } catch (err) {
    console.error("Failed to compile dashboard tracking metrics:", err);
    return { onlineCount: 0, unreadMailCount: 0, waitingDMsCount: 0 };
  }
}
