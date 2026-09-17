// src/app/actions/messages.ts
"use server";

import { prisma } from "@/lib/prisma";

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
