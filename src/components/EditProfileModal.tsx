// src/components/EditProfileModal.tsx (PART 1 OF 3)
"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile"; 
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

export default function EditProfileModal({ user }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [genderIdentity, setGenderIdentity] = useState(user.genderIdentity || "");
  const [lookingFor, setLookingFor] = useState(user.lookingFor || "");

  const initialDateStr = user.birthday ? new Date(user.birthday).toISOString().split("T")[0] : "";
  const [birthday, setBirthday] = useState(initialDateStr);
  const [instagramHandle, setInstagramHandle] = useState(user.instagramHandle || "");
  const [facebookHandle, setFacebookHandle] = useState(user.facebookHandle || "");

  const handleFormSubmitAction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = new FormData();
      payload.append("displayName", displayName);
      payload.append("bio", bio);
      payload.append("location", location);
      payload.append("genderIdentity", genderIdentity);
      payload.append("lookingFor", lookingFor);
      payload.append("birthday", birthday);
      payload.append("instagramHandle", instagramHandle);
      payload.append("facebookHandle", facebookHandle);

      const res = await updateProfile(payload);
      if (res?.success) {
        setIsOpen(false);
        window.location.reload();
      } else if (res?.error) {
        alert(res.error);
      }
    });
  };
  // src/components/EditProfileModal.tsx (PART 2 OF 3)
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col animate-scale-up">
            
            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-wide">Edit Custom Vibe</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleFormSubmitAction} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-semibold text-gray-700">
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Date of Birth</label>
                <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white transition" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Sydney, Australia 📍" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>
              {/* src/components/EditProfileModal.tsx (PART 3 OF 3) */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Gender Identity</label>
                 setGenderIdentity(e.target.value) placeholder="e.g. Doll / Princess ✨" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Instagram Handle</label>
                <input type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="e.g. chloe_luxe" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Facebook Handle / Username</label>
                <input type="text" value={facebookHandle} onChange={(e) => setFacebookHandle(e.target.value)} placeholder="e.g. chloe.stevens.9" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Looking For (Comma Separated)</label>
                <input type="text" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="e.g. Friends, Networking, Collaborations" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Biography Description</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community your sweet story..." className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition resize-none leading-relaxed" />
              </div>

              <div className="flex space-x-2 pt-2 shrink-0">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-xs uppercase tracking-wider transition">Cancel</button>
                <SubmitButton label="Save Changes" loadingLabel="Rewriting Bio..." className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black p-3 rounded-xl text-xs uppercase tracking-wider transition shadow-sm" />
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
