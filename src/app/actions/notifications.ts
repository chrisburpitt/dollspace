// src/app/actions/notifications.ts (MALE ATTENTION INTERCEPTION SHIELD)
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🚀 DATA HOOK: Matches our posts rule array to identify male identities cleanly
const BLOCKED_MALE_IDENTITIES = [
  "trans man",
  "trans boy",
  "cis man",
  "cis boy"
];

// 1. UTILITY METHOD: Fire a background notification entry event row (NOW WITH ATTENTION INTERCEPTIONS)
export async function createNotification(data: {
  type: "FOLLOW" | "LIKE" | "COMMENT" | "MENTION";
  recipientId: string;
  issuerId: string;
  postId?: string;
}) {
  // Prevent users from receiving system notifications for their own actions
  if (data.recipientId === data.issuerId) return; [10]

  try {
    // 🚀 THE INTERCEPTION GUARD:
    // 1. Check if the recipient doll has activated the male attention filter
    const recipientUser = await prisma.user.findUnique({
      where: { id: data.recipientId },
      select: { blockMaleAttention: true }
    });

    if (recipientUser?.blockMaleAttention) {
      // 2. Look up the identity of the user who triggered the event
      const issuerUser = await prisma.user.findUnique({
        where: { id: data.issuerId },
        select: { genderIdentity: true }
      });

      const issuerGender = issuerUser?.genderIdentity?.toLowerCase().trim() || "";

      // 3. 🎯 THE INTERCEPT: If a matched male identity tries to follow or comment, drop it silently!
      if (BLOCKED_MALE_IDENTITIES.includes(issuerGender)) {
        console.log(`[Dollspace Shield] Blocked notification type ${data.type} from male-identified account: ${data.issuerId}`);
        return { success: false, reason: "Filtered by recipient's content safety configurations." };
      }
    }

    // If it passes all safety checks, create the row item smoothly
    await prisma.notification.create({
      data: {
        type: data.type,
        recipientId: data.recipientId,
        issuerId: data.issuerId,
        postId: data.postId,
      },
    }); [10]

    return { success: true };
  } catch (error) {
    console.error("Shield interception transaction crashed inside createNotification:", error);
    return { error: "Notification creation process failed." };
  }
}

// 2. ACTION: Mark all notifications as read inside the list drawer
export async function markNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  }); [10]

  revalidatePath("/"); [10]
  revalidatePath("/[username]", "layout"); [10]
}

// 🚀 3. NEW ACTION: Mark a singular targeted notification row item as read instantly
export async function markSingleNotificationRead(notificationId: string) {
  try {
    const updatedRow = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    }); [10]
    
    // Purge page manifests cache layers instantly to persist state modifications
    revalidatePath("/"); [10]
    revalidatePath("/[username]", "layout"); [10]
    return { success: true, updatedRow }; [10]
  } catch (error) {
    console.error("Prisma error inside markSingleNotificationRead server action:", error); [10]
    return { error: "Failed to update notification state." }; [10]
  }
}

// 🚀 4. NEW ACTION: Securely delete a singular notification event log row permanently from Neon
export async function removeNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    }); [10]
    
    // Flush page states caches instantly to verify alignment synchronization
    revalidatePath("/"); [10]
    revalidatePath("/[username]", "layout"); [10]
    return { success: true }; [10]
  } catch (error) {
    console.error("Prisma error inside removeNotification server action:", error); [10]
    return { error: "Failed to execute database row trashing transaction." }; [10]
  }
}
