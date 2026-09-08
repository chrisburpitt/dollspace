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
    bio: string;
    lookingFor: string;
  }
) {
  if (!data.displayName.trim()) {
    return { error: "Display name cannot be empty." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName.trim(),
      age: data.age,
      genderIdentity: data.genderIdentity.trim() || null,
      location: data.location.trim() || null,
      bio: data.bio.trim() || null,
      lookingFor: data.lookingFor || null,
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
