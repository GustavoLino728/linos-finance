import type { Metadata, Viewport } from "next";
import React from "react";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";

import ThemedMantineProvider from "./providers/ThemedMantineProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";

import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lino$ Finance",
  description: "Aplicativo de finanças pessoais",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lino$",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E7D32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <ColorSchemeScript />
        <meta name="apple-mobile-web-app-title" content="Lino$" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {/* ThemeProvider (client) define data-theme; Mantine fica dentro dele */}
        <ThemeProvider>
          <ThemedMantineProvider>{children}</ThemedMantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}