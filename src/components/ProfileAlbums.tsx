// src/components/ProfileAlbums.tsx (PART 1 - PASTE THIS FIRST)
"use client";

import { useState, useTransition } from "react";
import { createAlbum, uploadPhotoToAlbum } from "@/app/actions/albums";
import SubmitButton from "./SubmitButton";

interface PhotoItem {
  id: string;
  url: string;
}

interface AlbumItem {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  photos: PhotoItem[];
}

interface ProfileAlbumsProps {
  albums: AlbumItem[];
  isOwner: boolean;
  onPhotoClick: (url: string) => void;
}

export default function ProfileAlbums({ albums, isOwner, onPhotoClick }: ProfileAlbumsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="font-black text-base text-gray-900 uppercase tracking-wide">Photo Albums</h3>
        {isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            ➕ Create New Album
          </button>
        )}
      </div>

      {/* 🚀 MODAL WINDOW A: CREATE NEW PHOTO ALBUM CONTAINER */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            action={async (formData) => {
              const res = await createAlbum(formData);
              if (res?.success) setShowCreateModal(false);
            }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl max-w-sm w-full space-y-4"
          >
            <h4 className="font-black text-lg text-gray-900">New Album</h4>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Album Title</label>
              <input type="text" name="name" required placeholder="e.g. Summer Lounge Vibes 🌸" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Description (Optional)</label>
              <textarea name="description" rows={2} placeholder="Add a sweet memory caption..." className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Privacy Tier</label>
              <select name="isPrivate" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none">
                <option value="false">🔓 Public Album (Visible to Everyone)</option>
                <option value="true">🔒 Private Album (Only Visible to Me)</option>
              </select>
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold p-2.5 rounded-xl text-xs">Cancel</button>
              <SubmitButton label="Create" loadingLabel="Building..." className="flex-1 bg-rose-500 text-white font-black p-2.5 rounded-xl text-xs" />
            </div>
          </form>
        </div>
      )}



  // src/components/ProfileAlbums.tsx (PART 2 - PASTE THIS DIRECTLY UNDERNEATH PART 1)
  return (
    <>
      {/* ALBUMS DECK OVERVIEW GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {albums.length === 0 ? (
          <p className="text-gray-400 text-xs italic py-4 col-span-2">No photo albums created yet.</p>
        ) : (
          albums.map((album) => {
            const hasPhotos = album.photos.length > 0;
            const coverPhoto = hasPhotos ? album.photos[album.photos.length - 1].url : null;

            return (
              <div key={album.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative group">
                {/* Album Cover Thumbnail Box */}
                <div 
                  onClick={() => hasPhotos && setActiveAlbumId(activeAlbumId === album.id ? null : album.id)}
                  className={`w-full h-32 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden ${hasPhotos ? "cursor-pointer hover:opacity-95" : ""} relative`}
                >
                  {coverPhoto ? (
                    <img src={coverPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-40">📸</span>
                  )}

                  {/* Privacy Flag Badge Indicator overlay */}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase shadow-sm ${
                    album.isPrivate ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-green-100 text-green-700 border border-green-200"
                  }`}>
                    {album.isPrivate ? "🔒 Private" : "🔓 Public"}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-gray-800 leading-tight">{album.name}</h4>
                  {album.description && <p className="text-gray-400 font-medium text-[11px] mt-0.5 line-clamp-1">{album.description}</p>}
                  <span className="text-[10px] text-rose-500 font-bold mt-1 block">{album.photos.length} Photos total</span>
                </div>

                {/* 🚀 PHOTO UPLOADER: Appears inside the card strictly for album owners */}
                {isOwner && (
                  <div className="border-t border-gray-50 pt-2.5 mt-1 flex items-center justify-between">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-wider cursor-pointer hover:text-rose-600 transition bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                      <span>{isPending ? "Uploading..." : "📷 Add Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isPending}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const formData = new FormData();
                          formData.append("photo", file);

                          startTransition(async () => {
                            await uploadPhotoToAlbum(formData, album.id);
                          });
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* EXPANDED INNER IMAGES DRAWER POP-DOWN WINDOW CARDS */}
                {activeAlbumId === album.id && hasPhotos && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-30 mt-2 grid grid-cols-4 gap-2 animate-scale-up">
                    {album.photos.map((pic) => (
                      <div 
                        key={pic.id} 
                        onClick={() => onPhotoClick(pic.url)}
                        className="aspect-square bg-gray-50 border border-gray-100 rounded-lg overflow-hidden cursor-zoom-in hover:opacity-90 transition"
                      >
                        <img src={pic.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </>
  );
}
