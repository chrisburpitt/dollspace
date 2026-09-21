"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

// 🚀 1. ACTION: Update profile values securely from modal settings layout fields
export async function updateProfile(formData: FormData) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;
  const location = formData.get("location") as string;
  const genderIdentity = formData.get("genderIdentity") as string;
  const lookingFor = formData.get("lookingFor") as string;
  
  // Grab fresh input strings from your form layout fields
  const birthdayRaw = formData.get("birthday") as string; // Expects "YYYY-MM-DD"
  const instagram = formData.get("instagramHandle") as string;
  const facebook = formData.get("facebookHandle") as string;

  try {
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        displayName: displayName?.trim() || sessionUser.displayName,
        bio: bio?.trim() || "",
        location: location?.trim() || null,
        genderIdentity: genderIdentity?.trim() || null,
        lookingFor: lookingFor?.trim() || null,
        
        // TYPESAFE ATTACHMENTS: Map directly into your new Prisma schema columns
        birthday: birthdayRaw ? new Date(birthdayRaw) : null,
        instagramHandle: instagram ? instagram.trim().replace(/@/g, "") : null,
        facebookHandle: facebook ? facebook.trim() : null
      }
    });

    revalidatePath(`/${sessionUser.username}`);
    return { success: true };
  } catch (err) {
    console.error("Profile mutation transaction failed:", err);
    return { error: "Failed to rewrite profile directory rows." };
  }
}

// 🚀 2. ACTION: Atomically increment profile view logs upon client-side hit initialization
export async function incrementProfileViews(targetUserId: string, viewerId: string) {
  // Prevent view count exploitation from inflating if they reload their own layout card
  if (targetUserId === viewerId) return;

  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        views: {
          increment: 1 // Atomic execution: Increments the view field by 1 safely inside Neon PostgreSQL
        }
      }
    });
  } catch (error) {
    console.error("Failed to process atomic profile view log:", error);
  }
}
