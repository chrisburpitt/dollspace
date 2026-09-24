"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    // 🚀 THE THEME FORCE MULTIPLIER:
    // Explicitly mapping attribute="class" and defaultTheme="light" forces next-themes 
    // to write "class='dark'" onto the HTML element, unblocking Tailwind instantly!
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
