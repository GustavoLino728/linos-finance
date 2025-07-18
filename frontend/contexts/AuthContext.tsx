"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  sheet_url: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string) => Promise<void>
  signUp: (email: string, name: string, sheetUrl: string) => Promise<void>
  signOut: () => Promise<void>
  getAuthToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulação de token para MVP
  const getAuthToken = async () => {
    const email = localStorage.getItem("linos_user_email")
    return email ? `mock_token_${email}` : null
  }

  const signIn = async (email: string) => {
    setLoading(true)
    try {
      // Simulação de login - apenas salva o email
      localStorage.setItem("linos_user_email", email)

      // Simula busca do usuário
      const mockUser: User = {
        id: `user_${email.replace("@", "_").replace(".", "_")}`,
        email: email,
        sheet_url: "https://docs.google.com/spreadsheets/mock",
      }

      setUser(mockUser)
    } catch (error) {
      throw new Error("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, name: string, sheetUrl: string) => {
    setLoading(true)
    try {
      // Simulação de cadastro
      localStorage.setItem("linos_user_email", email)
      localStorage.setItem("linos_user_name", name)
      localStorage.setItem("linos_user_sheet", sheetUrl)

      const mockUser: User = {
        id: `user_${email.replace("@", "_").replace(".", "_")}`,
        email: email,
        sheet_url: sheetUrl,
      }

      setUser(mockUser)
    } catch (error) {
      throw new Error("Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    localStorage.removeItem("linos_user_email")
    localStorage.removeItem("linos_user_name")
    localStorage.removeItem("linos_user_sheet")
    setUser(null)
  }

  useEffect(() => {
    const email = localStorage.getItem("linos_user_email")
    if (email) {
      const mockUser: User = {
        id: `user_${email.replace("@", "_").replace(".", "_")}`,
        email: email,
        sheet_url: localStorage.getItem("linos_user_sheet") || "https://docs.google.com/spreadsheets/mock",
      }
      setUser(mockUser)
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return context
}
