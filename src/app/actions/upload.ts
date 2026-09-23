"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
// 🎯 INTER-ACTION REUSE HANDSHAKE:
// Imports your existing, production-proven UploadThing pipeline helper!
import { saveImage } from "@/app/actions/posts"; 

/**
 * Catches the processed JPEG binary file stream coming directly from the 
 * Canvas Avatar Studio, passes it to your posts file's upload utility, 
 * and updates the user model's avatarUrl record inside Neon PostgreSQL.
 */
export async function uploadUserProfilePictureAction(formData: FormData) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || !sessionUser.id) {
    return { error: "Unauthorized access path. Please log in again." };
  }

  try {
    const rawFileItem = formData.get("avatar") as File | null;
    if (!rawFileItem) {
      return { error: "No image file attachment found in payload arrays." };
    }

    // 🚀 THE MAGIC LINK: Pipes the Canvas Studio file handle directly 
    // into your standardized saveImage pipeline!
    const publicAccessibleMediaAssetUrl = await saveImage(rawFileItem);

    if (!publicAccessibleMediaAssetUrl) {
      return { error: "UploadThing SDK rejected media stream upload parameters." };
    }

    // ⚡ ATOMIC DATABASE UPDATE: Save the permanent link to Kate's profile row
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        avatarUrl: publicAccessibleMediaAssetUrl,
        lastActive: new Date()
      }
    });

    // Clear dynamic routing layouts and user profile data streams globally
    revalidatePath("/", "layout");
    revalidatePath(`/settings`);
    revalidatePath(`/${sessionUser.username}`);

    return { success: true, avatarUrl: publicAccessibleMediaAssetUrl };
  } catch (err) {
    console.error("Consolidated avatar save transaction failed:", err);
    return { error: "Failed to process transformed avatar asset data on your UploadThing storage bucket." };
  }
}
