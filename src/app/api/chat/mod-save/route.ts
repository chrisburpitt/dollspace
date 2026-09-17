// src/app/api/chat/mod-save/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { content, userId } = await request.json();
    
    if (!content?.trim() || !userId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const savedLogRow = await prisma.modMessage.create({
      data: {
        content: content.trim(),
        userId: userId
      }
    });

    return NextResponse.json({ success: true, message: savedLogRow });
  } catch (error) {
    console.error("API ROUTE DATABASE LOG FAULT:", error);
    return NextResponse.json({ error: "Database operation failed." }, { status: 500 });
  }
}
