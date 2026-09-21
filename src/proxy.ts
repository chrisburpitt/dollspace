// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Pass through all routing tasks safely to let your actions handle session management
  return NextResponse.next();
}
