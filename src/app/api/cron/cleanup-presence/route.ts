// src/app/api/cron/cleanup-presence/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // ⏱️ CALCULATE THE 10-MINUTE THRESHOLD BOUNDARY
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // 🎯 THE SWEEP: Catch any user who is still marked as active but hasn't updated their timestamp
    const sweptUsersBatch = await prisma.user.updateMany({
      where: {
        status: { in: ["ONLINE", "AWAY", "BUSY"] },
        lastActive: { lt: tenMinutesAgo }, // Less than (older than) 10 minutes ago
        isBanned: false
      },
      data: {
        status: "OFFLINE" // Force active indicators cold automatically!
      }
    });

    console.log(`Janitor Loop Success: Automatically cleared ${sweptUsersBatch.count} inactive doll sessions.`);
    
    return NextResponse.json({ 
      success: true, 
      clearedCount: sweptUsersBatch.count 
    });
  } catch (error) {
    console.error("Presence janitor cron exception threw:", error);
    return NextResponse.json({ error: "Presence flush transaction error." }, { status: 500 });
  }
}
