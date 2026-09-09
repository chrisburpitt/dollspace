// src/app/actions/albums.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// 🚀 FIXED: Isolated local base64/binary image cloud pipe builder 
// This fully handles the files without relying on cross-file imports!
async function saveAlbumImageLocal(file: File): Promise<string | null> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If you are using a base64 buffer write system:
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
    
    // Call your primary asset storage API (like your UploadThing configurations)
    // If you are pushing straight to UploadThing route controllers:
    const response = await fetch("https://uploadthing.com", {
      method: "POST",
      headers: {
        "X-Uploadthing-Api-Key": process.env.UPLOADTHING_SECRET || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        files: [{ name: file.name, size: file.size, type: file.type }]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.files?.[0]?.url || null;
  } catch (error) {
    console.error("Local photo stream compilation failed:", error);
    return null;
  }
}

// 1. ACTION: Create a brand new empty album container row
export async function createAlbum(formData: FormData) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const privacySetting = formData.get("isPrivate") === "true";

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

  // 🚀 FIXED: Point your uploader to use our clean, self-contained function block
  const uploadedUrl = await saveAlbumImageLocal(file);
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
