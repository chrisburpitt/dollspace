// src/app/actions/mail.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// 1. ACTION: Send a fresh internal mail with rich body content and multi-photo streams
export async function sendInternalMail(formData: FormData) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const recipientUsername = (formData.get("recipientUsername") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim() || "(No Subject)";
  const body = (formData.get("body") as string)?.trim() || "";

  if (!recipientUsername) return { error: "Please specify a recipient handle username." };
  if (!body) return { error: "Mail body content cannot be empty." };

  const targetUser = await prisma.user.findUnique({ where: { username: recipientUsername } });
  if (!targetUser) return { error: "Target doll account username not found." };
  if (targetUser.id === sessionUser.id) return { error: "You cannot send mail to yourself." };

  // Separate file upload files streams collection
  const attachFiles = formData.getAll("attachments") as File[];
  const validFiles = attachFiles.filter(f => f && f.size > 0).slice(0, 3);

  // Initialize data transaction row on Neon
  const mail = await prisma.internalMail.create({
    data: {
      subject,
      body,
      senderId: sessionUser.id,
      recipientId: targetUser.id
    }
  });

  // Batch process uploader attachments
  if (validFiles.length > 0) {
    try {
      const responses = await utapi.uploadFiles(validFiles);
      const resArray = Array.isArray(responses) ? responses : [responses];

      for (const res of resArray) {
        if (res.data?.url) {
          await prisma.mailAttachment.create({
            data: { url: res.data.url, mailId: mail.id }
          });
        }
      }
    } catch (err) {
      console.error("Mail uploader stream error:", err);
    }
  }

  revalidatePath("/mail");
  return { success: true };
}

// 2. ACTION: Move mail objects into archive or deleted folders selectively
export async function toggleMailState(mailId: string, actionType: "ARCHIVE" | "DELETE" | "MARK_READ") {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "Unauthorized." };

  const mail = await prisma.internalMail.findUnique({ where: { id: mailId } });
  if (!mail) return { error: "Mail record not found." };

  const isSender = mail.senderId === sessionUser.id;
  const isRecipient = mail.recipientId === sessionUser.id;

  if (!isSender && !isRecipient) return { error: "Unauthorized access path." };

  const updateData: any = {};

  if (actionType === "MARK_READ" && isRecipient) {
    updateData.isRead = true;
  } else if (actionType === "ARCHIVE") {
    if (isSender) updateData.senderArchived = true;
    if (isRecipient) updateData.recipientArchived = true;
  } else if (actionType === "DELETE") {
    if (isSender) updateData.senderDeleted = true;
    if (isRecipient) updateData.recipientDeleted = true;
  }

  await prisma.internalMail.update({
    where: { id: mailId },
    data: updateData
  });

  revalidatePath("/mail");
  return { success: true };
}
