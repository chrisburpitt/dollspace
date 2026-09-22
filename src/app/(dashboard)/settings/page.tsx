// src/app/settings/page.tsx (PART 1 - GLOBAL PLATFORM MATCH)
"use client";

import { useState } from "react";
import GlobalHeader from "@/components/GlobalHeader";
import SidebarNav from "@/components/SidebarNav";
import MobileNavShell from "@/components/MobileNavShell";
import Link from "next/link";

interface SettingsPageProps {
  currentUser: any;
  unreadMailCount: number;
}

export default function SettingsPage({ currentUser, unreadMailCount = 0 }: SettingsPageProps) {
  // 🌓 THEME CONFIGURATION STATE (Default: Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 🛡️ CONTENT SAFETY FILTERS (Default: On)
  const [swearFilter, setSwearFilter] = useState(true);
  const [xxxFilter, setXxxFilter] = useState(true);

  // 💌 EMAIL NOTIFICATION CONTROLS (Default: Off)
  const [notifComments, setNotifComments] = useState(false);
  const [notifReactions, setNotifReactions] = useState(false);
  const [notifFollows, setNotifFollows] = useState(false);
  const [notifMail, setNotifMail] = useState(false);
  const [notifDms, setNotifDms] = useState(false);

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      isDarkMode ? "bg-gray-950 text-gray-50" : "bg-gray-50 text-gray-900"
    }`}>
      <GlobalHeader currentUser={currentUser} />
      <MobileNavShell currentUsername={currentUser?.username} unreadMailCount={unreadMailCount} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Sidebar Navigation Links */}
        <aside className="hidden lg:block lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav currentUsername={currentUser?.username} unreadMailCount={unreadMailCount} />
        </aside>

        {/* RIGHT COLUMN: Settings Dashboard Panel Layout Frame */}
        <main className={`col-span-1 lg:col-span-9 border transition-colors duration-300 rounded-3xl p-6 sm:p-10 shadow-sm text-left space-y-8 ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}>
          
          {/* Main Title Description Banner */}
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              Account <span className="text-rose-500">Settings</span> 👑
            </h1>
            <p className={`text-xs font-semibold mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>
              Configure your display mode preferences, toggle notification arrays, and update security locks.
            </p>
          </div>

          {/* SECTION 1: VISUAL THEME PREFERENCES */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">
              🌓 Interface Theme
            </h2>
            <div className={`p-4 rounded-2xl flex items-center justify-between border ${
              isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"
            }`}>
              <div className="text-left">
                <span className="text-xs font-black block">Dark Layout Mode</span>
                <span className="text-[10px] font-bold text-gray-400 block">Switch between light (default) and dark themes across Dollspace interfaces.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  isDarkMode ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-md block transition-transform duration-300" />
              </button>
            </div>
          </section>

          {/* SECTION 2: CONTENT SAFETY PARAMETERS */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">
              🛡️ Content Moderation Filters
            </h2>
            <div className="space-y-3">
              {/* Swear Filter Switch */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"
              }`}>
                <div className="text-left">
                  <span className="text-xs font-black block">Swear Word Filter (Default On)</span>
                  <span className="text-[10px] font-bold text-gray-400 block">Censors vulgar or aggressive expressions within chat channels automatically.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSwearFilter(!swearFilter)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    swearFilter ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md block transition-transform duration-300" />
                </button>
              </div>

              {/* XXX Filter Switch */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"
              }`}>
                <div className="text-left">
                  <span className="text-xs font-black block">XXX / Nudity Filter (Default On)</span>
                  <span className="text-[10px] font-bold text-gray-400 block">Restricts explicit, adult-only photo attachments inside the feed stream layout cards.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setXxxFilter(!xxxFilter)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    xxxFilter ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md block transition-transform duration-300" />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 3: EMAIL NOTIFICATION ROUTER TOGGLES */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">
              💌 Email Dispatch Notifications
            </h2>
            <p className="text-[11px] text-gray-400 font-semibold mt-1">Select which real-time event updates dispatch email logs directly to your personal mailbox (Default: Off).</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "New Post Comments", state: notifComments, setter: setNotifComments, desc: "Alert when a doll comments on your timeline post updates." },
                { label: "Reaction Alerts", state: notifReactions, setter: setNotifReactions, desc: "Notify when emojis are attached to your content." },
                { label: "Follower Tractions", state: notifFollows, setter: setNotifFollows, desc: "Dispatch email whenever a doll clicks to follow your profile." },
                { label: "Internal Mail Alerts", state: notifMail, setter: setNotifMail, desc: "Alert instantly when a rich mail card lands in your inbox." },
                { label: "Direct Messages Waiting", state: notifDms, setter: setNotifDms, desc: "Notify if a chat lounge line dm is sent while offline." }
              ].map((notif, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                  isDarkMode ? "bg-gray-950/20 border-gray-800" : "bg-gray-50/50 border-gray-100"
                }`}>
                  <div className="text-left pr-2 min-w-0">
                    <span className="text-xs font-bold block truncate">{notif.label}</span>
                    <span className="text-[9px] font-medium text-gray-400 block leading-tight">{notif.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => notif.setter(!notif.state)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 shrink-0 ${
                      notif.state ? "bg-rose-500 justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <span className="bg-white w-3.5 h-3.5 rounded-full shadow-xs block" />
                  </button>
                </div>
              ))}
            </div>
          </section>


