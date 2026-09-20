// src/app/api/user/notifications/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    // Safety Break: Return unauthorized if session data is missing
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized access token." }, { status: 401 });
    }

    // Query unread and recent notification row events from Neon
    const activityLogs = await prisma.notification.findMany({
      where: { recipientId: currentUser.id },
      include: {
        issuer: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 25 // Keeps the header loading payload optimized and fast
    });

    return NextResponse.json(activityLogs);
  } catch (error) {
    console.error("CRITICAL NOTIFICATION DRAWER DATA STREAM FAULT:", error);
    return NextResponse.json({ error: "Database retrieval failed." }, { status: 500 });
  }
}
