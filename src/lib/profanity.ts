// src/lib/profanity.ts (THE PLATFORM-WIDE CENSOR SUITE)

// 🤬 Define your forbidden words matrix array
const FORBIDDEN_WORDS = [
  "fuck", 
  "shit", 
  "shite",
  "bitch", 
  "bastard",
  "arse",
  "cunt",
  "twat",
  "cock",
  "dick",
  "prick",
  "bellend",
  "scrote",
  "bollock",
  "piss",
  "wanker",
  "tosser",
  "bender",
  "jizz",
  "fag",
  "faggot",
  "nonce",
  "poof",
  "poofta",
  "cuck",
  "bloody",
  "asshole",
  "gypo",
  "pikey",
  "tranny",
  "troon",
  "nigga",
  "nigger",
  "darky"
  // Add any other terms you want to target here!
];

/**
 * Sweeps a text string and replaces targeted profanity with a playful token.
 * @param text The raw message content or comment string to inspect.
 * @param isFilterEnabled The boolean preference state loaded from the user's Neon row.
 */
export function filterProfanity(text: string, isFilterEnabled: boolean): string {
  if (!text || !isFilterEnabled) return text;

  let cleanText = text;

  // Loop through and construct a regex word-boundary lookup swap
  FORBIDDEN_WORDS.forEach((word) => {
    // 'gi' forces global match and ignores uppercase vs lowercase differences
    const regex = new RegExp(`${word}`, "gi");
    cleanText = cleanText.replace(regex, "*beep*");
  });

  return cleanText;
}
