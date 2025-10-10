"use client"

import { useState, useEffect } from "react"
import { useBalance } from "../contexts/BalanceContext"
import { apiRequest } from "../utils/api"

interface Favorito {
  id: string
  type: "entrada" | "saida"
  description: string
  value: number
  category?: string
  payment_method?: string
}

export default function FavoritesSectionction() {
  const { refreshBalance } = useBalance()
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")

  const loadFavoritos = async () => {
    try {
      console.log("Carregando favoritos...")

      const response = await apiRequest("/favorites", {
        method: "GET",
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Favoritos carregados:", data)
        setFavoritos(data.response || [])
      } else {
        const errorData = await response.json()
        console.error("Erro ao carregar favoritos:", errorData)
        setMessage("Erro ao carregar favoritos")
      }
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error)
      setMessage("Erro de conexão ao carregar favoritos")
    }
    setIsLoading(false)
  }

  const executarLancamento = async (favorito: Favorito) => {
    try {
      const response = await apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify({
          data: new Date().toISOString().split("T")[0],
          transaction_type: favorito.type,
          description: favorito.description,
          value: favorito.value,
          category: favorito.category || "",
          payment_method: favorito.payment_method || "",
          parcelado: false,
          parcelas: 1,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(data.mensagem || "Lançamento executado com sucesso!")
        refreshBalance()
        setTimeout(() => setMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setMessage(errorData.erro || "Erro ao executar lançamento")
      }
    } catch (error) {
      setMessage("Erro de conexão")
    }
  }

  const deletarFavorito = async (id: string) => {
    try {
      const response = await apiRequest(`/favorites/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFavoritos(favoritos.filter((f) => f.id !== id))
        const data = await response.json()
        setMessage(data.mensagem || "Favorito removido com sucesso!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setMessage(errorData.erro || "Erro ao remover favorito")
      }
    } catch (error) {
      setMessage("Erro de conexão")
    }
  }

  useEffect(() => {
    loadFavoritos()
  }, [])

  if (isLoading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="title-with-gradient">
        <h2 style={{ fontSize: "24px", margin: 0 }}>⭐ Meus Favoritos</h2>
      </div>

      {message && <div className={message.includes("sucesso") ? "success-message" : "error-message"}>{message}</div>}

      {favoritos.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            padding: "40px 0",
          }}
        >
          Nenhum favorito salvo ainda
        </p>
      ) : (
        favoritos.map((favorito) => (
          <div
            key={favorito.id}
            className={`favorite-item ${favorito.type === "entrada" ? "favorite-entrada" : "favorite-saida"}`}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "18px" }}>{favorito.type === "entrada" ? "💰" : "💸"}</span>
                <strong style={{ color: "var(--text-primary)" }}>{favorito.description}</strong>
              </div>
              <div
                style={{
                  color: favorito.type === "entrada" ? "var(--success)" : "var(--error)",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                R$ {favorito.value.toFixed(2)}
              </div>
              {favorito.category && (
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                  }}
                >
                  {favorito.category} • {favorito.payment_method}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-success"
                onClick={() => executarLancamento(favorito)}
                style={{ padding: "8px 12px", fontSize: "14px" }}
              >
                ✅ Executar
              </button>
              <button
                className="btn btn-error"
                onClick={() => deletarFavorito(favorito.id)}
                style={{ padding: "8px 12px", fontSize: "14px" }}
              >
                🗑️ Remover
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
