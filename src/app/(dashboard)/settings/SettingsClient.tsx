"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import SidebarNav from "@/components/SidebarNav";
import MobileNavShell from "@/components/MobileNavShell";
import Link from "next/link";
import { saveUserSettingsAction, changeUserHandleUsernameAction } from "@/app/actions/settings";

interface SettingsClientProps {
  currentUser: any;
  unreadMailCount: number;
}

export default function SettingsClient({ currentUser, unreadMailCount }: SettingsClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(currentUser.isDarkMode ?? false);
  const [swearFilter, setSwearFilter] = useState(currentUser.swearFilter ?? true);
  const [xxxFilter, setXxxFilter] = useState(currentUser.xxxFilter ?? true);
  const [blockMaleAttention, setBlockMaleAttention] = useState(currentUser.blockMaleAttention ?? true);

  const [notifComments, setNotifComments] = useState(currentUser.notifComments ?? false);
  const [notifReactions, setNotifReactions] = useState(currentUser.notifReactions ?? false);
  const [notifFollows, setNotifFollows] = useState(currentUser.notifFollows ?? false);
  const [notifMail, setNotifMail] = useState(currentUser.notifMail ?? false);
  const [notifDms, setNotifDms] = useState(currentUser.notifDms ?? false);

  const [usernameInput, setUsernameInput] = useState(currentUser.username || "");

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const result = await saveUserSettingsAction({
        isDarkMode,
        swearFilter,
        xxxFilter,
        blockMaleAttention,
        notifComments,
        notifReactions,
        notifFollows,
        notifMail,
        notifDms
      });
      if (result.success) alert("Configuration preferences saved successfully! ✨");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUsernameChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setIsChangingUsername(true);

    try {
      const res = await changeUserHandleUsernameAction(usernameInput);
      if (res.success) {
        alert(`Success! Your account username handle has been safely changed to: @${res.updatedHandle} 🌸`);
        window.location.reload();
      } else {
        alert(`❌ Availability Block: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChangingUsername(false);
    }
  };


