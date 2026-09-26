export const dynamic = "force-dynamic";

import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import StaticFeedBanner from "@/components/StaticFeedBanner";
import { getOnlineDollsRoster } from "@/app/actions/onlineUsers";
import { loginUser } from "@/app/actions/auth"; 

export const metadata = {
  title: "Welcome to Dollspace 👑 | Log In",
  description: "Come on in, let's chat. Share your stories, pictures, and connect.",
};

export default async function LoginPage() {
  // Freshly query your live Neon database cluster to fetch the top active profile rows
  const onlineDollsList = await getOnlineDollsRoster();
  // Safe crop: Pick up the first 4 active accounts to populate your footer layout beautifully
  const displayOnlineDolls = onlineDollsList.slice(0, 4);

  async function handleLoginActionSubmit(formData: FormData) {
    "use server";
    try {
      // 🚀 RESTORED COMPATIBILITY: Passes the required two parameters directly to your custom JWT engine!
      await loginUser(null, formData);
    } catch (error) {
      // Your custom login user logic uses Next.js redirect() which throws a NEXT_REDIRECT signal.
      // We must rethrow it here so Next.js can safely complete the route change to "/"!
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
      console.error("Dollspace custom login validation error 💖:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased flex flex-col font-sans select-none">
      
      {/* 👑 HEADER NAVIGATION CONTAINER */}
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

      {/* 🎀 DYNAMIC TIMELINE FEED BANNER HEADER */}
      <div className="w-full shrink-0 border-b border-rose-100">
        <StaticFeedBanner />
      </div>

      {/* 🗺️ CONTAINER WORKSPACE TRIPLE GRID SYSTEM */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-0">
        
        {/* COLUMN 1: LEFT TEASER DROWS DRAWER (3 Cols) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 lg:sticky lg:top-20 h-fit self-start opacity-70 pointer-events-none filter blur-[0.4px]">
          <div className="bg-white border border-rose-100 rounded-3xl p-5 space-y-2 text-left shadow-2xs">
            <div className="h-4 w-24 bg-rose-100 rounded animate-pulse" />
            <div className="space-y-1.5 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-50 border border-gray-100 rounded-xl w-full" />
              ))}
            </div>
          </div>
        </aside>

        {/* 🎯 COLUMN 2: CENTER WORKSPACE WORK BENCH (6 Cols) */}
        <main className="col-span-1 lg:col-span-6 flex flex-col gap-6 max-w-xl mx-auto w-full animate-scale-up">
          
          {/* 📝 FEATURE 1: HELLO INTRO TEXT BOX */}
          <div className="bg-white border border-rose-100/80 rounded-3xl p-6 shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-400" />
            <h2 className="font-black text-base text-gray-900 flex items-center gap-1.5">
              Hello Doll! <span>👋👑</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-2 select-text">
              Welcome to the internet's most exclusive ladies lounge curated just for the dolls to share, 
              connect, and showcase their favoutie stories and pictures free from unwanted noise. 
              Dollspace is built for the trans, crossdresser and non-binary community, and all our allies to 
			  find friends, support and resources for your journey ✨\n
			  Come on in, post a photo and join our live chat lounge, or just browse our community profiles
			  and see what the girls are up to!
            </p>
          </div>

          {/* MAIN ACCOUNT LOGIN CARD CONTAINER */}
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-10 shadow-sm text-left w-full">
            
            <div className="text-center pb-4 border-b border-gray-50">
              <h1 className="text-xl font-black tracking-tight text-gray-950">
                Welcome Back, <span className="text-rose-500">Babe!</span> ✨
              </h1>
              <p className="text-[11px] font-semibold text-gray-400 mt-1">
                Enter your secure profile criteria coordinates to log back into your channels.
              </p>
            </div>

            <form action={handleLoginActionSubmit} className="space-y-4 pt-6" autoComplete="off">

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Username or Email</label>
                <input 
                    type="text" 
                    name="username" 
                    required 
                    placeholder="Enter your username, e.g. TeaganS" 
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 transition text-left" 
                />
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

            <div className="mt-6 text-center text-xs text-gray-400 font-semibold">
              Already have an account?{" "}
              <Link href="/register" className="text-rose-500 font-black hover:underline transition">
                Create your profile here
              </Link>
            </div>

          </div>

          {/* 🟢 FEATURE 2: LOOK WHO IS ONLINE NOW GRID DRAWER */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm text-left w-full space-y-3">
            <div>
              <h3 className="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>🟢</span> Look who is online now
              </h3>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Active Community Presence</p>
            </div>

            {displayOnlineDolls.length === 0 ? (
              <p className="text-[11px] font-medium text-gray-400 italic py-2">The runway is currently sleeping quiet... 💤</p>
            ) : (
              /* Renders 4 gorgeous user columns side-by-side cleanly */
              <div className="grid grid-cols-4 gap-3 pt-1">
                {displayOnlineDolls.map((doll: any) => (
                  <div key={doll.id} className="flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-100 rounded-2xl relative group transition hover:bg-white hover:shadow-xs">
                    {/* Live Avatar Circular Mask Node */}
                    <div className="w-10 h-10 rounded-full bg-rose-100 border border-gray-200 overflow-hidden relative shadow-2xs">
                      <img 
                        src={doll.avatarUrl || "https://ufs.sh"} 
                        alt="" 
                        className="w-full h-full object-cover select-none"
                        draggable="false"
                      />
                      {/* Active Emerald Online Status Indicator Ring */}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white ring-1 ring-green-400/30" />
                    </div>
                    <span className="text-[9px] font-black text-gray-800 truncate max-w-full text-center mt-1.5 block leading-none">
                      {doll.displayName.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>

        {/* COLUMN 3: RIGHT Metrics (3 Cols) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 text-left shadow-2xs space-y-4">
            <div>
              <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span> Today on Dollspace
              </h4>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Live System Metrics</p>
            </div>
            <div className="divide-y divide-gray-50 text-xs font-bold text-gray-600">
              <div className="py-2.5 flex justify-between items-center"><span className="text-gray-400">🔸 Registered users:</span><span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-800 text-[11px] font-black">6</span></div>
              <div className="py-2.5 flex justify-between items-center"><span className="text-gray-400">🟢 Dolls online now:</span><span className="bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-md text-[11px] font-black">1</span></div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
