

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import ThemeProvider from "../ui/ThemeProvider";
import PresenceManager from "@/components/PresenceManager";

export const metadata: Metadata = {
  title: "NexaChat",
  description: "Serverless real-time chat application",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>

          <PresenceManager />

          {children}

          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "border border-white/15 bg-indigo-950/95 text-white shadow-2xl backdrop-blur-xl",
                title: "text-white",
                description: "text-white/70",
                actionButton: "bg-indigo-500 text-white",
                cancelButton: "bg-white/10 text-white",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
