// src/proxy.ts (NEXT.JS 16 STANDARD ARCHITECTURE)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // 🎯 FIXED: Imported natively from 'next/server' instead of 'next/request'
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-dollspace-key-12345"
);

// Next.js 16 looks for an exported proxy function loop
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip assets, api calls, login, and the banned view to bypass loop bugs
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname === "/banned"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      
      // Intercept execution and push banned accounts cleanly out to the safety canvas route
      if (payload && (payload as any).isBanned === true) {
        return NextResponse.redirect(new URL("/banned", request.url));
      }
    } catch (err) {
      // Allow catch fallbacks to execute naturally
    }
  }

  return NextResponse.next();
}

// 🚀 CRITICAL CONFIG: Force Edge runtime execution profile context rules
export const config = {
  runtime: "edge",
};
