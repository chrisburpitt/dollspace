// src/app/api/chat/mod-save/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { content, userId } = await request.json();
    
    // Ensure payload fields are present before execution
    if (!content?.trim() || !userId) {
      return NextResponse.json({ error: "Missing required tracking parameters." }, { status: 400 });
    }

    // 🚀 ARCHIVE TRANSACTION: Creates the persistent database record row on Neon
    const savedLogRow = await prisma.modMessage.create({
      data: {
        content: content.trim(),
        userId: userId
      }
    });

    return NextResponse.json({ success: true, message: savedLogRow });
  } catch (error) {
    console.error("CRITICAL API ROUTE DATABASE MOD SAVE FAULT:", error);
    return NextResponse.json({ error: "Database archival operation failed." }, { status: 500 });
  }
}
