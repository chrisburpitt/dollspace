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

  try {
    // 1. Create the base comment record row (Matches your schema layout perfectly)
    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId, // 🚀 CONFIRMED BY YOUR SCHEMA
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

    // 2. DEFENSIVE PARSE MENTIONS ENGINE
    try {
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
    } catch (mentionErr) {
      // If notifications error out, log it but don't stop the comment from posting!
      console.error("Non-blocking notification system error (Mentions):", mentionErr);
    }

    // 3. DEFENSIVE BASE POST NOTIFICATION
    try {
      if (!parentId) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (post) {
          // 🚀 SAFE FALLBACK: Check if post author field uses 'userId', 'authorId', or 'creatorId'
          const postOwnerId = post.userId || (post as any).authorId || (post as any).creatorId;
          
          if (postOwnerId && postOwnerId !== userId) {
            await createNotification({
              type: "COMMENT",
              recipientId: postOwnerId,
              issuerId: userId,
              postId,
            });
          }
        }
      }
    } catch (notifErr) {
      console.error("Non-blocking notification system error (Comment Alert):", notifErr);
    }

    // Clear Next.js cache segments to display changes live
    revalidatePath("/");
    revalidatePath("/[username]", "layout");

    return { success: true, comment: newComment };

  } catch (error) {
    // This logs the exact issue to your system terminal window (e.g. npm run dev console)
    console.error("CRITICAL BACKEND ACTION DATABASE ERROR:", error);
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
