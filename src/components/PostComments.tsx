// src/components/PostComments.tsx (PART 1 - PROFILE TAG LINKING UPGRADE)
"use client";

import { useState, useTransition } from "react";
import { createComment } from "@/app/actions/comments";
import SubmitButton from "./SubmitButton";
import Link from "next/link"; 
import { filterProfanity } from "@/lib/profanity"; 

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
  initialOpen?: boolean; 
  followersList?: Array<{ username: string; displayName: string }>; 
}

export default function PostComments({ 
  postId, 
  currentUserId, 
  comments: initialComments, 
  initialOpen = false,
  followersList = [] 
}: PostCommentsProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [commentText, setCommentText] = useState("");

  // 🚀 HIGH-SPEED REGEX TOKENIZER: Scans comment blocks for @handles and injects active Next.js links inline
  const renderCommentContentWithClickableTags = (text: string) => {
    if (!text.includes("@")) return text;

    // Splits the string body safely by picking up text matching word characters after an @ symbol
    const tokenParts = text.split(/(@[a-zA-Z0-9_]+)/g);
    
    return tokenParts.map((part, index) => {
      if (part.startsWith("@")) {
        const parsedHandleName = part.slice(1); // Clears the symbol char out to capture raw username string
        return (
          <Link 
            key={`tag-${index}`} 
            href={`/${parsedHandleName}`}
            className="text-rose-500 font-bold hover:underline select-text inline-block"
          >
            {part}
          </Link>
        );
      }
      return <span key={`text-${index}`} className="select-text">{part}</span>;
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isPending) return; // Block fast double taps
    
    const cleanText = commentText.trim();
    setCommentText(""); // Empty text box instantly for snappy UX

    startTransition(async () => {
      try {
        // 🚀 THE ULTIMATE ALIGNMENT: 
        // 1st: postId, 2nd: currentUserId (mapped to userId), 3rd: cleanText (mapped to content)
        const res = await createComment(postId, currentUserId, cleanText) as any;
        
        if (res && res.success) {
          const targetCommentNode = res.comment;

          const freshComment: CommentItem = {
            id: targetCommentNode.id,
            content: targetCommentNode.content,
            createdAt: new Date(targetCommentNode.createdAt).toISOString(),
            user: {
              displayName: targetCommentNode.user?.displayName || "Me",
              username: targetCommentNode.user?.username || "current",
              avatarUrl: targetCommentNode.user?.avatarUrl || null
            }
          };

          setComments((prev) => [...prev, freshComment]);
        } else {
          // Fallback UI safety restoration if error catches handled fields
          setCommentText(cleanText);
          console.error("Server action rejected verification payload:", res?.error);
        }
      } catch (err) {
        // Fallback UI safety restoration on complete network drop
        setCommentText(cleanText);
        console.error("Failed to push comment reply item transaction row:", err);
      }
    });
  };

  // src/components/PostComments.tsx (PART 2 - AUTCOMPLETE COMMENTING FIELD UPGRADE)
  
  // 🚀 IMPORT THE MENTION PICKER MODULE ENGINE
  const MentionInput = require("./MentionInput").default;

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
                  <Link href={`/${reply.user.username}`} className="shrink-0">
                    {reply.user.avatarUrl ? (
                      <img src={reply.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-100 shadow-sm" />
                    ) : (
                      <div className="w-7 h-7 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-[10px] uppercase shadow-sm">
                        {reply.user.displayName.charAt(0)}
                      </div>
                    )}
                  </Link>
                  <div className="bg-gray-50 p-2.5 rounded-2xl flex-1 border border-gray-100/60 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <Link 
                        href={`/${reply.user.username}`} 
                        className="font-black text-gray-900 truncate pr-2 hover:underline hover:text-rose-500 text-left block"
                      >
                        {reply.user.displayName}
                      </Link>
                      <span className="text-[9px] text-gray-400 font-bold shrink-0">
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap text-left break-words">
                      {/* 🎯 Filters profanity seamlessly before compiling clickable handles */}
                      {renderCommentContentWithClickableTags(filterProfanity(reply.content, true))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline Comment Composition Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
            <div className="flex-1">
              <MentionInput 
                value={commentText}
                onChange={(val: string) => setCommentText(val)}
                placeholder="Write a response... use @username to tag!"
                isTextArea={false}
                disabled={isPending}
                followersList={followersList} 
                className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 placeholder-gray-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !commentText.trim()}
              className="bg-gray-900 text-white font-black text-xs px-4 py-2.5 rounded-xl hover:bg-rose-500 transition shadow-sm tracking-wide disabled:opacity-40 shrink-0"
            >
              {isPending ? "Posting..." : "Reply"}
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
