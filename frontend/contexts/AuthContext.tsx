"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { apiRequest } from "../utils/api"

interface User {
  id: string
  email: string
  sheet_url: string
  name?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string): Promise<boolean> => {
    console.log("Tentando login com:", email)

    // Login mockado para testes locais
    if (email === "teste@gmail.com") {
      console.log("Login mockado detectado!")
      const mockUser = {
        id: "mock-user-123",
        email: "teste@gmail.com",
        name: "Usuário Teste",
        sheet_url: "https://docs.google.com/spreadsheets/mock",
      }
      setUser(mockUser)
      localStorage.setItem("user_data", JSON.stringify(mockUser))
      localStorage.setItem("auth_token", "mock_token_123")
      return true
    }

    try {
      const response = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const userData = await response.json()
        console.log("data do usuário recebidos:", userData)

        setUser(userData)
        localStorage.setItem("user_data", JSON.stringify(userData))
        // Não precisamos mais de token JWT, apenas marcar como logado
        localStorage.setItem("auth_token", "logged_in")

        return true
      }
      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
