// src/components/PostControls.tsx
"use client";

import { useTransition } from "react";
import { deletePostAction } from "@/app/actions/deletePost"; // Matches your native delete post action script path

interface PostControlsProps {
  postId: string;
  postOwnerId: string;
  currentUserId: string;
  reactions: any[];
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onSaveEdit: () => void;
  isEditPending: boolean;
}

export default function PostControls({
  postId,
  postOwnerId,
  currentUserId,
  reactions,
  isEditing,
  setIsEditing,
  onSaveEdit,
  isEditPending
}: PostControlsProps) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const isOwner = postOwnerId === currentUserId;

  const handleDeletePost = () => {
    if (!confirm("🚨 Are you sure you want to permanently delete this update from your timeline?")) return;
    
    startDeleteTransition(async () => {
      // Direct call out into your existing background archival delete action script
      await deletePostAction(postId);
    });
  };

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50/60 select-none">
      
      {/* LEFT: Like and Social Reactions Group Metric Buttons */}
      <div className="flex items-center space-x-4 text-xs font-bold text-gray-500">
        <button type="button" className="hover:text-rose-500 transition flex items-center space-x-1">
          <span>💖</span>
          <span>{reactions?.length || 0}</span>
        </button>
      </div>

      {/* RIGHT: Owner Maintenance Management Commands (Edit and Delete clustered cleanly) */}
      {isOwner && (
        <div className="flex items-center space-x-2.5 text-[10px] uppercase font-black tracking-wider">
          
          {/* 🚀 UPGRADED LAYER: Inline Edit states positioned perfectly to the left of the delete button! */}
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button 
                type="button" 
                onClick={onSaveEdit} 
                disabled={isEditPending} 
                className="text-green-500 hover:text-green-600 transition disabled:opacity-40"
              >
                {isEditPending ? "Saving..." : "💾 Save"}
              </button>
              <span className="text-gray-300">•</span>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                disabled={isEditPending} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => setIsEditing(true)} 
              className="text-gray-400 hover:text-gray-800 transition flex items-center space-x-1"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
          )}

          {/* Spacer Dot separator line */}
          <span className="text-gray-300 select-none">•</span>

          {/* Standard Native Delete Button Row */}
          <button
            type="button"
            disabled={isDeletePending}
            onClick={handleDeletePost}
            className="text-gray-400 hover:text-red-500 transition flex items-center space-x-1 disabled:opacity-40"
          >
            <span>🗑️</span>
            <span>{isDeletePending ? "Deleting..." : "Delete"}</span>
          </button>

        </div>
      )}

    </div>
  );
}
