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
  const cutoffTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes heartbeat cutoff

  const whereClause: any = {
    id: { not: sessionUser.id }
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
        lastActive: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 40
    });

    return {
      success: true,
      users: users.map(u => {
        // 🚀 COMPUTE REAL-TIME LIVE STATUS: If heartbeat is older than 2 mins, force their status display to OFFLINE
        const isHeartbeatActive = u.lastActive >= cutoffTime;
        const computedStatus = (isHeartbeatActive && u.status !== "OFFLINE") ? u.status : "OFFLINE";

        return {
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          location: u.location,
          genderIdentity: u.genderIdentity,
          lookingFor: u.lookingFor,
          status: computedStatus, // Maps the accurate calculated presence state to the UI view
          createdAt: u.createdAt.toISOString()
        };
      })
    };
  } catch (err) {
    console.error("Registry directory search failed:", err);
    return { error: "Failed to query database records." };
  }
}
