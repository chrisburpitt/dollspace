// src/app/actions/posts.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// Standardized single file uploader utility
export async function saveImage(file: File): Promise<string | null> {
  try {
    const response = await utapi.uploadFiles(file);
    return response.data?.url || null;
  } catch (error) {
    console.error("UploadThing SDK pipeline crash:", error);
    return null;
  }
}

// UTILITY: Hotlink-Proof Scraper Helper
async function scrapeUrlMetadata(url: string) {
  try {
    const baseUrl = new URL(url);
    
    // Emulate a genuine browser visit precisely to stop bot blockers
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      },
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();

    const getMetaTag = (prop: string): string | null => {
      const regex = new RegExp(`<meta[^>]*?(?:property|name)=["']${prop}["'][^>]*?content=["']([^"']*)["']`, "i");
      const match = html.match(regex);
      if (!match) {
        const reversedRegex = new RegExp(`<meta[^>]*?content=["']([^"']*)["'][^>]*?(?:property|name)=["']${prop}["']`, "i");
        const revMatch = html.match(reversedRegex);
        return revMatch ? revMatch[1] : null;
      }
      return match[1];
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    let rawTitle = getMetaTag("og:title") || (titleMatch ? titleMatch[1] : baseUrl.hostname);
    let rawDesc = getMetaTag("og:description") || getMetaTag("description") || "";
    let rawImage = getMetaTag("og:image");

    const decodeEntities = (str: string) => {
      return str
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    };

    // Format relative paths to absolute URLs immediately
    if (rawImage && !rawImage.startsWith("http")) {
      if (rawImage.startsWith("//")) {
        rawImage = `${baseUrl.protocol}${rawImage}`;
      } else if (rawImage.startsWith("/")) {
        rawImage = `${baseUrl.origin}${rawImage}`;
      } else {
        rawImage = `${baseUrl.origin}/${rawImage}`;
      }
    }

    let finalCloudImageUrl: string | null = null;

    // 🚀 THE HOTLINK FIX: Download the image server-side and upload it to your own UploadThing storage!
    if (rawImage) {
      try {
        const imgResponse = await fetch(rawImage, {
          headers: { "User-Agent": "Mozilla/5.0" },
          cache: "no-store"
        });
        
        if (imgResponse.ok) {
          const contentType = imgResponse.headers.get("content-type") || "image/jpeg";
          const blob = await imgResponse.blob();
          
          // Reconstruct as a secure file handle
          const extension = contentType.split("/")[1] || "jpg";
          const parsedFile = new File([blob], `preview-thumb-${Date.now()}.${extension}`, { type: contentType });
          
          // Push it straight into your official UTApi instance
          const cloudUpload = await utapi.uploadFiles(parsedFile);
          if (cloudUpload.data?.url) {
            finalCloudImageUrl = cloudUpload.data.url;
          }
        }
      } catch (imgErr) {
        console.error("Server-side thumbnail download failed, falling back to favicon:", imgErr);
      }
    }

    // High-resolution Google Favicon Engine Fallback if all else fails
    if (!finalCloudImageUrl) {
      finalCloudImageUrl = `https://google.com{baseUrl.hostname}`;
    }

    return {
      title: decodeEntities(rawTitle).trim(),
      desc: decodeEntities(rawDesc).trim(),
      image: finalCloudImageUrl,
    };
  } catch (err) {
    console.error("Link scraper fallback triggered:", err);
    try {
      const fallbackUrl = new URL(url);
      return {
        title: fallbackUrl.hostname,
        desc: "Click to open external web link safely inside a new tab space.",
        image: `https://google.com{fallbackUrl.hostname}`
      };
    } catch {
      return null;
    }
  }

// ACTION: Main upgraded post processor procedure controller loop
export async function createPost(formData: FormData) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const content = (formData.get("content") as string)?.trim() || "";
  
  // Capture up to 3 uploaded multi-part image file handles
  const imageFiles = formData.getAll("images") as File[];
  const validFiles = imageFiles.filter(file => file && file.size > 0).slice(0, 3);

  // Regex Link Detection System
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const detectedMatches = content.match(urlRegex);
  
  // 🚀 FIXED: Grab the first matched URL string item out of the matches array
  const detectedUrl = detectedMatches ? detectedMatches[0] : null;
  let metaData = null;

  if (detectedUrl) {
    metaData = await scrapeUrlMetadata(detectedUrl);
  }

  // Save base records down to Neon transaction matrices
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: sessionUser.id,
      linkUrl: detectedUrl, // 🎯 Typesafe string mapping matching Prisma rules
      linkTitle: metaData?.title || null,
      linkDesc: metaData?.desc || null,
      linkImage: metaData?.image || null,
    }
  });

  // HIGH-SPEED MULTI-PHOTO UPLOAD GRID LOOP
  if (validFiles.length > 0) {
    try {
      const uploadResponses = await utapi.uploadFiles(validFiles);
      const responsesArray = Array.isArray(uploadResponses) ? uploadResponses : [uploadResponses];

      for (const res of responsesArray) {
        if (res.data?.url) {
          await prisma.postImage.create({
            data: { 
              url: res.data.url, 
              postId: newPost.id 
            }
          });
        }
      }
    } catch (utErr) {
      console.error("Batch media stream processing error:", utErr);
    }
  }

  revalidatePath("/");
  return { success: true };
}

// ACTION: Securely delete a post if the session user is the true creator
export async function deletePost(postId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized: Please log in first." };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found." };
  if (post.userId !== sessionUser.id) return { error: "Unauthorized: You do not own this post." };

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  return { success: true };
}

// ACTION: Standardized reactions query to match native Neon columns
export async function toggleReaction(postId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized: Please log in first." };

  const existingReaction = await prisma.reaction.findFirst({
    where: {
      postId,
      userId: sessionUser.id
    }
  });

  if (existingReaction) {
    await prisma.reaction.delete({ where: { id: existingReaction.id } });
  } else {
    await prisma.reaction.create({
      data: {
        postId,
        userId: sessionUser.id,
        emoji: "❤️"
      }
    });

    const postOwner = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (postOwner && postOwner.userId !== sessionUser.id) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          recipientId: postOwner.userId,
          issuerId: sessionUser.id,
          postId
        }
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  return { success: true };
}

// ACTION: Securely update profile landscape banner images
export async function updateBanner(formData: FormData, targetUserId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized: Please log in first." };
  if (sessionUser.id !== targetUserId) return { error: "Unauthorized." };

  const bannerFile = formData.get("banner") as File | null;
  if (!bannerFile || bannerFile.size === 0) return { error: "No image file provided." };

  const uploadedUrl = await saveImage(bannerFile);
  if (!uploadedUrl) return { error: "Failed to upload image to cloud vault." };

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { bannerUrl: uploadedUrl },
  });

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  return { success: true };
}

// ACTION: Securely update a user's circular profile avatar image asset link
export async function updateAvatar(formData: FormData, targetUserId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized: Please log in first." };
  if (sessionUser.id !== targetUserId) return { error: "Unauthorized." };

  const avatarFile = formData.get("avatar") as File | null;
  if (!avatarFile || avatarFile.size === 0) return { error: "No image file provided." };

  const uploadedUrl = await saveImage(avatarFile);
  if (!uploadedUrl) return { error: "Failed to upload image to cloud vault." };

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { avatarUrl: uploadedUrl },
  });

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  return { success: true };
}