// src/app/settings/page.tsx (PART 2 - PROFILE CREDENTIALS & ACCOUNT DESTRUCTION GATES)

          {/* SECTION 4: SECURE PROFILE UPDATE DECK */}
          <section className="space-y-6 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-500">
              🔑 Security & Credentials
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Form Block A: Change Account Email */}
              <form onSubmit={(e) => { e.preventDefault(); alert("Email update token dispatched securely."); }} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">
                    Update Email Address
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="New email handle address" 
                    className={`w-full border rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition ${
                      isDarkMode ? "border-gray-800 bg-gray-950/40 text-white" : "border-gray-200 bg-gray-50 text-gray-800"
                    }`}
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Save New Email
                </button>
              </form>

              {/* Form Block B: Change Security Password */}
              <form onSubmit={(e) => { e.preventDefault(); alert("Cryptographic password hash updated successfully."); }} className="space-y-3">
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">
                      Change Password
                    </label>
                    <input 
                      type="password" 
                      required
                      placeholder="Current account password" 
                      className={`w-full border rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition ${
                        isDarkMode ? "border-gray-800 bg-gray-950/40 text-white" : "border-gray-200 bg-gray-50 text-gray-800"
                      }`}
                    />
                  </div>
                  <input 
                    type="password" 
                    required
                    placeholder="New secure password" 
                    className={`w-full border rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition ${
                      isDarkMode ? "border-gray-800 bg-gray-950/40 text-white" : "border-gray-200 bg-gray-50 text-gray-800"
                    }`}
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          </section>

          {/* SECTION 5: ACCOUNT LIFECYCLE EMERGENCY ZONE */}
          <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-red-500">
              🚨 Danger Zone
            </h2>
            <p className="text-[11px] text-gray-400 font-semibold mt-1">
              Temporary suspension or permanent destruction controls for your Dollspace database profile.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Box 1: Pause Account Lease */}
              <div className={`p-5 rounded-2xl border text-left flex flex-col justify-between items-start space-y-3 ${
                isDarkMode ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-100"
              }`}>
                <div>
                  <span className="text-xs font-black block text-amber-600">Pause Account Pool</span>
                  <span className="text-[10px] font-bold text-gray-400 block mt-0.5 leading-relaxed">
                    Temporarily deactivate your profile card. This hides your feed updates and removes you from live rosters until your next secure login link handshake.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Account entry paused safely. Re-login anytime to restore lines.")}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Pause Account
                </button>
              </div>

              {/* Box 2: Permanent Administrative Account Purge */}
              <div className={`p-5 rounded-2xl border text-left flex flex-col justify-between items-start space-y-3 ${
                isDarkMode ? "bg-red-950/10 border-red-900/30" : "bg-red-50/30 border-red-100"
              }`}>
                <div>
                  <span className="text-xs font-black block text-red-600">Delete Account Permanently</span>
                  <span className="text-[10px] font-bold text-gray-400 block mt-0.5 leading-relaxed">
                    Atomically purge your profile table row from Neon PostgreSQL. This wipes your posts, comments, internal mail records, and image attachments permanently. Action cannot be undone.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const confirmPurge = confirm("🚨 CRITICAL WARNING: Are you absolutely sure you want to permanently delete your Dollspace account profile? All database records will be erased.");
                    if (confirmPurge) alert("Account destruction sequence initialized.");
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          {/* GLOBAL SAVE SETTINGS SUBMIT ACTION CONTAINER */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex justify-end">
            <button
              type="button"
              onClick={() => alert("Global configuration preferences saved live onto the system cluster.")}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-[1px] active:translate-y-0"
            >
              Save Configuration Settings ✨
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
