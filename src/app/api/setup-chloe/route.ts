// src/app/api/setup-chloe/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma"; // Adjust path if your prisma file is in src/lib/prisma

export async function GET() {
  try {
    const user = await prisma.user.upsert({
      where: { username: "Chloe" },
      update: {},
      create: {
        username: "Chloe",
        displayName: "Chloe",
        bio: "Your Dollspace queen and saviour xo",
      },
    });
    
    return NextResponse.json({ success: true, message: "Profile created natively!", user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
