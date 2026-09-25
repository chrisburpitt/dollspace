import { prisma } from "@/lib/prisma";

export async function autoPurgeOldTrash() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Permanently delete records that match the age profile
  await prisma.internalMail.deleteMany({
    where: {
      recipientDeleted: true,
      createdAt: { lt: thirtyDaysAgo } // Safely cleans out old rows
    }
  });
}
