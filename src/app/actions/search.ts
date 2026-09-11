// src/app/actions/search.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export interface SearchFilters {
  query?: string;
  genderIdentity?: string;
  lookingFor?: string;
}

export async function searchDollsRegistry(filters: SearchFilters) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const { query, genderIdentity, lookingFor } = filters;

  // 1. Build typesafe Prisma conditional filters object
  const whereClause: any = {
    id: { not: sessionUser.id } // 🚀 Exclude yourself from directory results
  };

  if (query?.trim()) {
    whereClause.OR = [
      { username: { contains: query.trim(), mode: "insensitive" } },
      { displayName: { contains: query.trim(), mode: "insensitive" } }
    ];
  }

  if (genderIdentity && genderIdentity !== "ALL") {
    whereClause.genderIdentity = genderIdentity;
  }

  if (lookingFor && lookingFor !== "ALL") {
    whereClause.lookingFor = { contains: lookingFor, mode: "insensitive" };
  }

  // 2. Query matching profiles directly from Neon
  try {
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        location: true,
        genderIdentity: true,
        lookingFor: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 40
    });

    // Serialize Date parameters safely across network boundary
    return {
      success: true,
      users: users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString()
      }))
    };
  } catch (err) {
    console.error("Registry directory search failed:", err);
    return { error: "Failed to query user registry database records." };
  }
}
