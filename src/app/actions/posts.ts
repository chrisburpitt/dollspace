// src/app/actions/posts.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth"; 
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// UTILITY: Scrapes open-graph metadata headers out of a detected hyperlink string
async function scrapeUrlMetadata(url: string) {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const html = await response.text();

    const getMetaTag = (prop: string) => {
      const match = html.match(new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i")) ||
                    html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${prop}["']`, "i"));
      return match ? match[1] : null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const fallbackTitle = titleMatch ? titleMatch[1] : new URL(url).hostname;

    return {
      title: getMetaTag("og:title") || fallbackTitle,
      desc: getMetaTag("og:description") || "",
      image: getMetaTag("og:image") || null,
    };
  } catch (err) {
    console.error("Link scraper meta pass skipped:", err);
    return null;
  }
}

// ACTION: Main upgraded post processor procedure controller loop
export async function createPost(formData: FormData) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const content = (formData.get("content") as string)?.trim() || "";
  
  // 🚀 1. CAPTURE UP TO 3 UPLOADED MULTI-PART IMAGE FILE HANDLES
  const imageFiles = formData.getAll("images") as File[];
  const validFiles = imageFiles.filter(file => file && file.size > 0).slice(0, 3);

  // 🚀 2. REGEX LINK DETECTION SYSTEM
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const detectedUrl = content.match(urlRegex)?.[0];
  let metaData = null;

  if (detectedUrl) {
    metaData = await scrapeUrlMetadata(detectedUrl);
  }

  // 3. Save base records down to Neon transaction matrices
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: sessionUser.id,
      linkUrl: detectedUrl || null,
      linkTitle: metaData?.title || null,
      linkDesc: metaData?.desc || null,
      linkImage: metaData?.image || null,
    }
  });

  // 🚀 4. MULTI-PHOTO STORAGE LOOP BLOCK
  for (const file of validFiles) {
    // Reuses your existing local binary stream file writer function config from last session
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadRes = await fetch("https://uploadthing.com", {
      method: "POST",
      headers: {
        "X-Uploadthing-Api-Key": process.env.UPLOADTHING_SECRET || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ files: [{ name: file.name, size: file.size, type: file.type }] })
    });

    if (uploadRes.ok) {
      const data = await uploadRes.json();
      const fileUrl = data.files?.[0]?.url;
      if (fileUrl) {
        await prisma.postImage.create({
          data: { url: fileUrl, postId: newPost.id }
        });
      }
    }
  }

  revalidatePath("/");
  return { success: true };
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
