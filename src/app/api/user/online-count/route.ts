// src/app/api/user/online-count/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 🎯 THE LIVE FILTER ACCURACY:
    // Only count records where status is strictly set to ONLINE, AWAY, or BUSY.
    // Ensure that it doesn't count users left in an OFFLINE or BANNED state.
    const trueOnlineCount = await prisma.user.count({
      where: {
        isBanned: false,
        status: {
          in: ["ONLINE", "AWAY", "BUSY"]
        }
      }
    });

    return NextResponse.json({ onlineCount: trueOnlineCount });
  } catch (error) {
    console.error("Failed to compile live API presence index:", error);
    return NextResponse.json({ onlineCount: 1 }, { status: 500 });
  }
}
