"use client"

import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun, LogOut, Wifi, WifiOff, Database } from "lucide-react"
import { useState, useEffect } from "react"

export function Header() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isOnline, setIsOnline] = useState(true)
  const [isConnectedToBackend, setIsConnectedToBackend] = useState(false)

  // Monitora status de conexão de rede
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Define o estado inicial
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Testa conexão com o backend
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
          method: "GET",
          signal: AbortSignal.timeout(5000), // Timeout de 5 segundos
        })
        setIsConnectedToBackend(response.ok)
      } catch (error) {
        console.error("Erro ao testar conexão com o backend:", error)
        setIsConnectedToBackend(false)
      }
    }

    testBackendConnection()
    const interval = setInterval(testBackendConnection, 15000) // Testa a cada 15s

    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Erro ao sair:", error)
    }
  }

  return (
    <header className="border-b border-border dark:border-dark-border bg-background dark:bg-dark-background shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e informações do usuário */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-primary dark:text-dark-primary">Organização Financeira</h1>
            {user && (
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                Olá, {user.name || user.email}
              </p>
            )}
          </div>

          {/* Status e controles */}
          <div className="flex items-center gap-3">
            {/* Status de conexão */}
            <div className="flex items-center gap-2">
              <Badge
                variant={isOnline ? "default" : "destructive"}
                className={`text-xs ${
                  isOnline ? "bg-success dark:bg-dark-success text-white" : "bg-error dark:bg-dark-error text-white"
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>

              <Badge
                variant={isConnectedToBackend ? "default" : "destructive"}
                className={`text-xs ${
                  isConnectedToBackend
                    ? "bg-primary dark:bg-dark-primary text-white"
                    : "bg-error dark:bg-dark-error text-white"
                }`}
              >
                {isConnectedToBackend ? (
                  <>
                    <Database className="w-3 h-3 mr-1" />
                    Conectado
                  </>
                ) : (
                  <>
                    <Database className="w-3 h-3 mr-1" />
                    Desconectado
                  </>
                )}
              </Badge>
            </div>

            {/* Controles */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
              aria-label={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-9 w-9 p-0 text-error dark:text-dark-error hover:bg-error/10"
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Informações da planilha */}
        {user?.sheet_url && (
          <div className="mt-2 pt-2 border-t border-border/50 dark:border-dark-border/50">
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
              📊 Planilha conectada:{" "}
              <span className="font-medium text-primary dark:text-dark-primary">
                {user.sheet_url.includes("docs.google.com") ? "Google Sheets" : "Planilha personalizada"}
              </span>
            </p>
          </div>
        )}
      </div>
    </header>
  )
}
