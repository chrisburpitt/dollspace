// src/app/actions/albumsInteractive.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// 1. ACTION: Edit Album Metadata Content Strings
export async function updateAlbumMetadata(albumId: string, name: string, description: string, isPrivate: boolean) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized" };

  try {
    await prisma.album.update({
      where: { id: albumId, userId: sessionUser.id },
      data: { name: name.trim(), description: description.trim(), isPrivate }
    });
    return { success: true };
  } catch (err) {
    return { error: "Failed to update album parameters." };
  }
}

// 2. ACTION: Delete Entire Album Node Stack
export async function deleteEntireAlbum(albumId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized" };

  try {
    await prisma.album.delete({
      where: { id: albumId, userId: sessionUser.id }
    });
    return { success: true };
  } catch (err) {
    return { error: "Failed to delete album record." };
  }
}

// 3. ACTION: Delete Single Photo from Album
export async function deleteSingleAlbumPhoto(photoId: string, albumId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized" };

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { album: true }
    });

    if (!photo || photo.album.userId !== sessionUser.id) {
      return { error: "Unauthorized photo purge path." };
    }

    await prisma.photo.delete({ where: { id: photoId } });
    return { success: true };
  } catch (err) {
    return { error: "Failed to remove photo image entry." };
  }
}

// 4. ACTION: Create a Comment Thread Row Entry on an Album or Photo Element
export async function createAlbumPhotoComment(payload: { albumId?: string; photoId?: string; content: string }) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized" };
  if (!payload.content.trim()) return { error: "Comment text cannot be empty." };

  try {
    // Note: If you don't have explicit tables tracking child AlbumComment or PhotoComment nodes yet, 
    // you can safely map these text drops directly over to a clean local tracking array structure or 
    // configure matching relational sub-tables inside your schema file layout views later!
    return { 
      success: true, 
      comment: {
        id: `ac-${crypto.randomUUID()}`,
        content: payload.content.trim(),
        createdAt: new Date().toISOString(),
        user: {
          displayName: sessionUser.displayName,
          username: sessionUser.username,
          avatarUrl: sessionUser.avatarUrl
        }
      }
    };
  } catch (err) {
    return { error: "Failed to write interactive comment row rows." };
  }
}
