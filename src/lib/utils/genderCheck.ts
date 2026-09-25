// src/lib/utils/genderCheck.ts (THE AIRTIGHT MALE-IDENTIFICATION MATRIX)

interface TargetUserIdentityPayload {
  genderPrefix?: string | null;  // Stores: "Trans", "Cis", etc.
  genderBase?: string | null;    // Stores: "man", "boy", "woman", "girl"
  genderIdentity?: string | null; // Safe fallback string field (e.g. "Trans Man")
}

/**
 * Verifies if an account matches the platform's male-identified criteria.
 * @param user The user object row fetched from Prisma PostgreSQL tables.
 * @returns boolean True if they are classified as a man/boy, false otherwise.
 */
export function verifyIsMaleIdentified(user: TargetUserIdentityPayload | null | undefined): boolean {
  if (!user) return false;

  // 1. Normalize your inputs to lower-case strings to eliminate casing mismatches
  const prefix = user.genderPrefix?.trim().toLowerCase() || "";
  const base = user.genderBase?.trim().toLowerCase() || "";
  const fullIdentity = user.genderIdentity?.trim().toLowerCase() || "";

  // 2. 🎯 THE CORE RULE: "Trans" or "Cis" combined with "man" or "boy"
  const hasMalePrefix = prefix === "trans" || prefix === "cis";
  const hasMaleBase = base === "man" || base === "boy";

  if (hasMalePrefix && hasMaleBase) {
    return true;
  }

  // 3. Fallback security check: Scan the full identity string field just in case
  if (
    fullIdentity === "trans man" || 
    fullIdentity === "trans boy" || 
    fullIdentity === "cis man" || 
    fullIdentity === "cis boy"
  ) {
    return true;
  }

  // Everyone else defaults to false (Default she/her or they/them tracks)
  return false;
}
