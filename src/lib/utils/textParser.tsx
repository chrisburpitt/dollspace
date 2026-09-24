// src/lib/utils/textParser.tsx (FORCING NEW TABS NATIVELY ON HOME TIMELINES)
import Link from "next/link";

/**
 * Scans raw text blocks and transforms all '@username' strings into clickable profile links.
 */
export function renderPostContentWithClickableTags(text: string) {
  if (!text) return "";
  if (!text.includes("@")) return <span className="select-text whitespace-pre-wrap">{text}</span>;

  // Split text by handles while capturing the matching handle token patterns
  const tokenParts = text.split(/(@[a-zA-Z0-9_]+)/g);
  
  return tokenParts.map((part, index) => {
    if (part.startsWith("@")) {
      const parsedHandleName = part.slice(1);
      return (
        // 🚀 THE NEW TAB REDIRECTION:
        // Swapping to an anchor tag with target="_blank" forces all timeline profile links
        // to open in a brand new browser tab page cleanly!
        <a 
          key={`global-post-tag-${index}-${parsedHandleName}`} 
          href={`https://chloeishot.vercel.app/${parsedHandleName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-500 font-extrabold hover:underline select-text inline-block"
        >
          {part}
        </a>
      );
    }
    return <span key={`global-post-text-${index}`} className="select-text whitespace-pre-wrap">{part}</span>;
  });
}
