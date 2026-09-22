// src/app/actions/comments.ts (FULLY BALANCED & TYPESAFE)
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
    // 🚀 THE REAL-TIME LEASE REFRESH: 
    // Updates their 'lastActive' timestamp row in Neon whenever they post text!
    await prisma.user.update({
      where: { id: userId }, // 🎯 FIXED: Uses the verified function argument 'userId'
      data: { 
        lastActive: new Date(), 
        status: "ONLINE" 
      }
    });

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
      console.error("Non-blocking notification system error (Mentions):", mentionErr);
    }

    // 3. DEFENSIVE BASE POST NOTIFICATION
    try {
      if (!parentId) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (post) {
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

    revalidatePath("/");
    revalidatePath("/[username]", "layout");

    return { success: true, comment: newComment };

  } catch (error) {
    console.error("CRITICAL BACKEND ACTION DATABASE ERROR:", error);
    return { error: "Failed to post comment to database server." };
  }
}

// ACTION: Remove comment row paths safely
export async function deleteComment(commentId: string, currentUserId: string) {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== currentUserId) return { error: "Unauthorised." };

    // 🎯 RECONCILED PRE-REQUISITE LEASE:
    // Uses the function parameter scope token variable 'currentUserId' correctly here
    await prisma.user.update({
      where: { id: currentUserId }, // 🎯 FIXED BOUNDARY
      data: { 
        lastActive: new Date(), 
        status: "ONLINE" 
      }
    });

    await prisma.comment.delete({ where: { id: commentId } });

    revalidatePath("/");
    revalidatePath("/[username]", "layout");
    return { success: true };
  } catch (error) {
    console.error("ERROR IN DELETECOMMENT:", error);
    return { error: "Failed to delete comment row." };
  }
}
