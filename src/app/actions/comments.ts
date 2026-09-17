// src/app/actions/comments.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

// ACTION: Create a comment or nested reply with active tagging/mentions tracking
export async function createComment(
  postId: string, 
  userId: string,      // 🚀 FIXED: Order matches frontend sequence perfectly now
  content: string, 
  parentId: string | null = null
) {
  if (!content.trim()) return { error: "Comment text cannot be empty." };

  try {
    // 1. Create the base comment record row
    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId,
        parentId,
      },
      include: { 
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true
          }
        } 
      }
    });

    // 2. PARSE MENTIONS ENGINE: Find all '@username' strings in text
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = content.match(mentionRegex);

    if (matches) {
      const usernames = [...new Set(matches.map(m => m.substring(1)))];

      const taggedUsers = await prisma.user.findMany({
        where: { username: { in: usernames } }
      });

      for (const taggedUser of taggedUsers) {
        if (taggedUser.id !== userId) {
          await createNotification({
            type: "MENTION", 
            recipientId: taggedUser.id,
            issuerId: userId,
            postId,
          });
        }
      }
    }

    // 3. REGULAR BASE NOTIFICATION (Only triggers if it's a top-level comment)
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

    // Clear caches
    revalidatePath("/");
    revalidatePath("/[username]", "layout");

    // 🚀 RETURN DATA OBJECT: Pass back success flag AND full prisma node object to append to list!
    return { success: true, comment: newComment };

  } catch (error) {
    console.error("CRITICAL BACKEND ACTION ERROR IN CREATECOMMENT:", error);
    return { error: "Failed to post comment to database server." };
  }
}

// ACTION: Remove comment row paths safely
export async function deleteComment(commentId: string, currentUserId: string) {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== currentUserId) return { error: "Unauthorised." };

    await prisma.comment.delete({ where: { id: commentId } });

    revalidatePath("/");
    revalidatePath("/[username]", "layout");
    return { success: true };
  } catch (error) {
    console.error("ERROR IN DELETECOMMENT:", error);
    return { error: "Failed to delete comment row." };
  }
}
