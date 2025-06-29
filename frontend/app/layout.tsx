import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { OfflineProvider } from "@/contexts/OfflineContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Organização Financeira",
  description: "Aplicativo de controle financeiro pessoal",
  manifest: "/manifest.json",
  themeColor: "#2C7BE5",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <OfflineProvider>{children}</OfflineProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
