"use client"

import { useState, useEffect } from "react"
import { OfflineCacheService } from "../services/offlineCache"
import { NotificationService } from "../services/notifications"

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState({ total: 0, synced: 0, pending: 0 })
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Monitorar status online/offline
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (online && syncStatus.pending > 0) {
        // Auto-sincronizar quando voltar online
        handleSync()
      }
    }

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)
      window.addEventListener("online", updateOnlineStatus)
      window.addEventListener("offline", updateOnlineStatus)

      return () => {
        window.removeEventListener("online", updateOnlineStatus)
        window.removeEventListener("offline", updateOnlineStatus)
      }
    }
  }, [syncStatus.pending])

  // Atualizar status de sincronização
  const updateSyncStatus = async () => {
    const status = await OfflineCacheService.getSyncStatus()
    setSyncStatus(status)
  }

  // Sincronizar manualmente
  const handleSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      const result = await OfflineCacheService.syncOfflineTransactions()
      await updateSyncStatus()

      if (result.success > 0) {
        await NotificationService.showNotification("✅ Sincronização Concluída", {
          body: `${result.success} transações sincronizadas`,
        })
      }
    } catch (error) {
      console.error("Erro na sincronização:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Carregar status inicial
  useEffect(() => {
    updateSyncStatus()
  }, [])

  return {
    syncStatus,
    isOnline,
    isSyncing,
    handleSync,
    updateSyncStatus,
  }
}
