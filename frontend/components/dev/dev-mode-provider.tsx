"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface DevUser {
  id: string
  email: string
  sheet_url: string
}

interface DevContextType {
  devMode: boolean
  setDevMode: (mode: boolean) => void
  devUser: DevUser
}

const DevContext = createContext<DevContextType | undefined>(undefined)

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [devMode, setDevMode] = useState(false)

  const devUser: DevUser = {
    id: "dev-user-123",
    email: "dev@linos.com",
    sheet_url: "https://docs.google.com/spreadsheets/dev-sheet",
  }

  return <DevContext.Provider value={{ devMode, setDevMode, devUser }}>{children}</DevContext.Provider>
}

export const useDevMode = () => {
  const context = useContext(DevContext)
  if (!context) {
    throw new Error("useDevMode deve ser usado dentro de DevModeProvider")
  }
  return context
}
