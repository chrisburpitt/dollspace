// src/app/actions/updateProfile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function updateProfileIdentityDetails(payload: {
  displayName: string;
  bio: string;
  birthday: string | null; // Expects an "YYYY-MM-DD" text string from the date picker
  genderIdentity: string;
  location: string;
  lookingFor: string;
  instagramHandle: string;
  facebookHandle: string;
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  try {
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        displayName: payload.displayName.trim(),
        bio: payload.bio.trim(),
        birthday: payload.birthday ? new Date(payload.birthday) : null,
        genderIdentity: payload.genderIdentity.trim() || null,
        location: payload.location.trim() || null,
        lookingFor: payload.lookingFor.trim() || null,
        instagramHandle: payload.instagramHandle.trim().replace(/@/g, "") || null,
        facebookHandle: payload.facebookHandle.trim() || null,
      }
    });

    revalidatePath(`/${sessionUser.username}`);
    return { success: true };
  } catch (err) {
    console.error("Profile update matrix transaction failed:", err);
    return { error: "Database transaction mapping error." };
  }
}
