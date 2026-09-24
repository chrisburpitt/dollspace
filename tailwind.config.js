// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🚀 THE ULTIMATE VISUAL TRIGGER:
  // Instantly commands your headers, sidebars, and home feeds to follow your settings toggle click!
  darkMode: "class",

  // Keeps your high-speed source scan paths fully locked down
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
