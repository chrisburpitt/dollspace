"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { saveImage } from "@/app/actions/posts"; 
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

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
    
    if (!userEntry) return { requiresSubmission: true };

    const excludedIds = [currentUser.id, ...userEntry.votedEntryIds];
    
    // 1. Look for any active competitors the doll hasn't ranked yet
    const eligibleCandidates = await prisma.dollOfTheWeekEntry.findMany({
      where: { userId: { notIn: excludedIds } },
      select: { id: true, imageUrl: true }
    });

    if (eligibleCandidates.length > 0) {
      const randomCandidate = eligibleCandidates[Math.floor(Math.random() * eligibleCandidates.length)];
      return { success: true, candidate: randomCandidate };
    }

    // 🚀 THE SELF-PREVIEW FALLBACK INTERCEPTOR:
    // If we reach this line, the user has voted on all active available contestants!
    // Instead of bailing out with an outOfCandidates text prompt, we gracefully pass back 
    // their own entered picture to keep the visual display stunningly active on the widget card!
    if (userEntry.imageUrl) {
      return { 
        success: true, 
        candidate: {
          id: userEntry.id, 
          imageUrl: userEntry.imageUrl,
          isSelfFallback: true // 🎯 Flag option parameter signals the front-end it's their own look!
        } 
      };
    }

    return { outOfCandidates: true };
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

    // 🛡️ Safe Guard: If voting on your own fallback image preview, ignore increments to protect vote metrics integrity!
    if (targetCheck.userId === currentUser.id) {
      return { success: true, isSelfFallbackVote: true };
    }

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
      await utapi.deleteFiles(keysToPurge).catch((utErr) => console.error("Cloud storage purge error:", utErr));
    }

    if (topDoll && topDoll.dollVotes > 0) {
      const systemAdminProfile = await prisma.user.findFirst({
        where: { role: "ADMIN" }
      });

      await prisma.post.create({
        data: {
          userId: systemAdminProfile?.id || topDoll.userId, 
          content: `👑👑 DOLL OF THE WEEK REVEAL: Congratulations to @${topDoll.user.username}! She was just crowned Doll of the Week with an amazing ${topDoll.dollVotes} total ✨ DOLL votes! 🩰🌸\n\n👉 Click here to celebrate her look: https://vercel.app{topDoll.user.username}`,
          linkUrl: null,
          linkTitle: null,
          linkDesc: null,
          linkImage: null
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

export async function deleteDotwEntryAction() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized: Please log in first." };

  try {
    // 1. Locate the current doll's active tournament submission entry record
    const entry = await prisma.dollOfTheWeekEntry.findUnique({
      where: { userId: sessionUser.id }
    });

    if (!entry) return { error: "No active tournament entry found to remove." };

    // 2. Extract and parse the unique UploadThing reference key from the image URL string
    const cloudFileKey = extractUploadThingKey(entry.imageUrl);
    if (cloudFileKey) {
      // Cleanly purge the raw file from your live cloud asset storage buckets
      await utapi.deleteFiles(cloudFileKey).catch((utErr) => 
        console.error("UploadThing file deletion rejected:", utErr)
      );
    }

    // 3. Delete the configuration entry row from your database schema rows cleanly
    await prisma.dollOfTheWeekEntry.delete({
      where: { userId: sessionUser.id }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete DOTW contest look:", err);
    return { error: "Database transaction execution crashed." };
  }
}
