// src/app/actions/comments.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications"; 

// 1. ACTION: Post a new comment onto a feed card
export async function createComment(postId: string, userId: string, content: string) {
  if (!content.trim()) return { error: "Comment text cannot be empty." };

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      userId,
    },
  });

// Look up the post owner target so we know who to alert
const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post) {
    // 🚀 TRIGGER NOTIFICATION: Sarah commented on Chloe's update post
    await createNotification({
      type: "COMMENT",
      recipientId: post.userId,
      issuerId: userId,
      postId: postId,
    });
  }

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}

// 2. ACTION: Delete an existing comment entry row
export async function deleteComment(commentId: string, currentUserId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.userId !== currentUserId) {
    return { error: "Unauthorised deletion attempt." };
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath("/");
  revalidatePath("/[username]", "layout");
}
