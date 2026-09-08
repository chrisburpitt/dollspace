// src/app/actions/posts.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// Updated hybrid helper function to handle both local file system and cloud uploads smoothly
async function saveImage(file: File | null, folderName: string): Promise<string | null> {
  if (!file || file.size === 0 || !file.name) return null;

  // 🚀 VERCEL PRODUCTION ENVIRONMENT DETECTOR SWITCH
  if (process.env.NODE_ENV === "production" || process.env.UPLOADTHING_TOKEN) {
    try {
      const uploadResult = await utapi.uploadFiles(file);
      if (uploadResult.data?.url) {
        return uploadResult.data.url; // Returns the permanent cloud secure CDN link!
      }
    } catch (error) {
      console.error("Cloud upload error, falling back to local layout:", error);
    }
  }

  // Local Development Hard Drive Fallback
  const uploadDir = path.join(process.cwd(), "public", "uploads", folderName);
  await fs.mkdir(uploadDir, { recursive: true });

  const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${folderName}/${uniqueFilename}`;
}

// 1. ACTION: Create a Post with an optional image attachment
export async function createPost(formData: FormData, userId: string) {
  const content = formData.get("content") as string;
  const imageFile = formData.get("image") as File | null;

  if ((!content || content.trim() === "") && (!imageFile || imageFile.size === 0)) return;

  // Save image if present
  const imageUrl = await saveImage(imageFile, "posts");

  await prisma.post.create({
    data: {
      content: content || "",
      imageUrl,
      userId,
    },
  });

  revalidatePath("/");
}

// 2. ACTION: Update a user's avatar image
export async function updateAvatar(formData: FormData, userId: string) {
  const avatarFile = formData.get("avatar") as File | null;
  if (!avatarFile || avatarFile.size === 0) return;

  const avatarUrl = await saveImage(avatarFile, "avatars");

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });

  // Revalidate both home feed and dynamic profile paths
  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}

// 1. ACTION: Delete a post and remove its file asset if it exists
export async function deletePost(postId: string, currentUserId: string) {
  // Fetch post to confirm ownership and see if it contains an image file asset
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post || post.userId !== currentUserId) return;

  // Clean up physical file asset from public directory if present
  if (post.imageUrl) {
    try {
      const fullPath = path.join(process.cwd(), "public", post.imageUrl);
      await fs.unlink(fullPath);
    } catch (e) {
      console.log("File already removed or missing on disc");
    }
  }

  // Delete from database (Prisma handles cleaning the Reaction table automatically due to Cascade)
  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/");
}

// 2. ACTION: Add or toggle a custom reaction emoji
export async function toggleReaction(postId: string, userId: string, emoji: string) {
  // Check if this user already placed this exact emoji on the post
  const existing = await prisma.reaction.findFirst({
    where: { postId, userId, emoji },
  });

  if (existing) {
    // If it exists, clicking it again toggles it off
    await prisma.reaction.delete({
      where: { id: existing.id },
    });
  } else {
    // Otherwise, create the custom string row
    await prisma.reaction.create({
      data: { postId, userId, emoji },
    });
  }

  revalidatePath("/");
}

