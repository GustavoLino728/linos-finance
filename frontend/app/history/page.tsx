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
  const { user, token, isLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || !token) {
      console.log("❌ DEBUG: Usuário ou token não disponível")
      console.log("User:", user)
      console.log("Token:", token)
      return
    }

    console.log("✅ DEBUG: Iniciando requisição para o backend")
    console.log("URL:", `${API_BASE_URL}/transactions/recent`)
    console.log("Token:", token)

    setLoading(true)
    fetch(`${API_BASE_URL}/transactions/recent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("📡 DEBUG: Resposta recebida do servidor")
        console.log("Status:", res.status)
        console.log("OK?:", res.ok)
        
        if (!res.ok) throw new Error("Erro ao buscar transações")
        return res.json()
      })
      .then((data) => {
        console.log("📦 DEBUG: Dados recebidos do backend:", data)
        console.log("Transações:", data.transactions)
        console.log("Quantidade de transações:", data.transactions?.length)
        
        // Log individual de cada transação
        if (data.transactions && data.transactions.length > 0) {
          console.log("🔍 DEBUG: Primeira transação:", data.transactions[0])
          console.log("Tipo de valor da primeira transação:", typeof data.transactions[0]?.valor)
          console.log("Valor raw:", data.transactions[0]?.valor)
        }
        
        setTransactions(data.transactions || [])
      })
      .catch((err) => {
        console.error("❌ DEBUG: Erro ao buscar transações:", err)
        setError("Erro ao carregar histórico.")
      })
      .finally(() => {
        console.log("✅ DEBUG: Requisição finalizada")
        setLoading(false)
      })
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