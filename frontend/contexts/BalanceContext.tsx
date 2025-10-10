"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface BalanceContextType {
  refreshBalance: () => void
  balanceVersion: number
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balanceVersion, setBalanceVersion] = useState(0)

  const refreshBalance = useCallback(() => {
    setBalanceVersion((prev) => prev + 1)
  }, [])

  return (
    <BalanceContext.Provider value={{ refreshBalance, balanceVersion }}>
      {children}
    </BalanceContext.Provider>
  )
}

export function useBalance() {
  const context = useContext(BalanceContext)
  if (!context) {
    throw new Error("useBalance must be used within BalanceProvider")
  }
  return context
}