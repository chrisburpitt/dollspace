// src/app/actions/moderation.ts (PART 1 - SECURE MODERATION SUITE)
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// Helper Check
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

// 1. ACTION: Ban user profile
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
        status: "OFFLINE" 
      }
    });

    revalidatePath("/", "layout"); 
    return { success: true };
  } catch (err) {
    console.error("Administrative ban execution failed:", err);
    return { error: "Database transaction error." };
  }
}

// 2. ACTION: Unban profile user securely
export async function unbanUserProfile(targetUserId: string) {
  const admin = await verifyAdminCheckpoint();
  if (!admin) return { error: "Unauthorized." };

  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isBanned: false,
        banReason: null,
        bannedAt: null,
        status: "ONLINE"
      }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("Administrative unban sequence failed:", err);
    return { error: "Failed to unban profile user." };
  }
}

// 3. ACTION: Dispatch an automated global system message alert notification to all active accounts
export async function dispatchGlobalSystemBroadcast(subject: string, alertText: string) {
  const admin = await verifyAdminCheckpoint();
  if (!admin) return { error: "Unauthorized." };
  if (!alertText.trim()) return { error: "Broadcast body cannot be empty." };

  try {
    const targets = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true }
    });

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

// 4. ACTION: Permanently wipe an entire user account out of the database cluster
export async function administrativeDeleteUser(targetUserId: string) {
  const admin = await verifyAdminCheckpoint();
  if (!admin) return { error: "Unauthorized access path." };
  if (targetUserId === admin.id) return { error: "Security Halt: You cannot delete yourself." };

  try {
    await prisma.user.delete({
      where: { id: targetUserId }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Account deletion transaction failed:", err);
    return { error: "Failed to purge user record from the cluster." };
  }
}

// src/app/actions/moderation.ts (PART 2 - SOCIAL BLOCKS & COMPLIANCE)

// 5. ACTION: Instantly update a user's system authority role group permissions
export async function administrativeUpdateUserRole(targetUserId: string, newRole: "USER" | "MODERATOR" | "ADMIN") {
  const admin = await verifyAdminCheckpoint();
  if (!admin) return { error: "Unauthorized access path." };
  if (targetUserId === admin.id) return { error: "Security Halt: You cannot modify your own role level." };

  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("User role migration failed:", err);
    return { error: "Failed to rewrite role index rows." };
  }
}

// ⏳ 6. ACTION: IGNORE USER SYSTEM LOG FOR 10 MINUTES
export async function ignoreUserAction(targetId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  try {
    // Calculate the absolute 10-minute threshold lookup date from right now
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert the temporary ignore parameter record securely into Neon
    await prisma.userBlockRelation.upsert({
      where: {
        userId_targetId_type: { 
          userId: sessionUser.id, 
          targetId, 
          type: "IGNORE" 
        }
      },
      update: { expiresAt: tenMinutesFromNow },
      create: { 
        userId: sessionUser.id, 
        targetId, 
        type: "IGNORE", 
        expiresAt: tenMinutesFromNow 
      }
    });

    revalidatePath("/chat");
    return { success: true };
  } catch (err) {
    console.error("Ignore operation failed:", err);
    return { error: "Failed to initialize temporary silence block." };
  }
}

// 🚫 7. ACTION: PERMANENT USER BLOCK ACCESS LOCKOUT
export async function blockUserAction(targetId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  try {
    // Upsert the absolute block relationship line straight into Neon
    await prisma.userBlockRelation.upsert({
      where: {
        userId_targetId_type: { 
          userId: sessionUser.id, 
          targetId, 
          type: "BLOCK" 
        }
      },
      update: {},
      create: { 
        userId: sessionUser.id, 
        targetId, 
        type: "BLOCK" 
      }
    });

    revalidatePath("/chat");
    return { success: true };
  } catch (err) {
    console.error("Permanent block operation failed:", err);
    return { error: "Failed to execute account block isolation." };
  }
}
