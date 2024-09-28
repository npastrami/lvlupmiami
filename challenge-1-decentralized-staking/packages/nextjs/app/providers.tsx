// app/providers.tsx
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "~~/components/ThemeProvider";

// app/providers.tsx

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider enableSystem>{children}</ThemeProvider>
    </SessionProvider>
  );
}
