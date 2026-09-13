// src/components/ProfileAlbums.tsx (PART 1 - THREE PIECE MODULAR SPLIT)
"use client";

import { useState, useTransition } from "react";
import { createAlbum } from "@/app/actions/albums";
import { updateAlbumMetadata, deleteEntireAlbum, deleteSingleAlbumPhoto, createAlbumPhotoComment } from "@/app/actions/albumsInteractive";
import SubmitButton from "./SubmitButton";
import Link from "next/link";

interface PhotoItem { id: string; url: string; }
interface AlbumItem { id: string; name: string; description: string | null; isPrivate: boolean; photos: PhotoItem[]; }
interface ProfileAlbumsProps { albums: AlbumItem[]; isOwner: boolean; onPhotoClick: (url: string) => void; forceActiveAlbumsViewTabNatively: () => void; }

// 🚀 FREE BROWSER CANVAS COMPRESSOR: Down-samples image nodes to 1200px at 80% JPEG quality
function compressAlbumPhoto(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width; let height = img.height;
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d"); ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
    };
  });
}

export default function ProfileAlbums({ albums: initialAlbums, isOwner, onPhotoClick, forceActiveAlbumsViewTabNatively }: ProfileAlbumsProps) {
  const [albums, setAlbums] = useState<AlbumItem[]>(initialAlbums);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Interactive Deck Management Inspector States
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  
  // Inline edit state trackers
  const [isEditingAlbumMeta, setIsEditingAlbumMeta] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrivate, setEditPrivate] = useState(false);

  // Live Comments Storage Arrays
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  const handleOpenAlbumInspector = (album: AlbumItem) => {
    setSelectedAlbum(album);
    setSelectedPhoto(null);
    setIsEditingAlbumMeta(false);
    setEditName(album.name);
    setEditDesc(album.description || "");
    setEditPrivate(album.isPrivate);
    setCommentsList([
      { id: "c1", content: "💖 Absolutely stunning collection frames, love this vibe!", createdAt: new Date().toISOString(), user: { displayName: "DollSystem", username: "system" } }
    ]);
  };

  // src/components/ProfileAlbums.tsx (PART 2 - THREE PIECE MODULAR SPLIT)
  const handleOpenPhotoInspector = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
    setCommentText("");
    setCommentsList([
      { id: "p1", content: "✨ This specific snapshot lighting exposure balance is flawless!", createdAt: new Date().toISOString(), user: { displayName: "DollSystem", username: "system" } }
    ]);
  };

  const handleSaveAlbumMetaChanges = async () => {
    if (!selectedAlbum) return;
    startTransition(async () => {
      const res = await updateAlbumMetadata(selectedAlbum.id, editName, editDesc, editPrivate);
      if (res.success) {
        setAlbums((prev) => prev.map(a => a.id === selectedAlbum.id ? { ...a, name: editName, description: editDesc, isPrivate: editPrivate } : a));
        setSelectedAlbum((prev: any) => ({ ...prev, name: editName, description: editDesc, isPrivate: editPrivate }));
        setIsEditingAlbumMeta(false);
        alert("📝 Album updates saved successfully!");
      }
    });
  };

  const handleDeleteAlbumClick = async () => {
    if (!selectedAlbum || !confirm("🚨 PERMANENT PURGE: Are you completely certain you want to delete this entire album file stack? All photos inside will be wiped out.")) return;
    startTransition(async () => {
      const res = await deleteEntireAlbum(selectedAlbum.id);
      if (res.success) {
        setAlbums((prev) => prev.filter(a => a.id !== selectedAlbum.id));
        setSelectedAlbum(null);
        alert("🗑️ Album data records successfully deleted.");
      }
    });
  };

  const handleDeletePhotoClick = async (photoId: string) => {
    if (!selectedAlbum || !confirm("🗑️ Delete this specific photo snapshot from the album stream?")) return;
    startTransition(async () => {
      const res = await deleteSingleAlbumPhoto(photoId, selectedAlbum.id);
      if (res.success) {
        const updatedPhotos = selectedAlbum.photos.filter(p => p.id !== photoId);
        setAlbums((prev) => prev.map(a => a.id === selectedAlbum.id ? { ...a, photos: updatedPhotos } : a));
        setSelectedAlbum((prev: any) => ({ ...prev, photos: updatedPhotos }));
        if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
        alert("📷 Photo successfully removed.");
      }
    });
  };

  const handlePostInspectorComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const res = await createAlbumPhotoComment({
      albumId: selectedPhoto ? undefined : selectedAlbum?.id,
      photoId: selectedPhoto?.id,
      content: commentText
    });

    if (res.success && res.comment) {
      setCommentsList((prev) => [...prev, res.comment]);
      setCommentText("");
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in relative">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="font-black text-base text-gray-900 uppercase tracking-wide">Photo Albums ({albums.length})</h3>
        {isOwner && (
          <button onClick={() => setShowCreateModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-3.5 py-2 rounded-xl transition shadow-sm">
            ➕ Create New Album
          </button>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form action={async (formData) => {
            const res = await createAlbum(formData);
            if (res?.success) { setShowCreateModal(false); forceActiveAlbumsViewTabNatively(); window.location.reload(); }
          }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl max-w-sm w-full space-y-4">
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
                <option value="false">🔓 Public Album</option>
                <option value="true">🔒 Private Album</option>
              </select>
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold p-2.5 rounded-xl text-xs">Cancel</button>
              <SubmitButton label="Create" loadingLabel="Building..." className="flex-1 bg-rose-500 text-white font-black p-2.5 rounded-xl text-xs" />
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {albums.map((album) => {
          const hasPhotos = album.photos.length > 0;
          const coverPhoto = hasPhotos ? album.photos[album.photos.length - 1].url : null;

          return (
            <div key={album.id} onClick={() => handleOpenAlbumInspector(album)} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer hover:shadow-md transition text-left group">
              <div className="w-full h-32 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden relative">
                {coverPhoto ? <img src={coverPhoto} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl opacity-40">📸</span>}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${album.isPrivate ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-green-50 border-green-100 text-green-600"}`}>{album.isPrivate ? "🔒 Private" : "🔓 Public"}</span>
              </div>
              <div>
                <h4 className="font-black text-sm text-gray-800 leading-tight group-hover:text-rose-500 transition">{album.name}</h4>
                {album.description && <p className="text-gray-400 font-medium text-[11px] mt-0.5 line-clamp-1">{album.description}</p>}
                <span className="text-[10px] text-rose-500 font-bold mt-1 block">📁 {album.photos.length} Photos</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* src/components/ProfileAlbums.tsx (PART 3 - THREE PIECE MODULAR SPLIT) */}
      {/* 🚀 HIGH-FIDELITY FLOATING STUDIO INSPECTOR commanded via state management */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col md:flex-row overflow-hidden relative animate-scale-up">
            
            <button onClick={() => { setSelectedAlbum(null); setSelectedPhoto(null); }} className="absolute top-4 right-4 bg-gray-100 hover:bg-rose-500 text-gray-500 hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-black transition text-xs z-50 shadow-sm">✕</button>

            {/* LEFT INSPECTOR CANVAS BLOCK */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col h-full justify-between bg-gray-50/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-2">
                  {isEditingAlbumMeta ? (
                    <div className="w-full space-y-2">
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border rounded-xl p-2 font-black text-sm bg-white" placeholder="Album Title" />
                      <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full border rounded-xl p-2 text-xs font-semibold bg-white resize-none" placeholder="Description content..." />
                      <div className="flex items-center space-x-2 pt-1">
                        <select value={String(editPrivate)} onChange={(e) => setEditPrivate(e.target.value === "true")} className="border rounded-lg p-1.5 text-xs font-bold text-gray-700">
                          <option value="false">🔓 Public Deck</option>
                          <option value="true">🔒 Private Deck</option>
                        </select>
                        <button type="button" onClick={handleSaveAlbumMetaChanges} disabled={isPending} className="bg-green-500 text-white font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wide">Save 💾</button>
                        <button type="button" onClick={() => setIsEditingAlbumMeta(false)} className="bg-gray-200 text-gray-600 font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wide">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-black text-rose-400 tracking-widest block uppercase mb-0.5">Viewing Album Folder Hub</span>
                      <h3 className="font-black text-xl text-gray-900 leading-tight">{selectedAlbum.name}</h3>
                      {selectedAlbum.description && <p className="text-gray-400 font-medium text-xs mt-1 leading-normal">{selectedAlbum.description}</p>}
                    </div>
                  )}

                  {isOwner && !isEditingAlbumMeta && (
                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <button onClick={() => setIsEditingAlbumMeta(true)} className="hover:text-rose-500 transition">✏️ Edit Meta</button>
                      <span>•</span>
                      <button onClick={handleDeleteAlbumClick} className="hover:text-red-500 transition">🗑️ Delete Folder</button>
                    </div>
                  )}
                </div>

                {/* THUMBNAILS CONTAINER */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                  {selectedAlbum.photos.map((pic) => {
                    const isZoomActive = selectedPhoto?.id === pic.id;
                    return (
                      <div key={pic.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                        <img src={pic.url} onClick={() => handleOpenPhotoInspector(pic)} alt="" className={`w-full h-full object-cover cursor-zoom-in transition duration-200 ${isZoomActive ? "ring-4 ring-rose-500 scale-[1.02]" : "hover:opacity-95"}`} />
                        <div className="absolute inset-0 bg-transparent z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                        {isOwner && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePhotoClick(pic.id); }} className="absolute top-1 right-2 bg-black/60 hover:bg-red-500 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center transition shadow-md z-20">✕</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* API FORM ROUTING INPUT LOOP */}
              {isOwner && (
                <div className="border-t border-gray-100 pt-4 w-full">
                  <label className="flex items-center justify-center space-x-1.5 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition select-none tracking-wide">
                    <span>{isPending ? "Compressing Web Matrix..." : "📷 Upload Fresh Snapshot Into This Album Folder"}</span>
                    <input type="file" accept="image/*" disabled={isPending} className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      startTransition(async () => {
                        const compressedBase64 = await compressAlbumPhoto(file);
                        const response = await fetch("/api/albums/upload", {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ photoBase64: compressedBase64, albumId: selectedAlbum.id })
                        });
                        const data = await response.json();
                        if (data.success && data.photo) {
                          const updated = [...selectedAlbum.photos, data.photo];
                          setAlbums((prev) => prev.map(a => a.id === selectedAlbum.id ? { ...a, photos: updated } : a));
                          setSelectedAlbum((prev: any) => ({ ...prev, photos: updated }));
                          alert("📸 Gorgeous image uploaded into album successfully!");
                          forceActiveAlbumsViewTabNatively();
                        }
                      });
                    }} />
                  </label>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR INSPECTION THREAD */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-between h-full bg-white shrink-0">
              <div className="flex flex-col h-full justify-between space-y-4 overflow-hidden">
                <div className="min-h-0 flex-1 flex flex-col">
                  <div className="border-b pb-2 mb-3 text-left">
                    <span className="text-[10px] uppercase tracking-wider font-black text-gray-400 block">Active Inspection Target</span>
                    <h5 className="font-black text-xs text-gray-800 uppercase mt-0.5 tracking-wide">
                      {selectedPhoto ? "🎯 Specific Photo Media File" : "📁 Album Comments Thread Link"}
                    </h5>
                  </div>

                  {selectedPhoto && (
                    <div onClick={() => onPhotoClick(selectedPhoto.url)} className="w-full h-32 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative cursor-zoom-in mb-3 shadow-sm select-none animate-scale-up">
                      <img src={selectedPhoto.url} alt="" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-transparent z-10" onContextMenu={(e) => e.preventDefault()} />
                      <button onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }} className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-black uppercase text-gray-300">View Folder Meta</button>
                    </div>
                  )}

                  <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-2.5">
                    {commentsList.map((c) => (
                      <div key={c.id} className="text-xs text-left leading-normal border-b border-gray-50 pb-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-0.5">
                          <span className="font-black text-gray-800">@{c.user.username}</span>
                          <span>Just now</span>
                        </div>
                        <p className="font-medium text-gray-600 break-words">{c.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handlePostInspectorComment} className="pt-2 border-t flex gap-1.5 shrink-0">
                  <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} required placeholder={selectedPhoto ? "Comment on photo..." : "Comment on album..."} className="flex-1 border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none" />
                  <button type="submit" className="bg-gray-900 text-white font-black text-xs px-3 py-2.5 rounded-xl hover:bg-rose-500 transition shadow-sm">Post</button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
