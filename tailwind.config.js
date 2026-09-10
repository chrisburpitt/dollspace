// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🚀 FIXED: Hard-restricts scanning paths to ONLY your true source directories
  // This explicitly overrides and kills Tailwind's broken automatic background scanner!
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
