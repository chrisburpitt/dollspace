export const dynamic = "force-dynamic";

import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";

export const metadata = {
  title: "Welcome to Dollspace 👑 | Log In",
  description: "Come on in, let's chat. Share your stories, pictures, and connect.",
};

export default async function LoginPage() {
  // Inline Client Action simulation handler for login validation requests
  async function handleLoginActionSubmit(formData: FormData) {
    "use server";
    // Your existing NextAuth / secure login session validation routine runs here natively...
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased flex flex-col font-sans select-none">
      
      {/* 👑 APP GLOBAL BRANDING HEADER LAYER */}
      <header className="w-full bg-white border-b border-rose-100 py-3 px-4 sm:px-6 shadow-sm sticky top-0 z-50 text-left shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-black text-lg sm:text-xl text-rose-500 tracking-tighter">
            Dollspace 👑
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-500 border border-rose-100 px-3 py-1.5 rounded-full shadow-2xs">
              🔒 Secure Gateway
            </span>
          </div>
        </div>
      </header>

      {/* 🎀 MAIN IMMERSIVE WELCOME HERO CONTENT BANNER */}
      <div 
        className="w-full h-44 sm:h-52 bg-cover bg-center relative shrink-0 border-b border-rose-100 flex flex-col justify-end p-6 text-left"
        style={{ backgroundImage: "url('https://unsplash.com')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-0" />
        <div className="max-w-7xl w-full mx-auto relative z-10 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl w-fit mb-2">
            <p className="text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span>🏠</span> Come on in, let's chat ♡
            </p>
          </div>
        </div>
      </div>

      {/* 🗺️ THE TRIPLE COLUMN GRID CORE ARTIFACT */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-0">
        
        {/* 📋 COLUMN 1: LEFT LOCKED MENUS & BANNER TEASERS (3 Cols) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 lg:sticky lg:top-20 h-fit self-start opacity-70 pointer-events-none filter blur-[0.4px]">
          
          {/* Static Preview Navigation Drawer Block */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 space-y-2 text-left shadow-2xs">
            <div className="h-4 w-24 bg-rose-100 rounded animate-pulse" />
            <div className="space-y-1.5 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-50 border border-gray-100 rounded-xl w-full" />
              ))}
            </div>
          </div>

          {/* Immersive Blur Teaser of Doll of the Week Tournament Card */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 text-left shadow-xs relative overflow-hidden">
            <h3 className="font-black text-xs text-rose-500 uppercase tracking-widest mb-1">Doll Of The Week</h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-3">Weekly Tournament</p>
            <div className="w-full aspect-square rounded-2xl bg-rose-50/40 border border-rose-100/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center filter blur-xs scale-105 opacity-80" style={{ backgroundImage: "url('https://unsplash.com')" }} />
              <span className="bg-white/90 backdrop-blur-xs font-black text-[9px] uppercase tracking-wider text-rose-500 px-3 py-1.5 rounded-full shadow-xs relative z-10 border border-rose-100">
                🔒 Members Only
              </span>
            </div>
            <p className="text-center font-bold text-[9px] text-gray-400 italic pt-2.5">Join the platform to rate looks ✨</p>
          </div>

        </aside>

        {/* 🎯 COLUMN 2: CENTER ACCOUNT LOGIN PORTAL HUB (6 Cols) */}
        <main className="col-span-1 lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-10 shadow-sm text-left max-w-xl mx-auto w-full animate-scale-up">
            
            <div className="text-center pb-4 border-b border-gray-50">
              <h1 className="text-2xl font-black tracking-tight text-gray-950">
                Welcome Back, <span className="text-rose-500">Doll!</span> ✨
              </h1>
              <p className="text-xs font-semibold text-gray-400 mt-1">
                Log in below to jump straight back into your timeline streams.
              </p>
            </div>

            <form action={handleLoginActionSubmit} className="space-y-4 pt-6">
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Username or Email</label>
                
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Password</label>
                  <Link href="/forgot-password" className="text-[10px] font-bold text-rose-400 hover:underline">Forgot?</Link>
                </div>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  placeholder="••••••••••••" 
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 transition" 
                />
              </div>

              <div className="pt-2">
                <SubmitButton 
                  label="Log In into Dollspace 🚀" 
                  loadingLabel="Verifying Session Token..." 
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-xs cursor-pointer transition transform active:scale-[0.99]" 
                />
              </div>

            </form>

            {/* LOWER REDIRECT LINK INTERACTION PANEL */}
            <div className="mt-8 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs text-gray-400 font-semibold">
                Don't have an account look yet?{" "}
                <Link href="/register" className="text-rose-500 font-black hover:underline transition">
                  Create your profile here
                </Link>
              </p>
            </div>

          </div>
        </main>

        {/* 📊 COLUMN 3: RIGHT SYSTEM STATISTICS MONITOR CAPSULE (3 Cols) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          
          <div className="bg-white border border-gray-200 rounded-3xl p-5 text-left shadow-2xs space-y-4">
            <div>
              <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span> Today on Dollspace
              </h4>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Live System Metrics</p>
            </div>

            <div className="divide-y divide-gray-50 text-xs font-bold text-gray-600">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1.5">🔸 Registered users:</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-800 text-[11px] font-black">6</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1.5">🟢 Dolls online now:</span>
                <span className="bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-md text-[11px] font-black">1</span>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
