"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { apiRequest } from "../utils/api"

export default function BalanceSection() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<string>("0,00")
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchBalance = async () => {
    if (!user) return

    setIsLoading(true)
    setError("")

    try {
      const response = await apiRequest("/balance", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance || "0,00")
      } else {
        const errorData = await response.json()
        setError(errorData.erro || "Erro ao buscar saldo")
      }
    } catch (error) {
      console.error("Erro ao buscar saldo:", error)
      setError("Erro de conexão")
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchBalance()
  }, [user])

  if (!user) return null

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  return (
    <div className="card" style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <h3
            style={{
            color: "var(--primary)",
            fontSize: "20px",
            marginBottom: "4px",
            fontWeight: "600",
          }}
          >
            💰 Saldo Atual
          </h3>

          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Carregando...</span>
            </div>
          ) : error ? (
            <p style={{ color: "var(--error)", fontSize: "14px" }}>{error}</p>
          ) : (
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              {isVisible ? `${balance}` : "R$ ••••••"}
            </div>
          )}
        </div>

        <button
          onClick={toggleVisibility}
          className="btn btn-outline"
          style={{
            padding: "12px",
            minWidth: "48px",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={isVisible ? "Ocultar saldo" : "Mostrar saldo"}
        >
          {isVisible ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>

      {!isLoading && !error && (
        <button
          onClick={fetchBalance}
          className="btn btn-secondary"
          style={{
            marginTop: "16px",
            width: "100%",
            fontSize: "14px",
          }}
        >
          🔄 Atualizar Saldo
        </button>
      )}
    </div>
  )
}