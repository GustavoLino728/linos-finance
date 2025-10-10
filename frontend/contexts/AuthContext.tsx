"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { apiRequest } from "../utils/api"

interface User {
  id: string
  email: string
  username?: string
  sheet_url?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    const savedToken = localStorage.getItem("auth_token")
    if (userData && savedToken) {
      setUser(JSON.parse(userData))
      setToken(savedToken)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      if (response.ok) {
        const data = await response.json()
        setUser({
          ...data.user,
          sheet_url: data.user.sheet_url
        })
        setToken(data.access_token)
        localStorage.setItem("user_data", JSON.stringify(data.user))
        localStorage.setItem("auth_token", data.access_token)
        setIsLoading(false)
        return true
      }
      setIsLoading(false)
      return false
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}