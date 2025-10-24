"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { checkBackendConnection } from "../utils/api"

export default function WelcomeSection() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const checkConnection = async () => {
    setIsChecking(true)
    const online = await checkBackendConnection()
    setIsOnline(online)
    setIsChecking(false)
  }

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!user) return null

  return (
    <div className="welcome-section">
      <div>
        <h2
          style={{
            color: "var(--primary)",
            fontSize: "20px",
            marginBottom: "4px",
            fontWeight: "600",
          }}
        >
          👋 Olá, {user.username || "Usuário"}! 
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          Pronto para organizar suas finanças?
        </p>
      </div>

      <div className="connection-status">
        {isChecking ? (
          <>
            <div
              style={{
                width: "8px",
                height: "8px",
                background: "var(--secondary)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <span style={{ color: "var(--text-secondary)" }}>Verificando...</span>
          </>
        ) : (
          <>
            <div className={`connection-dot ${isOnline ? "connection-online" : "connection-offline"}`}></div>
            <span
              style={{
                color: isOnline ? "var(--success)" : "var(--error)",
                fontWeight: "600",
              }}
            >
              {isOnline ? "Conectado" : "Desconectado"}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
