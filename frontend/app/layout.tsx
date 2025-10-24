import type { Metadata, Viewport } from "next";
import React from "react";

import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";

import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { BalanceProvider } from "@/contexts/BalanceContext";

import "./globals.css";

export const metadata: Metadata = {
  title: "Lino$ Finance",
  description: "Aplicativo de finanças pessoais",
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          <Notifications position="top-right" />
          <ThemeProvider>
            <AuthProvider>
              <BalanceProvider>{children}</BalanceProvider>
            </AuthProvider>
          </ThemeProvider>
        </MantineProvider>
      </body>
    </html>
  );
}