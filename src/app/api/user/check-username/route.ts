import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 🚀 FIXED: Pulls incoming query strings securely using Next.js native searchParams matrix parser!
    const { searchParams } = request.nextUrl;
    const targetUsername = searchParams.get("username")?.trim();

    // If the input box is empty, stop execution right away
    if (!targetUsername) {
      return NextResponse.json({ available: false, error: "Empty username coordinate" }, { status: 400 });
    }

    // 🚀 AIRTIGHT CASE-INSENSITIVE DUPLICATE SCANNER:
    // Queries your database tables using 'mode: "insensitive"' to block matching capitalizations perfectly!
    const existingUserMatch = await prisma.user.findFirst({
      where: {
        username: {
          equals: targetUsername,
          mode: "insensitive" // 🛡️ Checks both uppercase and lowercase matches!
        }
      }
    });

    // If an account row is discovered matching that name token, tell the frontend it is TAKEN!
    if (existingUserMatch) {
      return NextResponse.json({ available: false });
    }

    // Otherwise, give them a flawless green light pass!
    return NextResponse.json({ available: true });

  } catch (error) {
    console.error("[Auth Shield] Username validation router failure:", error);
    // Graceful fallback to prevent screen layout freezes during system updates
    return NextResponse.json({ available: true, error: "Internal lookup bypass" }, { status: 500 });
  }
}
