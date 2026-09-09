// src/app/actions/notifications.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. UTILITY METHOD: Fire a background notification entry event row
export async function createNotification(data: {
  type: "FOLLOW" | "LIKE" | "COMMENT" | "MENTION";
  recipientId: string;
  issuerId: string;
  postId?: string;
}) {
  // Prevent users from receiving system notifications for their own actions
  if (data.recipientId === data.issuerId) return;

  await prisma.notification.create({
    data: {
      type: data.type,
      recipientId: data.recipientId,
      issuerId: data.issuerId,
      postId: data.postId,
    },
  });
}

// 2. ACTION: Mark all notifications as read inside the list drawer
export async function markNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}
