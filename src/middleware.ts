// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";
import * as jose from "jose"; // Using jose for lightweight edge runtime token decryption

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-dollspace-key-12345"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip asset files, login endpoints, and the banned page itself to avoid loops
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
      // Decode the JWT token smoothly on the edge runtime framework layer
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      
      // If our auth server action flags the session payload parameter matrix as banned, 
      // instantly reroute them straight to the clean, non-crashing /banned viewport canvas!
      if (payload && (payload as any).isBanned === true) {
        return NextResponse.redirect(new URL("/banned", request.url));
      }
    } catch (err) {
      // Invalid token, allow normal path routing fallthrough to catch redirects naturally
    }
  }

  return NextResponse.next();
}
