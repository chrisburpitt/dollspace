// src/components/PostComments.tsx
"use client";

import { useState, useTransition } from "react";
import { createComment } from "@/app/actions/comments";
import SubmitButton from "./SubmitButton";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
}

interface PostCommentsProps {
  postId: string;
  currentUserId: string;
  comments: CommentItem[];
  initialOpen?: boolean; // 🚀 FIXED: Added the missing typesafe parameter flag to interface maps!
}

export default function PostComments({ 
  postId, 
  currentUserId, 
  comments: initialComments, 
  initialOpen = false // 🚀 FIXED: Defaults to false if a card has 0 comments
}: PostCommentsProps) {
  const [isPending, startTransition] = useTransition();
  // 🚀 FIXED: Initializes the local open state straight from your auto-expand flag!
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const cleanText = commentText.trim();
    setCommentText("");

    startTransition(async () => {
      const res = await createComment(postId, cleanText);
      if (res?.success && res.comment) {
        // Serialize Date parameter safely into a client string
        const freshComment: CommentItem = {
          ...res.comment,
          createdAt: new Date(res.comment.createdAt).toISOString()
        };
        setComments((prev) => [...prev, freshComment]);
      }
    });
  };

  return (
    <div className="mt-4 border-t border-gray-50 pt-3 text-left">
      
      {/* Interactive toggle drawer trigger line */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-[11px] font-black uppercase tracking-wider text-gray-400 hover:text-rose-500 transition flex items-center space-x-1 select-none"
      >
        <span>💬</span>
        <span>{isOpen ? "Collapse Comments" : `View Comments (${comments.length})`}</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-scale-up">
          
          {/* Comments List Stream */}
          {comments.length > 0 && (
            <div className="space-y-3 pl-1 max-h-60 overflow-y-auto pr-1">
              {comments.map((reply) => (
                <div key={reply.id} className="flex items-start space-x-2.5 text-xs">
                  {reply.user.avatarUrl ? (
                    <img src={reply.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-100 shadow-sm shrink-0" />
                  ) : (
                    <div className="w-7 h-7 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-[10px] uppercase shrink-0 shadow-sm">
                      {reply.user.displayName.charAt(0)}
                    </div>
                  )}
                  <div className="bg-gray-50 p-2.5 rounded-2xl flex-1 border border-gray-100/60 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-black text-gray-900 truncate pr-2">{reply.user.displayName}</span>
                      <span className="text-[9px] text-gray-400 font-bold shrink-0">
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline Comment Composition Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={commentText}
              disabled={isPending}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a lovely comment response..."
              className="flex-1 border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 placeholder-gray-400 transition"
            />
            <button
              type="submit"
              disabled={isPending || !commentText.trim()}
              className="bg-gray-900 text-white font-black text-xs px-4 py-2.5 rounded-xl hover:bg-rose-500 transition shadow-sm tracking-wide disabled:opacity-40 disabled:hover:bg-gray-900"
            >
              Reply
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
