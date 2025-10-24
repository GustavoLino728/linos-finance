"use client"

import { useState, useEffect } from "react"
import { useBalance } from "../contexts/BalanceContext"
import { apiRequest } from "../utils/api"
import TransactionCard from "./TransactionCard"

interface Favorito {
  id: string
  type: "entrada" | "saida"
  description: string
  value: number
  category?: string
  payment_method?: string
}

export default function FavoritesSection() {
  const { refreshBalance } = useBalance()
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")

  const loadFavoritos = async () => {
    try {
      const response = await apiRequest("/favorites", { method: "GET" })

      if (response.ok) {
        const data = await response.json()
        setFavoritos(data.response || [])
      } else {
        setMessage("Erro ao carregar favoritos")
      }
    } catch (error) {
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
        setMessage("Erro ao executar lançamento")
      }
    } catch (error) {
      setMessage("Erro de conexão")
    }
  }

  const deletarFavorito = async (id: string) => {
    try {
      const response = await apiRequest(`/favorites/${id}`, { method: "DELETE" })

      if (response.ok) {
        setFavoritos(favoritos.filter((f) => f.id !== id))
        setMessage("Favorito removido com sucesso!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage("Erro ao remover favorito")
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

      {message && (
        <div className={message.includes("sucesso") ? "success-message" : "error-message"}>
          {message}
        </div>
      )}

      {favoritos.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 0" }}>
          Nenhum favorito salvo ainda
        </p>
      ) : (
        favoritos.map((favorito) => (
          <TransactionCard
            key={favorito.id}
            type={favorito.type}
            description={favorito.description}
            value={favorito.value}
            category={favorito.category}
            paymentMethod={favorito.payment_method}
            showActions={true}
            onExecute={() => executarLancamento(favorito)}
            onDelete={() => deletarFavorito(favorito.id)}
          />
        ))
      )}
    </div>
  )
}