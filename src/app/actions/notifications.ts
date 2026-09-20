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

// 🚀 3. NEW ACTION: Mark a singular targeted notification row item as read instantly
export async function markSingleNotificationRead(notificationId: string) {
  try {
    const updatedRow = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    
    // Purge page manifests cache layers instantly to persist state modifications
    revalidatePath("/");
    revalidatePath("/[username]", "layout");
    return { success: true, updatedRow };
  } catch (error) {
    console.error("Prisma error inside markSingleNotificationRead server action:", error);
    return { error: "Failed to update notification state." };
  }
}

// 🚀 4. NEW ACTION: Securely delete a singular notification event log row permanently from Neon
export async function removeNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });
    
    // Flush page states caches instantly to verify alignment synchronization
    revalidatePath("/");
    revalidatePath("/[username]", "layout");
    return { success: true };
  } catch (error) {
    console.error("Prisma error inside removeNotification server action:", error);
    return { error: "Failed to execute database row trashing transaction." };
  }
}
