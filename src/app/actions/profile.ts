// src/app/actions/profile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStatus(userId: string, status: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}

// 🚀 UPGRADED TO CAPTURE EXPANDED MATCHING DATA FIELDS
export async function updateProfileDetails(
  userId: string, 
  data: {
    displayName: string;
    age: number | null;
    genderIdentity: string;
    location: string;
    lookingFor: string; // Receives the comma string from the client form
    bio: string;
  }
) {
  if (!data.displayName.trim()) {
    return { error: "Display name cannot be empty." };
  }

  // 🚀 CLEAN UP CHECK: If the list is empty or just commas, force it to null
  const cleanedLookingFor = data.lookingFor.trim() && data.lookingFor !== "," 
    ? data.lookingFor 
    : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName.trim(),
      age: data.age,
      genderIdentity: data.genderIdentity,
      location: data.location.trim() || null,
      lookingFor: cleanedLookingFor, // 👈 SAVE THE SAFELY CLEANED VALUE
      bio: data.bio.trim() || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}

// ACTION: Increment profile visitor counter
export async function incrementProfileViews(username: string) {
  try {
    await prisma.user.update({
      where: { username },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error("Failed to increment profile metrics view:", error);
  }
}
