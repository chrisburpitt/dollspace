"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

interface SaveSettingsPayload {
  isDarkMode: boolean;
  swearFilter: boolean;
  xxxFilter: boolean;
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
        notifComments: payload.notifComments,
        notifReactions: payload.notifReactions,
        notifFollows: payload.notifFollows,
        notifMail: payload.notifMail,
        notifDms: payload.notifDms,
        lastActive: new Date() // Updates their lease window
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
