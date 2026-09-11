// src/app/actions/mailCount.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export async function getUnreadMailCount(): Promise<number> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return 0;

  // 🚀 HIGH-SPEED ACCUMULATOR: Pulls a raw integer match count natively in 0ms!
  const unreadCount = await prisma.internalMail.count({
    where: {
      recipientId: sessionUser.id,
      isRead: false,
      recipientDeleted: false,
      recipientArchived: false
    }
  });

  return unreadCount;
}
