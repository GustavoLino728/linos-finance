"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Header from "@/components/Header"
import { TransactionHistory } from "@/components/TransactionHistory"
import { API_BASE_URL } from "@/utils/api" 

type Transaction = {
  data: string
  tipo: string
  descrição: string
  valor: string
  categoria?: string
  "método de pagamento"?: string
}

export default function HistoryPage() {
  const { user, isLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch(`${API_BASE_URL}/transactions/recent`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar transações")
        return res.json()
      })
      .then(data => setTransactions(data.transactions || []))
      .catch(() => setError("Erro ao carregar histórico."))
      .finally(() => setLoading(false))
  }, [user])

  if (isLoading || loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div className="loading"><div className="spinner"></div></div>
      </div>
    )
  }

  return (
    <div className="page-background">
      <Header />
      <main>
        <h2 style={{ textAlign: "center", margin: "2rem 0 1rem 0" }}>
          Histórico de Transações<br />
          <span style={{ fontSize: "1rem", fontWeight: "normal" }}>
            (Últimas 10 realizadas)
          </span>
        </h2>
        {error ? (
          <div style={{ textAlign: "center", color: "red" }}>{error}</div>
        ) : (
          <TransactionHistory transactions={transactions} />
        )}
      </main>
    </div>
  )
}