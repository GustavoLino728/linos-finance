"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Header from "@/components/Header"
import { TransactionHistory } from "@/components/TransactionHistory"
import { API_BASE_URL } from "@/utils/api"

type Transaction = {
  data: string
  tipo: string
  descricao: string
  valor: string
  categoria?: string
  metodoPagamento?: string
}

export default function HistoryPage() {
  const { user, token, isLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || !token) return

    setLoading(true)
    fetch(`${API_BASE_URL}/transactions/recent`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar transações")
        return res.json()
      })
      .then((data) => {
      const normalized: Transaction[] = (data.transactions || []).map((t: any) => {
        const rawDate = t.data || t.Data
        
        let formattedDate = rawDate
        if (rawDate && rawDate.includes('-')) {
          const [year, month, day] = rawDate.split('-')
          formattedDate = `${day}/${month}/${year}`
        }

        return {
          data: formattedDate,
          tipo: t.tipo || t.Tipo,
          descricao: t.descricao || t.Descrição || t.descrição,
          valor: t.valor || t.Valor || "0.00",
          categoria: t.categoria || t.Categoria,
          metodoPagamento: t.metodoPagamento || t["Método de Pagamento"],
        }
      })

      setTransactions(normalized.reverse()) 
    })

      .catch((err) => {
        console.error("❌ Erro:", err)
        setError("Erro ao carregar histórico.")
      })
      .finally(() => setLoading(false))
  }, [user, token])

  if (isLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading"><div className="spinner"></div></div>
      </div>
    )
  }

  return (
    <div className="page-background">
      <Header />
      <main>
        {error ? (
          <div style={{ textAlign: "center", color: "red" }}>{error}</div>
        ) : (
          <TransactionHistory transactions={transactions} />
        )}
      </main>
    </div>
  )
}