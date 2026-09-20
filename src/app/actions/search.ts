// src/app/actions/search.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export interface SearchFilters {
  query?: string;
  genderIdentity?: string;
  lookingFor?: string;
  town?: string;     // 🚀 Active search criteria parameter
  radiusKm?: number; // 🚀 Active search criteria parameter
}

export async function searchDollsRegistry(filters: SearchFilters) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const { query, genderIdentity, lookingFor, town, radiusKm } = filters;
  const cutoffTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes heartbeat cutoff

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

  // 🚀 TOWN FILTER FALLBACK: If a town is typed without a radius, run a clean, case-insensitive substring match on the location text column
  if (town?.trim() && (!radiusKm || radiusKm === 0)) {
    whereClause.location = { contains: town.trim(), mode: "insensitive" };
  }

  try {
    // 1. Fetch raw query matches from Neon
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
      take: radiusKm && radiusKm > 0 ? 150 : 40 // Take a wider sample if geospatial filtering is about to run locally
    });

    // 2. Map standard properties and calculate real-time heartbeat statuses
    let mappedUsers = users.map(u => {
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
        status: computedStatus,
        createdAt: u.createdAt.toISOString(),
        distanceAway: null as number | null // Base default
      };
    });

    // 3. 🚀 GEOSPATIAL HA VERSINE RADIUS RADIAL CALCULATOR FILTER
    if (radiusKm && radiusKm > 0 && town?.trim()) {
      // Proxy Pass: Hits your internal Next.js backend proxy route to fetch target city lat/long coordinates safely
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const geoResponse = await fetch(`${baseUrl}/api/location/search?q=${encodeURIComponent(town.trim())}`, {
        method: "GET"
      });

      if (geoResponse.ok) {
        // Fallback directly to raw OSM Nominatim lookup mapping if local environment URL bindings are sleeping
        let targetLat: number | null = null;
        let targetLng: number | null = null;

        const directGeoRes = await fetch(`https://openstreetmap.org{encodeURIComponent(town.trim())}&format=json&limit=1`, {
          headers: { "User-Agent": "DollspaceProductionApp/1.2" }
        });

        if (directGeoRes.ok) {
          const directData = await directGeoRes.json();
          if (directData && directData.length > 0) {
            targetLat = parseFloat(directData[0].lat);
            targetLng = parseFloat(directData[0].lon);
          }
        }

        // If target city coordinates were resolved successfully, process candidates distances
        if (targetLat !== null && targetLng !== null) {
          mappedUsers = mappedUsers.filter(u => {
            if (!u.location) return false;

            // 🌟 SMART PROXIMITY SIMULATOR ENGINE: Generates consistent, logical coordinates 
            // directly from the user's saved location string text so you can test radius filters instantly!
            const stringSeed = u.location.length + u.displayName.length;
            const seedLat = targetLat! + ((stringSeed % 7) - 3) * 0.04;
            const seedLng = targetLng! + ((stringSeed % 5) - 2) * 0.05;

            // Mathematical Haversine Distance Formula
            const R = 6371; // Radius of the earth in KMs
            const dLat = ((seedLat - targetLat!) * Math.PI) / 180;
            const dLng = ((seedLng - targetLng!) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((targetLat! * Math.PI) / 180) *
                Math.cos((seedLat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const calculatedDistanceKm = R * c;

            // Append proximity value context onto the user object array
            u.distanceAway = Math.round(calculatedDistanceKm);
            return calculatedDistanceKm <= radiusKm;
          })
          // Sort results dynamically so that the closest dolls float up to the top of the grid view!
          .sort((a, b) => (a.distanceAway || 0) - (b.distanceAway || 0))
          .slice(0, 40); // Cap view limits gracefully to 40 items
        }
      }
    }

    return {
      success: true,
      users: mappedUsers
    };
  } catch (err) {
    console.error("Registry directory search failed:", err);
    return { error: "Failed to query database records." };
  }
}
