// src/app/actions/moderation.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// Helper Check: Validates if the active session possesses high-level admin authorization tokens
async function verifyAdminCheckpoint() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return null;
  
  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { role: true }
  });
  
  if (dbUser?.role !== "ADMIN" && dbUser?.role !== "MODERATOR") return null;
  return sessionUser;
}

// 1. ACTION: Ban and blacklist a disruptive profile permanently out of the cluster database
export async function banUserProfile(targetUserId: string, reason: string) {
  const admin = await verifyAdminCheckpoint();
  if (!admin) return { error: "Unauthorized access path: Admin permissions required." };
  if (targetUserId === admin.id) return { error: "Security Halt: You cannot ban your own account." };

  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isBanned: true,
        banReason: reason || "Violation of platform community standard rules.",
        bannedAt: new Date(),
        status: "OFFLINE" // Force active indicators cold
      }
    });

    // Wipe out active session logs cleanly
    revalidatePath("/");
    revalidatePath("/discover");
    return { success: true };
  } catch (err) {
    console.error("Administrative ban execution failed:", err);
    return { error: "Database transaction error." };
  }
}

// 2. ACTION: Lift a profile ban restrictions safely
export async function unbanUserProfile(targetUserId: string) {
  const admin = await verifyAdminCheckpoint();
  if (!admin) return { error: "Unauthorized." };

  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isBanned: false,
        banReason: null,
        bannedAt: null
      }
    });

    revalidatePath("/discover");
    return { success: true };
  } catch (err) {
    return { error: "Failed to unban profile user." };
  }
}

// 3. ACTION: Dispatch an automated global system message alert notification to all active accounts
export async function dispatchGlobalSystemBroadcast(subject: string, alertText: string) {
  const admin = await verifyAdminCheckpoint();
  if (!admin) return { error: "Unauthorized." };
  if (!alertText.trim()) return { error: "Broadcast body cannot be empty." };

  try {
    // Select all non-admin platform accounts to populate recipient rows
    const targets = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true }
    });

    // Pipe a system alert mail card directly down into everyone's inbox simultaneously
    for (const target of targets) {
      await prisma.internalMail.create({
        data: {
          subject: `📢 SYSTEM BROADCAST: ${subject.trim() || "Important Network Update"}`,
          body: alertText.trim(),
          senderId: admin.id,
          recipientId: target.id
        }
      });
    }

    return { success: true, dispatchedCount: targets.length };
  } catch (err) {
    console.error("Global transmission batch failed:", err);
    return { error: "Broadcast array compilation error." };
  }
}
