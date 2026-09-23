// src/app/actions/messages.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

function generateRoomToken(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join("--");
}

export async function saveDirectMessage(data: {
  senderId: string;
  recipientId: string;
  content: string;
}) {
  if (!data.content.trim()) return { error: "Message text cannot be empty." };

  const token = generateRoomToken(data.senderId, data.recipientId);

  const messageRow = await prisma.directMessage.create({
    data: {
      content: data.content.trim(),
      senderId: data.senderId,
      recipientId: data.recipientId,
      roomToken: token,
    },
    include: { sender: true }
  });

  return messageRow;
}

export async function saveModChatMessage(content: string, userId: string) {
  if (!content?.trim() || !userId) return { error: "Missing required chat parameters." };
  
  try {
    const savedLogRow = await prisma.modMessage.create({
      data: {
        content: content.trim(),
        userId: userId
      }
    });
    return { success: true, message: savedLogRow };
  } catch (error) {
    console.error("Server action database write failure in saveModChatMessage:", error);
    return { error: "Failed to persist log row to server database." };
  }
}

export async function markDirectMessagesAsReadAction(senderId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized access path." };

  try {
    // Atomically find every message sent from this user to you and mark them as read!
    await prisma.directMessage.updateMany({
      where: {
        senderId: senderId,
        recipientId: sessionUser.id,
        isRead: false
      },
      data: { isRead: true }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("Unread message flush failure:", err);
    return { error: "Failed to mark records as read inside PostgreSQL." };
  }
}