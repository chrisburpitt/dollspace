// src/app/actions/albums.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { saveImage } from "./posts"; // Utilises your existing UploadThing cloud pipeline helper

// 1. ACTION: Create a brand new empty album container row
export async function createAlbum(formData: FormData) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const privacySetting = formData.get("isPrivate") === "true"; // Reads checkbox/select lines

  if (!name) return { error: "Album name is strictly required." };

  await prisma.album.create({
    data: {
      name,
      description: description || null,
      isPrivate: privacySetting,
      userId: sessionUser.id
    }
  });

  revalidatePath("/[username]", "layout");
  return { success: true };
}

// 2. ACTION: Securely upload and attach a photo to a verified owned album container
export async function uploadPhotoToAlbum(formData: FormData, albumId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album || album.userId !== sessionUser.id) {
    return { error: "Unauthorized: You do not own this album." };
  }

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "No image file provided." };

  const uploadedUrl = await saveImage(file, "albums");
  if (!uploadedUrl) return { error: "Failed to upload image to cloud vault." };

  await prisma.photo.create({
    data: {
      url: uploadedUrl,
      albumId: album.id
    }
  });

  revalidatePath("/[username]", "layout");
  return { success: true };
}
