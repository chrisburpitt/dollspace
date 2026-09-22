// src/app/settings/page.tsx (THE SECURE SERVER-SIDE ROUTER GATEWAY)
// 🎯 FORCE RUNTIME PROCESSING: Bypasses static prerender compilation traps completely!
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { getUnreadMailCount } from "@/app/actions/mailCount";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient"; // 🔥 Securely imports your client-side form interface

export default async function SettingsPage() {
  // 🚀 Fetch account credentials freshly from Neon PostgreSQL tables upon request handshakes
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount();

  // Safely passes data parameters down into the Client Component only AFTER server lookups complete!
  return (
    <SettingsClient 
      currentUser={currentUser} 
      unreadMailCount={unreadMailCount || 0} 
    />
  );
}
