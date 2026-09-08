// src/components/EditProfileModal.tsx
"use client";

import { useState } from "react";
import { updateProfileDetails } from "@/app/actions/profile";

interface EditProfileModalProps {
  user: {
    id: string;
    displayName: string;
    age: number | null;
    genderIdentity: string | null;
    location: string | null;
    bio: string | null;
    lookingFor: string | null;
  };
}

export default function EditProfileModal({ user }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Field Local States
  const [displayName, setDisplayName] = useState(user.displayName);
  const [age, setAge] = useState(user.age ? user.age.toString() : "");
  const [genderIdentity, setGenderIdentity] = useState(user.genderIdentity || "");
  const [location, setLocation] = useState(user.location || "");
  const [bio, setBio] = useState(user.bio || "");
  const [lookingFor, setLookingFor] = useState(user.lookingFor || "FRIENDS");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const parsedAge = age.trim() ? parseInt(age, 10) : null;
    if (parsedAge !== null && isNaN(parsedAge)) {
      setError("Please enter a valid number for age.");
      setIsSaving(false);
      return;
    }

    const res = await updateProfileDetails(user.id, {
      displayName,
      age: parsedAge,
      genderIdentity,
      location,
      bio,
      lookingFor,
    });

    setIsSaving(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Edit Profile Action Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white hover:bg-rose-50 hover:text-rose-600 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs border border-gray-200 shadow-sm transition ml-auto flex items-center space-x-1"
      >
        <span>✏️ Edit Profile</span>
      </button>

      {/* Floating Popover Overlay Frame Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-gray-200 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            
            <h2 className="text-xl font-black text-gray-900 mb-1">Edit Profile Cards</h2>
            <p className="text-gray-400 text-xs font-semibold mb-6">Customize your metrics and background information card bio.</p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Display Name & Age Grid Layout */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-gray-800"
                    placeholder="E.g. Chloe Smith"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-gray-800"
                    placeholder="24"
                  />
                </div>
              </div>

              {/* Row 2: Gender Identity & Location Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Gender Identity</label>
                   setGenderIdentity(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-gray-800"
                    placeholder="E.g. Female"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-gray-800"
                    placeholder="E.g. Brisbane, QLD"
                  />
                </div>
              </div>

              {/* Row 3: Custom "Looking For" Dropdown Selection Menu */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Looking For</label>
                <select
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-bold text-gray-700 cursor-pointer"
                >
                  <option value="FRIENDS">Friends</option>
                  <option value="SUPPORT">Support</option>
                  <option value="SUGAR_DADDY">Sugar Daddy</option>
                </select>
              </div>

              {/* Row 4: Personal Bio Textarea Box */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Biography</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-gray-800 resize-none"
                  rows={3}
                  placeholder="Tell Dollspace about yourself..."
                />
              </div>

              {/* Lower Console Actions Button Suite Panel */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
