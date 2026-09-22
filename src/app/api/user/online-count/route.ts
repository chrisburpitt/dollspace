// src/app/api/user/online-count/route.ts (DYNAMIC SLIDING-WINDOW METRICS)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ⏱️ CALCULATE THE 10-MINUTE INACTIVITY THRESHOLD IN REAL-TIME
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // 🎯 THE LIVE CALCULATION:
    // Only count dolls whose row says ONLINE, AWAY, or BUSY,
    // AND who have actively updated their lastActive timestamp within the past 10 minutes!
    const activeDollsCount = await prisma.user.count({
      where: {
        isBanned: false,
        status: { in: ["ONLINE", "AWAY", "BUSY"] },
        lastActive: { gte: tenMinutesAgo } // Greater than or equal to (newer than) 10 minutes ago
      }
    });

    return NextResponse.json({ onlineCount: activeDollsCount || 1 });
  } catch (error) {
    console.error("Failed to compile live API presence index:", error);
    return NextResponse.json({ onlineCount: 1 }, { status: 500 });
  }
}
