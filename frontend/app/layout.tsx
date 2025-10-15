import type { Metadata } from "next";
import React from "react";

import "@mantine/core/styles.css";
import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/dates/styles.css";

import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { BalanceProvider } from "@/contexts/BalanceContext";
import { Providers } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Lino$ Finance",
  description: "Aplicativo de finanças pessoais",
  manifest: "/manifest.json",
  themeColor: "#2E7D32",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lino$",
  },
  generator: "v0.dev",
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
          <Providers>
            <ThemeProvider>
              <AuthProvider>
                <BalanceProvider>{children}</BalanceProvider>
              </AuthProvider>
            </ThemeProvider>
          </Providers>
        </MantineProvider>
      </body>
    </html>
  );
}