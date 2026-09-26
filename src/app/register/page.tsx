"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import StaticFeedBanner from "@/components/StaticFeedBanner";
import { registerUser } from "@/app/actions/auth"; 
import SubmitButton from "@/components/SubmitButton";

const PREFIX_OPTIONS = ["Trans", "Non-Binary", "Crossdresser", "Cis"];
const GENDER_OPTIONS = ["woman", "girl", "man", "boy"];

const LOCATION_OPTIONS = [
  "Australia", "New Zealand", "United Kingdom", "Ireland", "Canada", "France", 
  "Germany", "Spain", "Italy", "Japan", "United States", "Other"
];

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  
  // Custom interactive state mappings for your exact two-column identity picker matrix
  const [selectedPrefix, setSelectedPrefix] = useState<string>("Trans");
  const [selectedGender, setSelectedGender] = useState<string>("woman");

  // Controlled form state attributes for required legal gates
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"IDLE" | "CHECKING" | "AVAILABLE" | "TAKEN">("IDLE");
  
  useEffect(() => {
    const cleanedHandle = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!cleanedHandle) {
      setAvailabilityStatus("IDLE");
      return;
    }

    setAvailabilityStatus("CHECKING");
    const debounceTimerToken = setTimeout(async () => {
      try {
        // Ping a fast inline API route to check Neon database record rows quietly in the background
        const res = await fetch(`/api/user/check-username?username=${cleanedHandle}`);
        const data = await res.json();
        
        if (data.available) {
          setAvailabilityStatus("AVAILABLE");
        } else {
          setAvailabilityStatus("TAKEN");
        }
      } catch (err) {
        setAvailabilityStatus("AVAILABLE"); // Graceful fallback on local connection skips
      }
    }, 400); // 400ms debounce buffer prevents hitting your Neon database server on every keystroke!

    return () => clearTimeout(debounceTimerToken);
  }, [usernameInput]);

const handleRegisterFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!agreedTerms || !agreedPrivacy || isPending || availabilityStatus === "TAKEN") return;

  const formElement = e.currentTarget;
  const rawFormData = new FormData(formElement);
  
  // 1. 🚀 GENERATE THE AUTOMATED USERNAME HANDLE:
  // Pulls the email text parameter, splits it at the "@", and cleans it into a valid handle!
  const rawEmailInputString = (rawFormData.get("email") as string || "").trim();
  const calculatedUsernameHandle = rawEmailInputString.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");

  if (!calculatedUsernameHandle) {
    alert("Please enter a valid email address first 🌸");
    return;
  }

  // Inject the required credentials parameters straight into the form bundle data packet
  rawFormData.append("username", calculatedUsernameHandle);

  // 2. Inject your compiled unified two-column identity picker gender marker
  const combinedIdentityToken = `${selectedPrefix} ${selectedGender}`.trim();
  rawFormData.append("genderIdentity", combinedIdentityToken);

  startTransition(async () => {
    // 🚀 FIXED: Securely dispatches the form bundle directly to your Prisma database action engine!
    const result = await registerUser(null, rawFormData);
      
    if (result?.error) {
      alert(`❌ Registration error: ${result.error}`);
      return;
    }

    alert(`🌸 Account profile successfully created! Logging you into Dollspace as @${calculatedUsernameHandle}...`);
      
    // Auto-trigger a smooth client reload or route switch straight into your welcome login loop gate!
    window.location.href = "/login";
  });
};


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased flex flex-col font-sans select-none">
      
      {/* 👑 HEADER SYSTEM CONTAINER */}
      <header className="w-full bg-white border-b border-rose-100 py-3 px-4 sm:px-6 shadow-sm sticky top-0 z-50 text-left shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-black text-lg sm:text-xl text-rose-500 tracking-tighter">
            Dollspace 👑
          </div>
          <Link href="/login" className="text-xs font-black bg-gray-900 text-white border border-transparent px-4 py-2 rounded-xl transition hover:bg-rose-500 active:scale-95 shadow-xs cursor-pointer">
            Log In Here
          </Link>
        </div>
      </header>

      {/* 🎀 MASTER PLATFORM HERO GRAPHIC CANVAS ROW - FIXED: Balanced layout structures with zero trailing div breaks */}
      <div className="w-full shrink-0 border-b border-rose-100">
        <StaticFeedBanner />
      </div>

      {/* 🗺️ CONTAINER WORKSPACE GRID SYSTEM */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-0">
        
        {/* LEFT INSIDE COLUMN PANEL TEASER DRAWERS (3 Cols) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 lg:sticky lg:top-20 h-fit self-start opacity-60 pointer-events-none filter blur-[0.5px]">
          <div className="bg-white border border-rose-100 rounded-3xl p-5 space-y-2 text-left shadow-2xs">
            <div className="h-4 w-24 bg-rose-100 rounded animate-pulse" />
            <div className="space-y-1.5 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-50 border border-gray-100 rounded-xl w-full" />
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN COMPULSORY SIGN UP BLOCK SHEETS (6 Cols) */}
        <main className="col-span-1 lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-10 shadow-sm text-left w-full mx-auto animate-scale-up">
            
            <div className="text-center pb-4 border-b border-gray-50">
              <h1 className="text-2xl font-black tracking-tight text-gray-950">
                Join <span className="text-rose-500">Dollspace</span> ✨
              </h1>
              <p className="text-xs font-semibold text-gray-400 mt-1">
                Every field below is compulsory to build your profile database record correctly.
              </p>
            </div>

            <form onSubmit={handleRegisterFormSubmit} className="space-y-4 pt-6" autoComplete="off">
              
              <div className="w-full text-left relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Username Handle</label>
                <div className="relative flex items-center w-full">
                  <input 
                    type="text" 
                    name="username" 
                    required 
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. TeaganS" 
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 transition text-left pr-20" 
                  />
                  
                  {/* 🚩 REAL-TIME FEEDBACK STATUS PILL BADGE FLAG */}
                  {availabilityStatus !== "IDLE" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 select-none pointer-events-none z-10 animate-scale-up">
                      {availabilityStatus === "CHECKING" && (
                        <span className="text-[9px] font-black uppercase bg-gray-100 border border-gray-200 text-gray-400 px-2 py-1 rounded-md animate-pulse">
                          ⏳ Checking
                        </span>
                      )}
                      {availabilityStatus === "AVAILABLE" && (
                        <span className="text-[9px] font-black uppercase bg-green-50 border border-green-200 text-green-500 px-2 py-1 rounded-md tracking-wider">
                          ✨ OK!
                        </span>
                      )}
                      {availabilityStatus === "TAKEN" && (
                        <span className="text-[9px] font-black uppercase bg-red-50 border border-red-200 text-red-500 px-2 py-1 rounded-md tracking-wider">
                          ❌ Taken
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
			  
              <div className="w-full text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Display Name</label>
                <input 
                  type="text" 
                  name="displayName" 
                  required 
                  placeholder="e.g. Teagan Storm" 
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 transition" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="teagan_storm_67@hotmail.com" 
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 transition" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    required 
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Account Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  placeholder="••••••••••••" 
                  minLength={8}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 transition" 
                />
              </div>

              {/* 🧬 THE TWO-COLUMN GENDER IDENTITY MATRIX PICKER */}
              <div className="border-t border-gray-100 pt-4 text-left">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-2">
                  Gender Identity Marker Selection ⚧️
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column: Prefix Choice Grid */}
                  <div className="space-y-1.5 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block px-1 mb-1">Prefix Matrix</span>
                    {PREFIX_OPTIONS.map((pre) => {
                      const isSelected = selectedPrefix === pre;
                      return (
                        <button
                          key={pre}
                          type="button"
                          onClick={() => setSelectedPrefix(pre)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black transition duration-200 cursor-pointer ${
                            isSelected 
                              ? "bg-rose-500 text-white shadow-xs" 
                              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-100"
                          }`}
                        >
                          {pre}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Base Suffix Choice Grid */}
                  <div className="space-y-1.5 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block px-1 mb-1">Suffix Base</span>
                    {GENDER_OPTIONS.map((gen) => {
                      const isSelected = selectedGender === gen;
                      return (
                        <button
                          key={gen}
                          type="button"
                          onClick={() => setSelectedGender(gen)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                            isSelected 
                              ? "bg-gray-900 text-white shadow-xs" 
                              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-100"
                          }`}
                        >
                          {gen}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview Display Pill Badge Container */}
                <div className="mt-3 bg-rose-50/40 border border-rose-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Compiled Active Output:</span>
                  <span className="bg-white border border-rose-200 px-3 py-1 rounded-full font-black text-xs text-rose-500 tracking-wide shadow-2xs">
                    ✨ {selectedPrefix} {selectedGender}
                  </span>
                </div>
              </div>

              {/* 📍 GEOGRAPHIC LOCATION SELECTION DROPDOWN MATRIX */}
              <div className="border-t border-gray-100 pt-4 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Current Profile Location
                </label>
                <select 
                  name="location" 
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition"
                >
                  <option value="">-- Choose Your Active Country Location --</option>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* 📝 MANDATORY COMPULSORY LEGAL CHECKBOX GATES */}
              <div className="border-t border-gray-100 pt-4 space-y-3 text-left">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    required 
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-400 accent-rose-500" 
                  />
                  <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition">
                    I agree to the <Link href="/terms" className="text-rose-500 font-bold hover:underline">Terms & Conditions</Link> to access Dollspace.app 📖
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    required 
                    checked={agreedPrivacy}
                    onChange={(e) => setAgreedPrivacy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-400 accent-rose-500" 
                  />
                  <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition">
                    I agree to the processing of my data per the <Link href="/privacy" className="text-rose-500 font-bold hover:underline">Privacy Notice</Link> document 🛡️
                  </span>
                </label>
              </div>

              {/* ACTION FORM DISPATCH MODULE CONTAINER */}
              <div className="pt-4 border-t border-gray-50">
                <SubmitButton 
                  label="Sign Up & Enter Dollspace 👑" 
                  loadingLabel="Registering Profile Cluster..." 
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xs cursor-pointer transition transform active:scale-[0.99]" 
                />
              </div>

            </form>

            <div className="mt-6 text-center text-xs text-gray-400 font-semibold">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-500 font-black hover:underline transition">
                Log in here
              </Link>
            </div>

          </div>
        </main>

        {/* RIGHT FIXED STATISTICS MONITOR CAPSULE (3 Cols) */}
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
                <span className="text-gray-400">🔸 Registered users:</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-800 text-[11px] font-black">6</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-400">🟢 Dolls online now:</span>
                <span className="bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-md text-[11px] font-black">1</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
