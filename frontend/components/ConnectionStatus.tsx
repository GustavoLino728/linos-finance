"use client"

import { useOffline } from "@/contexts/OfflineContext"
import { Wifi, WifiOff, Server, ServerOff, FolderSyncIcon as Sync, Clock } from "lucide-react"

export default function ConnectionStatus() {
  const { isOnline, isBackendConnected, pendingTransactions, syncTransactions } = useOffline()

  return (
    <div className="flex items-center space-x-4">
      {/* Status da Internet */}
      <div
        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          isOnline ? "bg-success/10 text-success" : "bg-error/10 text-error"
        }`}
      >
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </div>

      {/* Status do Backend */}
      <div
        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          isBackendConnected ? "bg-success/10 text-success" : "bg-error/10 text-error"
        }`}
      >
        {isBackendConnected ? <Server className="w-3 h-3" /> : <ServerOff className="w-3 h-3" />}
        <span>{isBackendConnected ? "Conectado" : "Desconectado"}</span>
      </div>

      {/* Transações Pendentes */}
      {pendingTransactions > 0 && (
        <button
          onClick={syncTransactions}
          className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
        >
          <Clock className="w-3 h-3" />
          <span>
            {pendingTransactions} pendente{pendingTransactions > 1 ? "s" : ""}
          </span>
          <Sync className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
