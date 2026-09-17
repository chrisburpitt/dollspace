// src/lib/utils/textParser.tsx
import Link from "next/link";

/**
 * Scans raw text blocks and transforms all '@username' strings into clickable Next.js profile anchors.
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
        <Link 
          key={`global-post-tag-${index}-${parsedHandleName}`} 
          href={`/${parsedHandleName}`}
          className="text-rose-500 font-bold hover:underline select-text inline-block"
        >
          {part}
        </Link>
      );
    }
    return <span key={`global-post-text-${index}`} className="select-text whitespace-pre-wrap">{part}</span>;
  });
}
