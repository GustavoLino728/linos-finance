"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { dbManager, type Transaction } from "@/utils/indexedDB"

interface OfflineContextType {
  isOnline: boolean
  isBackendConnected: boolean
  pendingTransactions: number
  addOfflineTransaction: (transaction: Omit<Transaction, "id" | "synced" | "timestamp">) => Promise<void>
  syncTransactions: () => Promise<void>
  checkBackendConnection: () => Promise<boolean>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isBackendConnected, setIsBackendConnected] = useState(true)
  const [pendingTransactions, setPendingTransactions] = useState(0)

  useEffect(() => {
    // Initialize IndexedDB
    dbManager.init().catch(console.error)

    // Check online status
    const handleOnline = () => {
      setIsOnline(true)
      checkBackendConnection()
      syncTransactions()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsBackendConnected(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial checks
    setIsOnline(navigator.onLine)
    checkBackendConnection()
    updatePendingCount()

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(console.error)
    }

    // Listen for sync messages from service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SYNC_TRANSACTIONS") {
          syncTransactions()
        }
      })
    }

    // Periodic backend check
    const interval = setInterval(checkBackendConnection, 30000) // Check every 30s

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
    
      const response = await fetch("https://organizacao-financeira-app.onrender.com/", {
        method: "GET",
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const connected = response.ok
      setIsBackendConnected(connected)
      return connected
    } catch (error) {
      setIsBackendConnected(false)
      return false
    }
  }

  const updatePendingCount = async () => {
    try {
      const unsynced = await dbManager.getUnsyncedTransactions()
      setPendingTransactions(unsynced.length)
    } catch (error) {
      console.error("Error updating pending count:", error)
    }
  }

  const addOfflineTransaction = async (transaction: Omit<Transaction, "id" | "synced" | "timestamp">) => {
    try {
      await dbManager.addTransaction({
        ...transaction,
        synced: false,
        timestamp: Date.now(),
      })

      setPendingTransactions((prev) => prev + 1)

      // Try to sync immediately if online
      if (isOnline && isBackendConnected) {
        setTimeout(syncTransactions, 1000)
      }
    } catch (error) {
      console.error("Error adding offline transaction:", error)
      throw error
    }
  }

  const syncTransactions = async () => {
    if (!isOnline || !isBackendConnected) return

    try {
      const unsyncedTransactions = await dbManager.getUnsyncedTransactions()

      for (const transaction of unsyncedTransactions) {
        try {
          const payload = {
            email: transaction.email,
            tipo: transaction.tipo,
            desc: transaction.desc,
            valor: transaction.valor,
            data: transaction.data,
            ...(transaction.tipo === "saida" && {
              categoria: transaction.categoria || "",
              metodoPag: transaction.metodoPag || "",
              parcelado: transaction.parcelado || false,
              parcelas: transaction.parcelas || 1,
            }),
          }

          const response = await fetch("https://organizacao-financeira-app.onrender.com/add-lancamento", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })

          if (response.ok && transaction.id) {
            await dbManager.markTransactionSynced(transaction.id)
            setPendingTransactions((prev) => Math.max(0, prev - 1))
          }
        } catch (error) {
          console.error("Error syncing transaction:", error)
          // Continue with next transaction
        }
      }
    } catch (error) {
      console.error("Error during sync:", error)
    }
  }

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isBackendConnected,
        pendingTransactions,
        addOfflineTransaction,
        syncTransactions,
        checkBackendConnection,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const context = useContext(OfflineContext)
  if (context === undefined) {
    throw new Error("useOffline must be used within an OfflineProvider")
  }
  return context
}
