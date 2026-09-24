"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function saveImage(file: File): Promise<string | null> {
  try {
    const response = await utapi.uploadFiles(file);
    return response.data?.url || null;
  } catch (error) {
    console.error("UploadThing SDK pipeline crash:", error);
    return null;
  }
}

function extractUploadThingKey(url: string | null): string | null {
  if (!url) return null;
  const splitParts = url.split("/f/");
  return splitParts.length > 1 ? splitParts[1] : null;
}

// 🎯 THE INDESTRUCTIBLE METADATA SCRAPER
async function scrapeUrlMetadata(url: string) {
  // 🚀 AIRTIGHT VALIDATION GATE: 
  // If the link text is a relative route slug (like "/Chloe") instead of an absolute link,
  // skip the scraper completely to prevent ERR_INVALID_URL server crashes!
  if (!url || !url.startsWith("http://") && !url.startsWith("https://")) {
    return null;
  }

  try {
    const baseUrl = new URL(url);
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
      return str.replace(/'/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    };

    if (rawImage && !rawImage.startsWith("http")) {
      if (rawImage.startsWith("//")) rawImage = `${baseUrl.protocol}${rawImage}`;
      else if (rawImage.startsWith("/")) rawImage = `${baseUrl.origin}${rawImage}`;
      else rawImage = `${baseUrl.origin}/${rawImage}`;
    }

    let finalCloudImageUrl: string | null = null;
    if (rawImage) {
      try {
        const imgResponse = await fetch(rawImage, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
        if (imgResponse.ok) {
          const contentType = imgResponse.headers.get("content-type") || "image/jpeg";
          const blob = await imgResponse.blob();
          const extension = contentType.split("/")[1] || "jpg";
          const parsedFile = new File([blob], `preview-thumb-${Date.now()}.${extension}`, { type: contentType });
          const cloudUpload = await utapi.uploadFiles(parsedFile);
          if (cloudUpload.data?.url) finalCloudImageUrl = cloudUpload.data.url;
        }
      } catch (imgErr) {
        console.error(imgErr);
      }
    }
    if (!finalCloudImageUrl) finalCloudImageUrl = `https://google.com{baseUrl.hostname}`;

    return { title: decodeEntities(rawTitle).trim(), desc: decodeEntities(rawDesc).trim(), image: finalCloudImageUrl };
  } catch (err) {
    console.error(err);
    try {
      const fallbackUrl = new URL(url);
      return { title: fallbackUrl.hostname, desc: "Click to open external web link safely inside a new tab space.", image: `https://google.com{fallbackUrl.hostname}` };
    } catch {
      return null;
    }
  }
}

export async function createPost(formData: FormData) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const content = (formData.get("content") as string)?.trim() || "";
  const imageFiles = formData.getAll("images") as File[];
  const validFiles = imageFiles.filter(file => file && file.size > 0).slice(0, 3);

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const detectedMatches = content.match(urlRegex);
  const detectedUrl = detectedMatches ? detectedMatches[0] : null;
  let metaData = null;

  if (detectedUrl) metaData = await scrapeUrlMetadata(detectedUrl);

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: sessionUser.id,
      linkUrl: detectedUrl,
      linkTitle: metaData?.title || null,
      linkDesc: metaData?.desc || null,
      linkImage: metaData?.image || null,
    }
  });

  if (validFiles.length > 0) {
    try {
      const uploadResponses = await utapi.uploadFiles(validFiles);
      const responsesArray = Array.isArray(uploadResponses) ? uploadResponses : [uploadResponses];
      for (const res of responsesArray) {
        if (res.data?.url) {
          await prisma.postImage.create({ data: { url: res.data.url, postId: newPost.id } });
        }
      }
    } catch (utErr) {
      console.error(utErr);
    }
  }

  revalidatePath("/");
  return { success: true };
}

export async function deletePost(postId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized: Please log in first." };

  const post = await prisma.post.findUnique({ where: { id: postId }, include: { images: true } });
  if (!post) return { error: "Post not found." };
  if (post.userId !== sessionUser.id) return { error: "Unauthorized: You do not own this post." };

  try {
    const keysToDelete: string[] = [];
    if (post.images && post.images.length > 0) {
      post.images.forEach((img) => {
        const fileKey = extractUploadThingKey(img.url);
        if (fileKey) keysToDelete.push(fileKey);
      });
    }
    if ((post as any).imageUrl) {
      const legacyKey = extractUploadThingKey((post as any).imageUrl);
      if (legacyKey) keysToDelete.push(legacyKey);
    }
    if (post.linkImage) {
      const scrapedKey = extractUploadThingKey(post.linkImage);
      if (scrapedKey) keysToDelete.push(scrapedKey);
    }

    if (keysToDelete.length > 0) await utapi.deleteFiles(keysToDelete);
    await prisma.post.delete({ where: { id: postId } });

    revalidatePath("/");
    revalidatePath("/[username]", "layout");
    return { success: true };
  } catch (err) {
    console.error(err);
    await prisma.post.delete({ where: { id: postId } }).catch(() => {});
    revalidatePath("/");
    revalidatePath("/[username]", "layout");
    return { success: true };
  }
}

export async function toggleReaction(postId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized: Please log in first." };

  const existingReaction = await prisma.reaction.findFirst({ where: { postId, userId: sessionUser.id } });
  if (existingReaction) {
    await prisma.reaction.delete({ where: { id: existingReaction.id } });
  } else {
    await prisma.reaction.create({ data: { postId, userId: sessionUser.id, emoji: "❤️" } });
    const postOwner = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (postOwner && postOwner.userId !== sessionUser.id) {
      await prisma.notification.create({ data: { type: "LIKE", recipientId: postOwner.userId, issuerId: sessionUser.id, postId } });
    }
  }
  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  return { success: true };
}

export async function updateBanner(formData: FormData, targetUserId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.id !== targetUserId) return { error: "Unauthorized." };
  const bannerFile = formData.get("banner") as File | null;
  if (!bannerFile || bannerFile.size === 0) return { error: "No image file provided." };
  const uploadedUrl = await saveImage(bannerFile);
  if (!uploadedUrl) return { error: "Failed to upload image." };
  await prisma.user.update({ where: { id: sessionUser.id }, data: { bannerUrl: uploadedUrl } });
  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  return { success: true };
}

export async function updateAvatar(formData: FormData, targetUserId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.id !== targetUserId) return { error: "Unauthorized." };
  const avatarFile = formData.get("avatar") as File | null;
  if (!avatarFile || avatarFile.size === 0) return { error: "No image file provided." };
  const uploadedUrl = await saveImage(avatarFile);
  if (!uploadedUrl) return { error: "Failed to upload image." };
  await prisma.user.update({ where: { id: sessionUser.id }, data: { avatarUrl: uploadedUrl } });
  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  return { success: true };
}
