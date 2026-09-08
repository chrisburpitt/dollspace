// src/app/actions/comments.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
