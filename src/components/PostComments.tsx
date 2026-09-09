// src/components/PostComments.tsx
"use client";

import { useState } from "react";
import { createComment, deleteComment } from "@/app/actions/comments";
import Link from "next/link";
import SubmitButton from "./SubmitButton";

interface CommentItem {
  id: string;
  content: string;
  userId: string;
  parentId: string | null;
  createdAt: Date | string;
  user: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface PostCommentsProps {
  postId: string;
  currentUserId: string;
  comments: CommentItem[];
}

export default function PostComments({ postId, currentUserId, comments }: PostCommentsProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // 🚀 UTILITY: Automatically highlight and hyper-link tagged users in comments text nodes
  const renderCommentContent = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const username = part.substring(1);
        return (
          <Link key={index} href={`/${username}`} className="text-rose-500 font-black hover:underline">
            {part}
          </Link>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Group top-level conversations separate from nested sub-replies arrays
  const rootComments = comments.filter(c => !c.parentId);
  const getRepliesForParent = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-gray-500 hover:text-rose-500 font-bold text-xs transition flex items-center space-x-1.5"
      >
        <span>💬 Comments</span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
          {comments.length}
        </span>
      </button>

      {showComments && (
        <div className="mt-4 space-y-4 animate-fade-in text-left">
          
          {/* Main Top-Level Submission Input Form Container */}
          <form 
            action={async () => {
              if (!commentText.trim()) return;
              await createComment(postId, currentUserId, commentText, null);
              setCommentText("");
            }}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              name="commentContent"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a response... Use @username to tag friends!"
              className="flex-1 border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <SubmitButton label="Post" loadingLabel="Sending" className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-4 py-2.5 rounded-xl transition" />
          </form>

          {/* Root Level Message Iterators */}
          <div className="space-y-4 pt-2">
            {rootComments.length === 0 ? (
              <p className="text-gray-400 text-xs italic px-1">No comments posted yet.</p>
            ) : (
              rootComments.map((comment) => {
                const childReplies = getRepliesForParent(comment.id);
                const isCommentOwner = comment.userId === currentUserId;

                return (
                  <div key={comment.id} className="space-y-2 border-l-2 border-gray-100 pl-3 ml-1">
                    
                    {/* Primary Single Card Layout Box */}
                    <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 group relative">
                      <div className="flex items-start gap-2.5">
                        {comment.user.avatarUrl ? (
                          <img src={comment.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 shadow-sm" />
                        ) : (
                          <div className="w-7 h-7 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {comment.user.displayName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link href={`/${comment.user.username}`} className="text-xs font-black text-gray-900 hover:underline">
                              {comment.user.displayName}
                            </Link>
                            <span className="text-[10px] text-gray-400 font-semibold">@{comment.user.username}</span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium mt-0.5 leading-relaxed">
                            {renderCommentContent(comment.content)}
                          </p>
                          
                          {/* Inner Interaction Actions Panel Drawer */}
                          <div className="mt-2 flex items-center space-x-3 text-[10px] font-black text-gray-400 tracking-wide uppercase">
                            <button 
                              onClick={() => {
                                setReplyTargetId(replyTargetId === comment.id ? null : comment.id);
                                setReplyText(`@${comment.user.username} `); // Autofills tagging token anchor seamlessly
                              }}
                              className="hover:text-rose-500 transition"
                            >
                              Reply ↩
                            </button>
                          </div>
                        </div>
                      </div>

                      {isCommentOwner && (
                        <button
                          onClick={async () => { if (confirm("Delete comment?")) await deleteComment(comment.id, currentUserId); }}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition absolute right-2.5 top-2.5 text-xs"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Form Toggle Container Input field */}
                    {replyTargetId === comment.id && (
                      <form 
                        action={async () => {
                          if (!replyText.trim()) return;
                          await createComment(postId, currentUserId, replyText, comment.id);
                          setReplyText("");
                          setReplyTargetId(null);
                        }}
                        className="flex gap-2 items-center pl-4 animate-fade-in"
                      >
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to @${comment.user.username}...`}
                          className="flex-1 border border-gray-200 rounded-xl p-2 bg-gray-50 text-[11px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                        <SubmitButton label="Reply" loadingLabel="Sending" className="bg-gray-800 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition" />
                      </form>
                    )}

                    {/* Nested Child Replies Iterators Loop Rendering Block */}
                    {childReplies.map((reply) => {
                      const isReplyOwner = reply.userId === currentUserId;
                      return (
                        <div key={reply.id} className="pl-6 flex items-start gap-2.5 p-2 rounded-xl bg-rose-50/20 border border-rose-100/40 group relative ml-2 animate-fade-in">
                          {reply.user.avatarUrl ? (
                            <img src={reply.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm" />
                          ) : (
                            <div className="w-6 h-6 bg-rose-300 text-white rounded-full flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                              {reply.user.displayName.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link href={`/${reply.user.username}`} className="text-[11px] font-black text-gray-900 hover:underline">
                                {reply.user.displayName}
                              </Link>
                              <span className="text-[9px] text-gray-400 font-semibold">@{reply.user.username}</span>
                            </div>
                            <p className="text-[11px] text-gray-700 font-medium mt-0.5 leading-relaxed">
                              {renderCommentContent(reply.content)}
                            </p>
                          </div>

                          {isReplyOwner && (
                            <button
                              onClick={async () => { if (confirm("Delete reply?")) await deleteComment(reply.id, currentUserId); }}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition absolute right-2.5 top-2 text-xs"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      );
                    })}

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
