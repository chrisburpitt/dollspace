// src/app/actions/comments.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

// ACTION: Create a comment or nested reply with active tagging/mentions tracking
export async function createComment(
  postId: string, 
  userId: string, 
  content: string, 
  parentId: string | null = null
) {
  if (!content.trim()) return { error: "Comment text cannot be empty." };

  // 1. Create the base comment record row
  const newComment = await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      userId,
      parentId,
    },
    include: { user: true }
  });

  // 2. PARSE MENTIONS ENGINE: Find all '@username' strings in text
  // Matches words starting with @ followed by numbers, letters, underscores
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = content.match(mentionRegex);

  if (matches) {
    // Extract unique usernames without the '@' symbol
    const usernames = [...new Set(matches.map(m => m.substring(1)))];

    // Find matched profiles inside our database rows
    const taggedUsers = await prisma.user.findMany({
      where: { username: { in: usernames } }
    });

    // Fire off an alert notification string to each tagged creator row
    for (const taggedUser of taggedUsers) {
      if (taggedUser.id !== userId) {
        await createNotification({
          type: "MENTION", // Make sure your Notification UI layout accepts this string
          recipientId: taggedUser.id,
          issuerId: userId,
          postId,
        });
      }
    }
  }

  // 3. REGULAR BASE NOTIFICATION (Only triggers if it's a top-level comment, not a reply tag)
  if (!parentId) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.userId !== userId) {
      await createNotification({
        type: "COMMENT",
        recipientId: post.userId,
        issuerId: userId,
        postId,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
  return { success: true };
}

// ACTION: Remove comment row paths safely
export async function deleteComment(commentId: string, currentUserId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== currentUserId) return { error: "Unauthorised." };

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}
