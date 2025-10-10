import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "../contexts/ThemeContext"
import { AuthProvider } from "../contexts/AuthContext"
import { BalanceProvider } from "@/contexts/BalanceContext"
import { HeroUIProvider } from "@heroui/react"
import { Providers } from "@/app/providers"
import "./globals.css"

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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <Providers>
        <HeroUIProvider>
          <ThemeProvider>
            <AuthProvider>
              <BalanceProvider>
                
                  {children}
                
              </BalanceProvider>
            </AuthProvider>
          </ThemeProvider>
        </HeroUIProvider>
        </Providers>
      </body>
    </html>
  )
}
