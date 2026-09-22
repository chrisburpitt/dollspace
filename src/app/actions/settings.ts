"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

interface SaveSettingsPayload {
  isDarkMode: boolean;
  swearFilter: boolean;
  xxxFilter: boolean;
  blockMaleAttention: boolean;
  notifComments: boolean;
  notifReactions: boolean;
  notifFollows: boolean;
  notifMail: boolean;
  notifDms: boolean;
}

export async function saveUserSettingsAction(payload: SaveSettingsPayload) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  try {
    // Atomically overwrite configuration columns inside Neon PostgreSQL
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        isDarkMode: payload.isDarkMode,
        swearFilter: payload.swearFilter,
        xxxFilter: payload.xxxFilter,
		blockMaleAttention: payload.blockMaleAttention, 
        notifComments: payload.notifComments,
        notifReactions: payload.notifReactions,
        notifFollows: payload.notifFollows,
        notifMail: payload.notifMail,
        notifDms: payload.notifDms,
        lastActive: new Date()
      }
    });

    // Purge cached states so changes take effect across all app layouts instantly
    revalidatePath("/", "layout");
    revalidatePath("/settings");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to commit settings configuration:", error);
    return { error: "Failed to write settings to database cluster." };
  }
}

export async function changeUserHandleUsernameAction(newUsername: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || !sessionUser.id) return { error: "Unauthorized." };

  const cleanUsername = newUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, "");
  if (!cleanUsername) return { error: "Please enter a valid handle name using letters and numbers only." };
  if (cleanUsername.length < 3) return { error: "Username must be at least 3 characters long." };

  try {
    // Check directory depth to make sure it's not already registered
    const duplicateCheck = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (duplicateCheck) {
      if (duplicateCheck.id === sessionUser.id) return { error: "This is already your active username handle!" };
      return { error: "Handle unavailable. That username is already registered to another doll account." };
    }

    // Execute handle change atomically
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { username: cleanUsername }
    });

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    return { success: true, updatedHandle: cleanUsername };
  } catch (err) {
    console.error("Username migration failure:", err);
    return { error: "Database transaction failed to write handle rows." };
  }
}