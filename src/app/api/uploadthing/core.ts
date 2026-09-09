// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  // 🔒 SECURED AVATAR UPLOADER MIDDLEWARE
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // 1. Fetch the cryptographically secure HTTP-Only session user cookie
      const sessionUser = await getCurrentUser();
      if (!sessionUser) throw new Error("Unauthorized: Please log in first.");

      // 2. Extract the target profile ID being modified from request search queries
      const url = new URL(req.url);
      const targetProfileId = url.searchParams.get("userId");

      // 3. SECURITY MATRIX CHECK: Enforce strict ownership validation!
      if (!targetProfileId || sessionUser.id !== targetProfileId) {
        throw new Error("Unauthorized: You do not have permission to modify this profile image.");
      }

      return { userId: sessionUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // 4. Safely update the correct profile image url row strictly bounded by metadata session confirmation
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { avatarUrl: file.url }
      });
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // 🔒 SECURED FEED IMAGE POST UPLOADER
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const sessionUser = await getCurrentUser();
      if (!sessionUser) throw new Error("Unauthorized: Please log in first.");
      return { userId: sessionUser.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
