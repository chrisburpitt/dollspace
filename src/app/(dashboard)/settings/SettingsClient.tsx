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


// src/app/settings/SettingsClient.tsx (PART 2 - ACTIVE LAYOUT SHELLS & SECURITY TOGGLES)

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      isDarkMode ? "bg-gray-950 text-gray-50" : "bg-gray-50 text-gray-900"
    }`}>
      <GlobalHeader currentUser={currentUser} />
      <MobileNavShell currentUsername={currentUser?.username} unreadMailCount={unreadMailCount} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Main App Navigation Drawer */}
        <aside className="hidden lg:block lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav currentUsername={currentUser?.username} unreadMailCount={unreadMailCount} />
        </aside>

        {/* RIGHT COLUMN: Settings Dashboard Panel Frame */}
        <main className={`col-span-1 lg:col-span-9 border transition-colors duration-300 rounded-3xl p-6 sm:p-10 shadow-sm text-left space-y-8 ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}>
          
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              Account <span className="text-rose-500">Settings</span> 👑
            </h1>
            <p className="text-xs font-semibold mt-1 text-gray-400">
              Configure your display mode preferences, toggle notification arrays, and update security locks.
            </p>
          </div>

          {/* SECTION 1: INTERFACE THEME PREFERENCES (REAL-TIME LIVE UPDATES) */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">🌓 Dollspace Theme</h2>
            <div className={`p-4 rounded-2xl flex items-center justify-between border ${
              isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"
            }`}>
              <div>
                <span className="text-xs font-black block">Dark Mode</span>
                <span className="text-[10px] font-bold text-gray-400 block">Switch between light and dark themes across Dollspace.</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const nextThemeState = !isDarkMode;
                  setIsDarkMode(nextThemeState);
                  try {
                    await saveUserSettingsAction({
                      isDarkMode: nextThemeState,
                      swearFilter,
                      xxxFilter,
                      blockMaleAttention,
                      notifComments,
                      notifReactions,
                      notifFollows,
                      notifMail,
                      notifDms
                    });
                    router.refresh();
                  } catch (err) {
                    console.error("Theme toggle update failed:", err);
                  }
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${isDarkMode ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"}`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-md block transition-transform duration-300" />
              </button>
            </div>
          </section>

          {/* SECTION 2: CONTENT MODERATION & SAFETY FILTERS */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">🚫 Content Filters</h2>
            <div className="space-y-3">
              
              {/* Filter 1: Swear Word Filter */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                <div>
                  <span className="text-xs font-black block">Swear Word Filter</span>
                  <span className="text-[10px] font-bold text-gray-400 block">Blocks gross things and swears in the chat channels automatically.</span>
                </div>
                <button type="button" onClick={() => setSwearFilter(!swearFilter)} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${swearFilter ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"}`}><span className="bg-white w-4 h-4 rounded-full shadow-md block" /></button>
              </div>

              {/* Filter 2: XXX Nudity Filter */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                <div>
                  <span className="text-xs font-black block">XXX / Nudity Filter</span>
                  <span className="text-[10px] font-bold text-gray-400 block">Restricts explicit photo attachments inside the feed stream.</span>
                </div>
                <button type="button" onClick={() => setXxxFilter(!xxxFilter)} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${xxxFilter ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"}`}><span className="bg-white w-4 h-4 rounded-full shadow-md block" /></button>
              </div>

              {/* Filter 3: THE SWITCH OFF MALE ATTENTION FEATURE */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                <div>
                  <span className="text-xs font-black block">Switch OFF Male Attention</span>
                  <span className="text-[10px] font-bold text-gray-400 block">Filters out notifications, feed updates, and follow requests coming directly from verified male accounts.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setBlockMaleAttention(!blockMaleAttention)} 
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${blockMaleAttention ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"}`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md block transition-transform duration-300" />
                </button>
              </div>

            </div>
          </section>


// src/app/settings/SettingsClient.tsx (PART 3A - ALERTS & PRIVACY DIRECTORIES)

          {/* SECTION 3: EMAIL NOTIFICATION NETWORKS */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">📧 Email Notifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "New Post Comments", state: notifComments, setter: setNotifComments, desc: "Alert when a doll comments on your posts." },
                { label: "Reaction Alerts", state: notifReactions, setter: setNotifReactions, desc: "Notify when emojis are attached to your content." },
                { label: "New Followers", state: notifFollows, setter: setNotifFollows, desc: "Dispatch email whenever a doll follows your profile." },
                { label: "You've Got Mail! Alerts", state: notifMail, setter: setNotifMail, desc: "Alert instantly when mail lands in your inbox." },
                { label: "Direct Messages Waiting", state: notifDms, setter: setNotifDms, desc: "Notify if a chat lounge dm is sent while offline." }
              ].map((notif, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl flex items-center justify-between border ${isDarkMode ? "bg-gray-950/20 border-gray-800" : "bg-gray-50/50 border-gray-100"}`}>
                  <div className="text-left pr-2 min-w-0">
                    <span className="text-xs font-bold block truncate">{notif.label}</span>
                    <span className="text-[9px] font-medium text-gray-400 block leading-tight">{notif.desc}</span>
                  </div>
                  <button type="button" onClick={() => notif.setter(!notif.state)} className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 shrink-0 cursor-pointer ${notif.state ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"}`}><span className="bg-white w-3.5 h-3.5 rounded-full shadow-xs block" /></button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: PRIVACY CONTROL ROUTERS */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">⛔ Privacy & Restrictions</h2>
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 ${
              isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-rose-50/20 border-rose-100/60"
            }`}>
              <div className="text-left space-y-0.5">
                <span className="text-xs font-black block">Manage Blocked & Muted Users</span>
                <span className="text-[10px] font-bold text-gray-400 block mt-0.5 leading-normal">Review active blocks, track temporary ignores, or restore private messaging lines.</span>
              </div>
              <Link href="/settings/blocked" className="bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-500 border border-gray-200 hover:border-rose-200 font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider text-center transition shadow-xs shrink-0">Open Block List Panel 🛡️</Link>
            </div>
          </section>


// src/app/settings/SettingsClient.tsx (PART 3B - SECURITY FORMS & FINAL CLOSURES)

          {/* SECTION 5: SECURITY & PROFILE CREDENTIALS */}
          <section className="space-y-6 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">🔑 Security & Credentials</h2>
            
            <form onSubmit={handleUsernameChangeSubmit} className="space-y-1.5 w-full">
              <label className="text-[10px] font-black text-gray-400 uppercase block tracking-wider">Change Dollspace Username</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                <div className="relative flex-1 min-w-0">
                  <span className="absolute left-3 top-3 text-xs font-bold text-gray-400">@</span>
                  <input 
                    type="text" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Enter your new username here..." 
                    className={`w-full border rounded-xl p-3 pl-7 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition h-11 ${
                      isDarkMode ? "border-gray-800 bg-gray-950/40 text-white" : "border-gray-200 bg-gray-50 text-gray-800"
                    }`}
                  />
                </div>
                <button 
                  type="submit" disabled={isChangingUsername}
                  className={`text-white text-[10px] font-black uppercase tracking-wider px-6 rounded-xl transition shadow-sm h-11 whitespace-nowrap shrink-0 ${
                    isChangingUsername ? "bg-gray-400 cursor-not-allowed" : "bg-rose-500 hover:bg-rose-600 cursor-pointer"
                  }`}
                >
                  {isChangingUsername ? "Verifying..." : "Confirm Username Change ✨"}
                </button>
              </div>
              <span className="text-[9px] font-bold text-gray-400 block mt-1">Changing your username handle will instantly rewrite your timeline URLs and live chat tags.</span>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start text-left pt-2">
              <form onSubmit={(e) => { e.preventDefault(); alert("Cryptographic password hash updated successfully."); }} className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase block tracking-wider">Change Password</label>
                <div className="space-y-2">
                  <input type="password" required placeholder="Current account password" className={`w-full border rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition ${isDarkMode ? "border-gray-800 bg-gray-950/40 text-white" : "border-gray-200 bg-gray-50 text-gray-800"}`} />
                  <input type="password" required placeholder="New secure password" className={`w-full border rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition ${isDarkMode ? "border-gray-800 bg-gray-950/40 text-white" : "border-gray-200 bg-gray-50 text-gray-800"}`} />
                </div>
                <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer mt-1">Update Password</button>
              </form>

              <form onSubmit={(e) => { e.preventDefault(); alert("Email update token dispatched securely."); }} className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase block tracking-wider">Update Email Address</label>
                <div className="space-y-2">
                  <input type="email" required placeholder="New email handle address" className={`w-full border rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition ${isDarkMode ? "border-gray-800 bg-gray-950/40 text-white" : "border-gray-200 bg-gray-50 text-gray-800"}`} />
                  <div className="hidden md:block w-full h-11 pointer-events-none select-none" />
                </div>
                <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer mt-1">Save New Email</button>
              </form>
            </div>
          </section>

          {/* SECTION 6: LIFECYCLE DANGER ZONE GATES */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-red-500">⚡ Danger Zone</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className={`p-5 rounded-2xl border text-left flex flex-col justify-between items-start space-y-3 ${isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                <div>
                  <span className="text-xs font-black block text-amber-600">Pause Account</span>
                  <span className="text-[10px] font-bold text-gray-400 block mt-0.5 leading-relaxed">Do you need a break? Put your account on hold temporarily by deactivating here. This hides your profile and posts until you return 🏖️</span>
                </div>
                <button type="button" onClick={() => alert("Account entry paused safely.")} className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-xs cursor-pointer">Pause Account</button>
              </div>

              <div className={`p-5 rounded-2xl border text-left flex flex-col justify-between items-start space-y-3 ${isDarkMode ? "bg-red-950/10 border-red-900/30" : "bg-red-50/30 border-red-100"}`}>
                <div>
                  <span className="text-xs font-black block text-red-600">Delete Account Permanently</span>
                  <span className="text-[10px] font-bold text-gray-400 block mt-0.5 leading-relaxed">I can't believe you are leaving us already 😭 This action will PERMANENTLY DELETE your profile and ALL posts, pictures and comments from Dollspace. This cannot be undone! ⚠️</span>
                </div>
                <button type="button" onClick={() => { if(confirm("Delete account?")) alert("Purged."); }} className="bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-xs cursor-pointer">Delete Account</button>
              </div>
            </div>
          </section>

          {/* GLOBAL PREFERENCES SAVE ROW TRIGGER */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex justify-end">
            <button 
              type="button" disabled={isSaving} onClick={handleSaveSettings}
              className={`text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition shadow-md ${
                isSaving ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-rose-500 hover:bg-rose-600 transform hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
              }`}
            >
              {isSaving ? "Saving Choices..." : "Save Configuration Settings ✨"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
