// src/components/PostComments.tsx
"use client";

import { useState } from "react";
import { createComment, deleteComment } from "@/app/actions/comments";
import Link from "next/link";
import SubmitButton from "./SubmitButton"; 

interface CommentUser {
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface CommentItem {
  id: string;
  content: string;
  userId: string;
  createdAt: Date | string;
  user: CommentUser;
}

interface PostCommentsProps {
  postId: string;
  currentUserId: string;
  comments: CommentItem[];
}

export default function PostComments({ postId, currentUserId, comments }: PostCommentsProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await createComment(postId, currentUserId, commentText);
    setCommentText("");
    setIsSubmitting(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {/* Drawer Toggle Bar Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-gray-500 hover:text-rose-500 font-bold text-xs transition flex items-center space-x-1.5"
      >
        <span>💬 Comments</span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
          {comments.length}
        </span>
      </button>

      {/* Sliding Input & Response Drawer */}
      {showComments && (
        <div className="mt-4 space-y-4 animate-fade-in text-left">

      {/* 🚀 2. REFACTORED SECURE COMMENT ACTION SUBMIT FORM */}
        <form 
          action={async (formData) => {
            const text = formData.get("commentContent") as string;
            if (!text.trim()) return;
          
            await createComment(postId, currentUserId, text);
            setCommentText(""); // Clears active field state text hooks smoothly
          }}
          className="flex gap-2 items-center"
        >
          <input
            type="text"
            name="commentContent"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a response..."
            className="flex-1 border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        
          {/* 🚀 3. MOUNT SMALL FORM-STATUS COMMENT BUTTON */}
          <SubmitButton 
            label="Post" 
            loadingLabel="Sending" 
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-4 py-2.5 rounded-xl transition"
          />
        </form>

          {/* 2. List Roster Stream Loop */}
          <div className="space-y-3 pt-2">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-xs italic px-1">No comments posted yet. Be the first to reply!</p>
            ) : (
              comments.map((comment) => {
                const isCommentOwner = comment.userId === currentUserId;
                return (
                  <div key={comment.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100 group relative">
                    {/* User Profile Avatar Link */}
                    {comment.user.avatarUrl ? (
                      <img src={comment.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shadow-sm shrink-0" />
                    ) : (
                      <div className="w-7 h-7 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {comment.user.displayName.charAt(0)}
                      </div>
                    )}
                    
                    {/* Content Details Block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link href={`/${comment.user.username}`} className="text-xs font-black text-gray-900 hover:underline">
                          {comment.user.displayName}
                        </Link>
                        <span className="text-[10px] text-gray-400 font-semibold">@{comment.user.username}</span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap mt-0.5 leading-relaxed">{comment.content}</p>
                    </div>

                    {/* Inline Trash Button - visible on hover to comment owner */}
                    {isCommentOwner && (
                      <button
                        onClick={async () => {
                          if (confirm("Delete this comment?")) {
                            await deleteComment(comment.id, currentUserId);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition absolute right-2.5 top-2.5 text-xs"
                        title="Delete comment"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
