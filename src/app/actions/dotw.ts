"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// 1. SUBMIT PHOTO ENTRY FOR THE CYCLE
export async function submitDotwPhoto(imageUrl: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized" };

  try {
    const existing = await prisma.dollOfTheWeekEntry.findUnique({
      where: { userId: currentUser.id }
    });
    if (existing) return { error: "You have already submitted your photo for this week's cycle! 🎀" };

    const entry = await prisma.dollOfTheWeekEntry.create({
      data: { userId: currentUser.id, imageUrl }
    });

    revalidatePath("/");
    return { success: true, entry };
  } catch (err) {
    console.error("DOTW Submission error:", err);
    return { error: "Failed to upload competition photo." };
  }
}

// 2. GET BLIND RANDOM COMPETING CARD TO VOTE ON
export async function getRandomDotwCandidate() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  try {
    const userEntry = await prisma.dollOfTheWeekEntry.findUnique({
      where: { userId: currentUser.id }
    });
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
    return null;
  }
}

// 3. PROCESS THE CAST VOTE OPERATIONAL EVENT LOG
export async function castDotwVote(targetEntryId: string, voteType: "DOLL" | "DULL") {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized" };

  try {
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
    return { error: "Failed to cast vote." };
  }
}

// 4. WEEKLY RESET CRON CONTROLLER ENGINE PIPELINE ROUTINE
export async function compileWeeklyDotwWinnerAndReset() {
  try {
    const topDoll = await prisma.dollOfTheWeekEntry.findFirst({
      orderBy: { dollVotes: "desc" },
      include: { user: true }
    });

    if (topDoll && topDoll.dollVotes > 0) {
      // 🚀 FIXED: Swapped 'internalPost.create' for 'post.create' to map seamlessly onto your exact Prisma Client properties tree!
      await prisma.post.create({
        data: {
          userId: topDoll.userId,
          content: `👑👑 DOLL OF THE WEEK REVEAL: Congratulations to @${topDoll.user.username}! She was just crowned Doll of the Week with an amazing ${topDoll.dollVotes} total ✨ DOLL votes! 🩰🌸`,
          linkUrl: `/${topDoll.user.username}`,
          images: {
            create: { url: topDoll.imageUrl }
          }
        }
      });
    }

    // Completely clear staging table matrix entries to let the next weekly cycle begin clean
    await prisma.dollOfTheWeekEntry.deleteMany({});
    
    revalidatePath("/");
    return { success: true, winner: topDoll?.user?.username || "None" };
  } catch (err) {
    console.error("Weekly reset failed:", err);
    return { error: "Reset transaction execution crashed." };
  }
}
