// src/app/api/auth/verify-session/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dollspace-key-12345";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ valid: false, reason: "No token cookie found" }, { status: 401 });
    }

    // Verify token payload cryptographic signature matches
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { username: true, displayName: true }
    });

    if (!user) {
      return NextResponse.json({ valid: false, reason: "User no longer exists" }, { status: 401 });
    }

    return NextResponse.json({ valid: true, user });
  } catch (error) {
    return NextResponse.json({ valid: false, reason: "Invalid or expired token signature" }, { status: 401 });
  }
}
