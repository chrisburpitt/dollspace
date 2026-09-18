// src/components/EditProfileModal.tsx (PART 1 - LIFECYCLE & STATE HOOKS)
"use client";

import { useState, useTransition, useRef, useEffect } from "react"; // 🚀 Added useRef and useEffect
import { updateProfile } from "@/app/actions/profile"; 
import { useRouter } from "next/navigation"; 
import SubmitButton from "./SubmitButton";

interface EditProfileModalProps {
  user: {
    displayName: string;
    bio: string | null;
    location: string | null;
    genderIdentity: string | null;
    lookingFor: string | null;
    birthday: string | null;
    instagramHandle: string | null;
    facebookHandle: string | null;
  };
}

const LOOKING_FOR_TILES = ["Friends", "Support", "Relationship", "Learning", "Discovery", "Chat", "Resources"];
const PREFIX_OPTIONS = ["Trans", "Non-Binary", "Crossdresser", "Cis"];
const GENDER_OPTIONS = ["woman", "girl", "man", "boy"];
const parseInitialIdentity = (dbValue: string | null) => {
  if (!dbValue) return { prefix: "Trans", term: "woman" };
  if (dbValue === "Non-Binary") return { prefix: "Non-Binary", term: "" };
  
  const parts = dbValue.split(" ");
  return {
    prefix: parts[0] || "Trans",
    term: parts[1] || "woman"
  };
};

