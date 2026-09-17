// src/app/notifications/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";
import { markNotificationsAsRead } from "@/app/actions/notifications";
import { redirect } from "next/navigation";
import MobileNotificationsClient from "./MobileNotificationsClient";
import MobileNavShell from "@/components/MobileNavShell"; 

export const metadata = {
  title: "Dollspace | Activity Notifications",
  description: "View recent activity, replies, likes, and mentions.",
};

export default async function MobileNotificationsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  // 1. Fetch recent activity tracking rows matching current user identity
  const databaseNotifications = await prisma.notification.findMany({
    where: { recipientId: sessionUser.id },
    include: {
      issuer: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 40, // Expanded capacity for full-page reading depth
  });

  // 2. Clear out unread indicators on the database automatically when they access this view
  const unreadCount = databaseNotifications.filter((n) => !n.isRead).length;
  if (unreadCount > 0) {
    await markNotificationsAsRead(sessionUser.id).catch((err) =>
      console.error("Failed to auto-clear notifications on load:", err)
    );
  }

  // Format date attributes safely to primitives before crossing client barriers
  const formattedNotifications = databaseNotifications.map((notif) => ({
    id: notif.id,
    type: notif.type,
    isRead: true, // Set to true locally since we executed markNotificationsAsRead above
    createdAt: notif.createdAt.toISOString(),
    postId: notif.postId,
    issuer: notif.issuer,
  }));

  return (
    <MobileNotificationsClient 
      currentUserId={sessionUser.id} 
      initialNotifications={formattedNotifications} 
    />
  );
}
