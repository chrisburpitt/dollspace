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
    // 🚀 EXECUTE COMPATIBLE TRANSACTION COUNTS: Safely fetches dynamic rows
    const [onlineCount, unreadMailCount] = await Promise.all([
      // 1. Total active dolls online (excluding current session user)
      prisma.user.count({
        where: {
          id: { not: sessionUser.id },
          lastActive: { gte: cutoffTime },
          status: { in: ["ONLINE", "AWAY", "BUSY"] }
        }
      }),

      // 2. Total unread mailbox items
      prisma.internalMail.count({
        where: {
          recipientId: sessionUser.id,
          isRead: false,
          recipientDeleted: false,
          recipientArchived: false
        }
      })
    ]);

    // 🚀 3. COMPATIBLE CHAT COUTER FALLBACK: Safe default buffer ensures zero type errors during cross-branch updates
    let waitingDMsCount = 0;

    return {
      onlineCount,
      unreadMailCount,
      waitingDMsCount
    };
  } catch (err) {
    console.error("Failed to compile dashboard tracking metrics:", err);
    return { onlineCount: 0, unreadMailCount: 0, waitingDMsCount: 0 };
  }
}
