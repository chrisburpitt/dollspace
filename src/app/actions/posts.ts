// src/app/actions/posts.ts
"use server";

import { getCurrentUser } from "@/app/actions/auth"; 
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
export async function updateAvatar(formData: FormData, targetUserId: string) {
  // 🚀 2. SECURITY CHECK A: Fetch the true cryptographically secure logged-in user
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { error: "Unauthorized: Please log in first." };
  }

  // 🚀 3. SECURITY CHECK B: Block the request if they are trying to edit someone else's ID
  if (sessionUser.id !== targetUserId) {
    console.warn(`🚨 Security Warning: User @${sessionUser.username} tried to override target ID ${targetUserId}`);
    return { error: "Unauthorized: You do not have permission to modify this avatar image." };
  }

  const avatarFile = formData.get("avatar") as File | null;
  if (!avatarFile || avatarFile.size === 0) {
    return { error: "No image file provided." };
  }

  // Use your existing permanent cloud image pipeline helper (UploadThing API)
  const uploadedUrl = await saveImage(avatarFile, "avatars");
  if (!uploadedUrl) {
    return { error: "Failed to upload image to cloud vault." };
  }

  // 🚀 4. SAFE WRITE: Update the row, strictly bound to the verified session identity
  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { avatarUrl: uploadedUrl },
  });

  // Revalidate cache graphs instantly to flash changes across headers and cards
  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  
  return { success: true };
}

// 3. ACTION: Delete a post and remove its file asset if it exists
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

// 4. ACTION: Add or toggle a custom reaction emoji
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

// ACTION: Securely update profile landscape banner images
export async function updateBanner(formData: FormData, targetUserId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { error: "Unauthorized: Please log in first." };
  }

  // Security checkpoint ownership validation
  if (sessionUser.id !== targetUserId) {
    return { error: "Unauthorized: You do not have permission to modify this banner image." };
  }

  const bannerFile = formData.get("banner") as File | null;
  if (!bannerFile || bannerFile.size === 0) {
    return { error: "No image file provided." };
  }

  // Pass file down into your permanent UploadThing cloud pipeline helper
  const uploadedUrl = await saveImage(bannerFile, "banners");
  if (!uploadedUrl) {
    // Falls back seamlessly to a solid error log description if connection breaks
    return { error: "Failed to upload image to cloud vault." };
  }

  // Safe Write: Bound strictly to the verified session token identity
  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { bannerUrl: uploadedUrl },
  });

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  
  return { success: true };
}
