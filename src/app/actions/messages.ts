// src/app/actions/messages.ts
"use server";

import { prisma } from "@/lib/prisma";

// FIXED: Removed the standalone 'export' tag to comply with Next.js Server Action guidelines
function generateRoomToken(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join("--");
}

// ACTION: Securely write an archival record of a private chat message to Neon
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
