// src/app/settings/page.tsx (THE SECURE SERVER-SIDE ROUTER GATEWAY)
// 🎯 FORCE RUNTIME PROCESSING: Bypasses static prerender compilation traps completely!
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { getUnreadMailCount } from "@/app/actions/mailCount";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient"; 
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Settings",
  description: "Update your Dollspace experiences settings here!",
};

export default async function SettingsPage() {
  // 🚀 Fetch account credentials freshly from Neon PostgreSQL tables upon request handshakes
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount();

  const validatedHeaderUser = {
    ...currentUser,
    isDarkMode: currentUser?.isDarkMode === true
  };

return (
  <SettingsClient 
    currentUser={validatedHeaderUser} 
    unreadMailCount={unreadMailCount || 0} 
  />
);