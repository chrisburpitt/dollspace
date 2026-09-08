// src/components/SubmitButton.tsx
"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
}

export default function SubmitButton({ 
  label, 
  loadingLabel = "Posting...", 
  className = "bg-rose-500 hover:bg-rose-600 text-white font-black text-sm px-6 py-3 rounded-xl transition shadow-sm" 
}: SubmitButtonProps) {
  // Automatically detects if the parent <form action={...}> is currently executing a Server Action
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {pending && (
        // 🔄 Smooth CSS Rotating Loading Spinner Element
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span>{pending ? loadingLabel : label}</span>
    </button>
  );
}
