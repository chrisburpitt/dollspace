// src/components/EditProfileModal.tsx
"use client";

import { useState } from "react";
import { updateProfileDetails } from "@/app/actions/profile";
import LocationAutofill from "./LocationAutofill"; // 👈 IMPORT THE SPLIT INPUT

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

  // Form State Values
  const [displayName, setDisplayName] = useState(user.displayName);
  const [age, setAge] = useState(user.age ? user.age.toString() : "");
  const [genderIdentity, setGenderIdentity] = useState(user.genderIdentity || "tgirl");
  const [location, setLocation] = useState(user.location || "");
  const [bio, setBio] = useState(user.bio || "");

  // Multi-Select Looking For Array State
  const [lookingList, setLookingList] = useState<string[]>(
    user.lookingFor ? user.lookingFor.split(",") : []
  );

  const handleToggleLookingFor = (value: string) => {
    if (lookingList.includes(value)) {
      setLookingList(lookingList.filter((item) => item !== value));
    } else {
      setLookingList([...lookingList, value]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      lookingFor: lookingList.join(","),
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
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white hover:bg-rose-50 hover:text-rose-600 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs border border-gray-200 shadow-sm transition ml-auto flex items-center space-x-1"
      >
        <span>✏️ Edit Profile</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-gray-200 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            
            <h2 className="text-xl font-black text-gray-900 mb-1">Edit Profile Details</h2>
            <p className="text-gray-400 text-xs font-semibold mb-6">Update your custom profile card configurations.</p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Fields: Name & Age */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* Fields: Gender Radio Grid Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Gender Identity</label>
                <div className="grid grid-cols-3 gap-2">
                  {["tgirl", "crossdresser", "chaser"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenderIdentity(g)}
                      className={`p-3 text-xs font-bold rounded-xl border text-center transition capitalize ${
                        genderIdentity === g
                          ? "bg-rose-50 border-rose-400 text-rose-600 shadow-sm"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields: Standalone Autofill Component */}
              <LocationAutofill value={location} onChange={setLocation} />

              {/* Fields: Looking For Multi-Select Tags */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Looking For (Select multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "friends", label: "Friends" },
                    { key: "support", label: "Support" },
                    { key: "sugar_daddy", label: "Sugar Daddy" },
                  ].map((item) => {
                    const isSelected = lookingList.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleToggleLookingFor(item.key)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                          isSelected
                            ? "bg-rose-50 border-rose-400 text-rose-600 shadow-sm"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected ? "✓ " : ""} {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fields: Biography Area */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Biography Description</label>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
                  rows={3}
                />
              </div>

              {/* Form Trigger Row Footer */}
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
                  className="bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