export default function EditProfileModal({ user }: EditProfileModalProps) {
  const router = useRouter(); 
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const modalInnerContentRef = useRef<HTMLDivElement>(null);
  const initialIdentity = parseInitialIdentity(user.genderIdentity);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [locationSearchQuery, setLocationSearchQuery] = useState(user.location || "");
  const [isUserActivelyTypingLocation, setIsUserActivelyTypingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationContainerRef = useRef<HTMLDivElement>(null);
  const [identityPrefix, setIdentityPrefix] = useState<string>(initialIdentity.prefix);
  const [identityTerm, setIdentityTerm] = useState<string>(initialIdentity.term);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>(
    user.lookingFor ? user.lookingFor.split(",").map((s: string) => s.trim()).filter(Boolean) : []
  );
  const initialDateStr = user.birthday 
    ? new Date(user.birthday).toISOString().substring(0, 10) 
    : "";
  const [birthday, setBirthday] = useState(initialDateStr);
  const [instagramHandle, setInstagramHandle] = useState(user.instagramHandle || "");
  const [facebookHandle, setFacebookHandle] = useState(user.facebookHandle || "");
  
  // 🚀 LIVE SEARCH TRIGGER: Contacts OpenStreetMap Nominatim endpoint dynamically
  useEffect(() => {
    if (!isUserActivelyTypingLocation || !locationSearchQuery.trim() || locationSearchQuery.length < 3) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const response = await fetch(`/api/location/search?q=${encodeURIComponent(locationSearchQuery)}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setLocationSuggestions(data);
          setShowLocationDropdown(true);
        } else {
          setLocationSuggestions([]);
        }
      } catch (err) {
        console.error("Predictive location autocomplete search fetch broke:", err);
        setLocationSuggestions([]);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [locationSearchQuery, isUserActivelyTypingLocation]);


  // 🚀 CLICK-OUTSIDE EVENT LISTENER: Shuts modal if a user clicks outside the inner ref boundaries
  useEffect(() => {
    function handleClickOutsideTheModalCard(event: MouseEvent) {
      if (modalInnerContentRef.current && !modalInnerContentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutsideTheModalCard);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideTheModalCard);
    };
  }, [isOpen]); 

  const handleToggleTileSelection = (tile: string) => {
    setSelectedLookingFor((prev) =>
      prev.includes(tile) ? prev.filter((t) => t !== tile) : [...prev, tile]
    );
  };

  const handleFormSubmitAction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const compiledLookingForString = selectedLookingFor.join(", ");

      // 🚀 CONCATENATION ENGINE: Blends the choices back into your exact database format string!
      const compiledIdentityString = identityPrefix === "Non-Binary" 
        ? "Non-Binary" 
        : `${identityPrefix} ${identityTerm}`;

      const payload = new FormData();
      payload.append("displayName", displayName);
      payload.append("bio", bio);
      payload.append("location", location);
      payload.append("genderIdentity", compiledIdentityString); 
      payload.append("lookingFor", compiledLookingForString); 
      payload.append("birthday", birthday);
      payload.append("instagramHandle", instagramHandle);
      payload.append("facebookHandle", facebookHandle);


      const res = await updateProfile(payload);
      if (res?.success) {
        setIsOpen(false);
        router.refresh(); 
      } else if (res?.error) {
        alert(res.error);
      }
    });
  };


  // src/components/EditProfileModal.tsx (PART 2 - INTERACTIVE FORM LAYOUTS)
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-white hover:bg-gray-50 text-gray-700 font-black text-xs px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition uppercase tracking-wider select-none shrink-0"
      >
        ⚙️ Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in text-left">
          
          {/* 🚀 modalInnerContentRef hooks the click-outside closer engine securely */}
          <div ref={modalInnerContentRef} className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col animate-scale-up">
            
            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-wide">Edit Custom Vibe</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleFormSubmitAction} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-semibold text-gray-700">
              
              {/* 1. DISPLAY NAME */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>

              {/* 2. DATE OF BIRTH */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Date of Birth</label>
                <input suppressHydrationWarning type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white transition" />
              </div>

              {/* 3. LOCATION SEARCH (UPGRADED PREDICTIVE AUTOFILL INTERFACE) */}
              <div className="space-y-1 relative" ref={locationContainerRef}>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Location</label>
                
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={locationSearchQuery} 
                    onChange={(e) => {
                      setIsUserActivelyTypingLocation(true);
					  setLocationSearchQuery(e.target.value);
                      setLocation(e.target.value); // Sync target data to your submission string state
                    }} 
                    placeholder="Search city, town, or country... 📍" 
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition pr-10" 
                  />
                  
                  {/* Live Search Loading Animation Node */}
                  {isSearchingLocation && (
                    <span className="absolute right-3 text-gray-400 animate-spin text-sm leading-none font-bold">
                      ⏳
                    </span>
                  )}
                </div>

                {/* 🚀 AUTOFILL DROPDOWN PANEL OVERLAY CONTAINER */}
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-50 p-1 animate-scale-up">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => {
                          // Clean up text format: Extracts full address but optimizes presentation view strings
                          setLocationSearchQuery(suggestion.display_name);
                          setLocation(suggestion.display_name); // Populates target database field configuration token
                          setShowLocationDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition truncate block"
                      >
                        📍 {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. DUAL GENDER IDENTITY SPECIFIC INTERACTIVE DROPDOWNS */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">How do you identify?</label>
                
                <div className="flex items-center space-x-3 w-full">
                  
                  {/* LEFT DROPDOWN: Core Prefix Selection (Trans / Non-Binary / Cis) */}
                  <div className="relative flex-1">
                    <select value={identityPrefix} 
					  onChange={(e) => {
                      const nextPrefix = e.target.value;
                        setIdentityPrefix(nextPrefix);
                        if (nextPrefix === "Non-Binary" || nextPrefix === "Crossdresser") {
                          setIdentityTerm("");
                        } else if (!identityTerm) {
                          setIdentityTerm("woman");
                        }
                      }}
                      className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white appearance-none transition cursor-pointer shadow-sm"
                    >
                      {PREFIX_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[8px] font-bold">▼</span>
                  </div>

                  {/* RIGHT DROPDOWN: Core Term Selection (man / woman / boy / girl) */}
                  <div className="relative flex-1">
				    <select value={identityTerm} 
                      onChange={(e) => setIdentityTerm(e.target.value)}
                      disabled={identityPrefix === "Non-Binary" || identityPrefix === "Crossdresser"}
                      className={`w-full border rounded-xl p-2.5 text-xs font-semibold appearance-none transition shadow-sm ${
                        identityPrefix === "Non-Binary"
                          ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-gray-50 border-gray-200 text-gray-800 focus:outline-none focus:bg-white cursor-pointer"
                      }`}
                    >
                      {identityPrefix === "Non-Binary" ? (
                        <option value="">Not Applicable</option>
                      ) : (
                        GENDER_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))
                      )}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[8px] font-bold">▼</span>
                  </div>

                </div>
              </div>

              {/* 5. WHAT ARE YOU LOOKING FOR INTERACTIVE TILES */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">What are you looking for?</label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {LOOKING_FOR_TILES.map((tile) => {
                    const isTileSelected = selectedLookingFor.includes(tile);
                    return (
                      <button
                        key={tile}
                        type="button"
                        onClick={() => handleToggleTileSelection(tile)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition shadow-sm ${
                          isTileSelected
                            ? "bg-rose-500 text-white border-rose-600 scale-102"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {tile}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. BIOGRAPHY DESCRIPTION */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Biography Description</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community your sweet story..." className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition resize-none leading-relaxed" />
              </div>

              {/* 7. INSTAGRAM SOCIAL CONTROL */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Instagram Handle</label>
                <input type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="e.g. chloe_luxe" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>

              {/* 8. FACEBOOK SOCIAL CONTROL */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Facebook Handle / Username</label>
                <input type="text" value={facebookHandle} onChange={(e) => setFacebookHandle(e.target.value)} placeholder="e.g. chloe.stevens.9" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>

              {/* LOWER DOCK CONTROL BUTTONS */}
              <div className="flex space-x-2 pt-2 shrink-0">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-xs uppercase tracking-wider transition">Cancel</button>
                <SubmitButton label="Save Changes" loadingLabel="Saving Vibe..." className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black p-3 rounded-xl text-xs uppercase tracking-wider transition shadow-sm" />
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
