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

// UTILITY: Scrapes open-graph metadata headers out of a detected hyperlink string - Upgraded
async function scrapeUrlMetadata(url: string) {
  try {
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 3600 } });
    const html = await response.text();
    const baseUrl = new URL(url);

    // 🚀 IMPROVED STRIPPER FUNCTION: Extracts and cleans absolute URLs from meta tags
    const getMetaTag = (prop: string): string | null => {
      const regex = new RegExp(`<meta[^>]*?(?:property|name)=["']${prop}["'][^>]*?content=["']([^"']*)["']`, "i");
      const match = html.match(regex);
      if (!match) {
        // Double pass fallback check for reversed attribute orders
        const reversedRegex = new RegExp(`<meta[^>]*?content=["']([^"']*)["'][^>]*?(?:property|name)=["']${prop}["']`, "i");
        const revMatch = html.match(reversedRegex);
        if (!revMatch) return null;
        return revMatch[1];
      }
      return match[1];
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    let rawTitle = getMetaTag("og:title") || (titleMatch ? titleMatch[1] : baseUrl.hostname);
    let rawDesc = getMetaTag("og:description") || getMetaTag("description") || "";
    let rawImage = getMetaTag("og:image");

    // 🎯 CLEANUP ENGINE A: Convert HTML entities (like &#039; to true clean apostrophes)
    const decodeEntities = (str: string) => {
      return str
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    };

    // 🎯 CLEANUP ENGINE B: Convert relative image paths into absolute high-res URLs
    if (rawImage && !rawImage.startsWith("http")) {
      if (rawImage.startsWith("//")) {
        rawImage = `${baseUrl.protocol}${rawImage}`;
      } else if (rawImage.startsWith("/")) {
        rawImage = `${baseUrl.origin}${rawImage}`;
      } else {
        rawImage = `${baseUrl.origin}/${rawImage}`;
      }
    }

    return {
      title: decodeEntities(rawTitle).trim(),
      desc: decodeEntities(rawDesc).trim(),
      image: rawImage ? rawImage.trim() : null,
    };
  } catch (err) {
    console.error("Link scraper failed cleanly:", err);
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
