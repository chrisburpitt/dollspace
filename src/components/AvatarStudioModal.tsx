"use client";

import { useState, useRef, useEffect } from "react";
import { processProfileImageCanvas } from "@/lib/imageProcessor";

interface AvatarStudioModalProps {
  file: File;
  onClose: () => void;
  onSave: (processedBlob: Blob) => Promise<void>;
}

export default function AvatarStudioModal({ file, onClose, onSave }: AvatarStudioModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isMirrored, setIsMirrored] = useState(false);
  
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropSize, setCropSize] = useState(100);
  
  const [isProcessing, setIsSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  useEffect(() => {
    if (!imgRef.current || !previewCanvasRef.current) return;
    
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 150;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (isMirrored) ctx.scale(-1, 1);
    ctx.translate(-size / 2, -size / 2);

    const naturalImg = imgRef.current;
    const sourceMin = Math.min(naturalImg.naturalWidth, naturalImg.naturalHeight);
    const sourceSizePixels = (cropSize / 100) * sourceMin;
    const sourceXPixels = (cropX / 100) * (naturalImg.naturalWidth - sourceSizePixels);
    const sourceYPixels = (cropY / 100) * (naturalImg.naturalHeight - sourceSizePixels);

    ctx.drawImage(
      naturalImg,
      sourceXPixels,
      sourceYPixels,
      sourceSizePixels,
      sourceSizePixels,
      0,
      0,
      size,
      size
    );
    ctx.restore();
  }, [rotation, isMirrored, cropX, cropY, cropSize, imageSrc]);

  const handleApplyTransformations = async () => {
    if (!imgRef.current) return;
    setIsSaving(true);
    try {
      const finalBlob = await processProfileImageCanvas(imgRef.current, {
        rotation,
        isMirrored,
        cropX,
        cropY,
        cropSize
      });
      if (finalBlob) {
        await onSave(finalBlob);
      } else {
        alert("Failed to extract edited image layer.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during canvas processing.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-left space-y-6 flex flex-col max-h-[90vh] overflow-y-auto scrollbar-none">
        
        <div>
          <h3 className="font-black text-base text-gray-950 dark:text-white uppercase tracking-wide">
            Avatar <span className="text-rose-500">Studio</span> 📸
          </h3>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
            Crop, rotate, and mirror your photo before committing your upload.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80 gap-4">
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt="" 
            className="hidden" 
            onLoad={() => setCropSize(100)}
          />
          <div className="relative p-1 bg-white dark:bg-gray-900 rounded-full border-4 border-rose-400 shadow-md overflow-hidden">
            <canvas ref={previewCanvasRef} className="rounded-full w-32 h-32 object-cover block" />
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
              <span>Zoom/Crop Area</span>
              <span className="text-rose-500 font-bold">{100 - cropSize + 100}%</span>
            </div>
            <input 
              type="range" min="20" max="100" step="1" value={cropSize} 
              onChange={(e) => setCropSize(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 block">X-Offset</label>
              <input 
                type="range" min="0" max="100" step="1" value={cropX} 
                onChange={(e) => setCropX(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 block">Y-Offset</label>
              <input 
                type="range" min="0" max="100" step="1" value={cropY} 
                onChange={(e) => setCropY(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="flex-1 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer"
          >
            🔄 Rotate 90°
          </button>
          <button
            type="button"
            onClick={() => setIsMirrored((prev) => !prev)}
            className={`flex-1 font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition border cursor-pointer ${
              isMirrored 
                ? "bg-rose-50 dark:bg-rose-950/20 text-rose-500 border-rose-200 dark:border-rose-900/30" 
                : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
            }`}
          >
            ↔️ Mirror Flip
          </button>
        </div>

        <div className="flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 font-black text-[10px] uppercase tracking-wider py-3 border border-gray-200 dark:border-gray-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyTransformations}
            disabled={isProcessing}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider py-3 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? "Processing..." : "Apply & Save ✨"}
          </button>
        </div>

      </div>
    </div>
  );
}
