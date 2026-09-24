"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { saveImage } from "@/app/actions/posts"; 
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// 🎯 INTERNAL KEY EXTRACTOR HOOK:
// Isolates unique UploadThing file names from permanent storage URLs to prevent missing reference crashes!
function extractUploadThingKey(url: string | null): string | null {
  if (!url) return null;
  const splitParts = url.split("/f/");
  return splitParts.length > 1 ? splitParts[1] : null;
}

export async function submitDotwPhotoAction(file: File) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized access path." };

  try {
    const existing = await prisma.dollOfTheWeekEntry.findUnique({
      where: { userId: currentUser.id }
    });
    if (existing) {
      return { error: "You have already submitted your photo for this week's cycle! 🎀" };
    }

    const originalExtension = file.name.split('.').pop() || "jpg";
    const customNamedFile = new File(
      [file], 
      `dotw_${currentUser.id}_${Date.now()}.${originalExtension}`, 
      { type: file.type }
    );

    const permanentCloudImageUrl = await saveImage(customNamedFile);
    if (!permanentCloudImageUrl) {
      return { error: "UploadThing SDK rejected your tournament photo stream." };
    }

    const entry = await prisma.dollOfTheWeekEntry.create({
      data: { 
        userId: currentUser.id, 
        imageUrl: permanentCloudImageUrl 
      }
    });

    revalidatePath("/");
    return { success: true, entry };
  } catch (err) {
    console.error("DOTW Submission error:", err);
    return { error: "Failed to upload competition photo." };
  }
}

export async function getRandomDotwCandidate() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  try {
    const userEntry = await prisma.dollOfTheWeekEntry.findUnique({
      where: { userId: currentUser.id }
    });
    
    // 🛡️ Fault-Tolerant Gate: If the current user hasn't uploaded a photo yet, return early gracefully!
    if (!userEntry) return { requiresSubmission: true };

    const excludedIds = [currentUser.id, ...userEntry.votedEntryIds];
    const eligibleCandidates = await prisma.dollOfTheWeekEntry.findMany({
      where: { userId: { notIn: excludedIds } },
      select: { id: true, imageUrl: true }
    });

    if (eligibleCandidates.length === 0) return { outOfCandidates: true };

    const randomCandidate = eligibleCandidates[Math.floor(Math.random() * eligibleCandidates.length)];
    return { success: true, candidate: randomCandidate };
  } catch (err) {
    console.error("Failed to retrieve candidate entries:", err);
    return null;
  }
}

export async function castDotwVote(targetEntryId: string, voteType: "DOLL" | "DULL") {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized." };

  try {
    const targetCheck = await prisma.dollOfTheWeekEntry.findUnique({ where: { id: targetEntryId } });
    if (!targetCheck) return { error: "Target competitor look no longer exists." };

    await prisma.dollOfTheWeekEntry.update({
      where: { id: targetEntryId },
      data: {
        dollVotes: voteType === "DOLL" ? { increment: 1 } : undefined,
        dullVotes: voteType === "DULL" ? { increment: 1 } : undefined
      }
    });

    await prisma.dollOfTheWeekEntry.update({
      where: { userId: currentUser.id },
      data: { votedEntryIds: { push: targetEntryId } }
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to cast vote." };
  }
}

export async function compileWeeklyDotwWinnerAndReset() {
  try {
    const topDoll = await prisma.dollOfTheWeekEntry.findFirst({
      orderBy: { dollVotes: "desc" },
      include: { user: true }
    });

    const allEntries = await prisma.dollOfTheWeekEntry.findMany({});
    const keysToPurge: string[] = [];
    
    allEntries.forEach((entry) => {
      if (topDoll && entry.id === topDoll.id) return; 
      const fileKey = extractUploadThingKey(entry.imageUrl);
      if (fileKey) keysToPurge.push(fileKey);
    });

    if (keysToPurge.length > 0) {
      await utapi.deleteFiles(keysToPurge).catch((utErr) => console.error(utErr));
    }

    if (topDoll && topDoll.dollVotes > 0) {
      // 🚀 THE UN-SPOOFABLE SYSTEM INJECTION:
      // 1. Locate your master Dollspace Admin profile row inside your Neon tables
      const systemAdminProfile = await prisma.user.findFirst({
        where: { role: "ADMIN" } // Looks up your master system administrator account handle
      });

      // 2. Publish the tournament announcement straight out from the official Admin persona!
      await prisma.post.create({
        data: {
          // Falls back to topDoll if admin isn't instantiated, keeping it bulletproof
          userId: systemAdminProfile?.id || topDoll.userId, 
          content: `👑👑 DOLL OF THE WEEK REVEAL: Congratulations to @${topDoll.user.username}! She was just crowned Doll of the Week with an amazing ${topDoll.dollVotes} total ✨ DOLL votes! 🩰🌸\n\n👉 Click here to celebrate her look: https://vercel.app{topDoll.user.username}`,
          
          // 🎯 REMOVED THE EXT LINK BOX: Setting these to null explicitly 
          // commands PostCard to completely skip drawing the link preview module!
          linkUrl: null,
          linkTitle: null,
          linkDesc: null,
          linkImage: null,
          
          // ⚡ TYPE ENFORCEMENT LAYER: Marks this record as an official template 
          // (Ensure your Prisma Schema Post model has type String @default("STANDARD"))
          type: "ANNOUNCEMENT" 
        }
      });
    }

    await prisma.dollOfTheWeekEntry.deleteMany({});
    revalidatePath("/");
    return { success: true, winner: topDoll?.user?.username || "None" };
  } catch (err) {
    console.error("Weekly reset failed:", err);
    return { error: "Reset transaction execution crashed." };
  }
}