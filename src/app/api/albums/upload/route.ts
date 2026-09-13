// src/app/api/albums/upload/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized access path" }, { status: 401 });
    }

    const { photoBase64, albumId } = await request.json();
    if (!photoBase64 || !albumId) {
      return NextResponse.json({ error: "Missing required payload parameters" }, { status: 400 });
    }

    // 1. Verify the active user actually owns the target album before appending photos
    const album = await prisma.album.findFirst({
      where: { id: albumId, userId: sessionUser.id }
    });
    if (!album) {
      return NextResponse.json({ error: "Album mismatch or unauthorized" }, { status: 403 });
    }

    // 🚀 YOUR UPLOADTHING/STORAGE CONNECTOR PIPELINE GOES HERE
    // For now, we simulate your asset link pipeline or drop the string straight to your bucket nodes.
    // Replace 'photoBase64' with your native UploadThing return URL if piping via uploadthing buckets.
    const mockStorageUrl = photoBase64; 

    // 2. Insert a clean photo row record straight into your Neon cloud database tables
    const newPhotoRow = await prisma.photo.create({
      data: {
        url: mockStorageUrl,
        albumId: albumId
      }
    });

    return NextResponse.json({ success: true, photo: newPhotoRow });
  } catch (err) {
    console.error("API critical album upload handler failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
