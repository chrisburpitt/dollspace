// src/app/actions/editPost.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function editPostContent(postId: string, newContent: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };
  if (!newContent.trim()) return { error: "Post content cannot be empty." };

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { error: "Post record not found." };
    if (post.userId !== sessionUser.id) return { error: "Unauthorized modification track." };

    await prisma.post.update({
      where: { id: postId },
      data: { content: newContent.trim() }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to edit post content strings:", err);
    return { error: "Database update error." };
  }
}
