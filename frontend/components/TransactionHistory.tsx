"use client"

import TransactionCard from "./TransactionCard"

type Transaction = {
  data: string
  tipo: string
  descricao: string 
  valor: string
  categoria?: string
  metodoPagamento?: string 
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 0" }}>
          Nenhuma transação encontrada
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="title-with-gradient">
        <h2 style={{ fontSize: "24px", margin: 0 }}>Histórico de Transações</h2>
      </div>

      {transactions.map((transaction, index) => {
        console.log(`Transaction ${index}:`, transaction)
        
        return (
          <TransactionCard
            key={`${transaction.data}-${index}`}
            type={transaction.tipo === "entrada" ? "entrada" : "saida"}
            description={transaction.descricao}
            value={transaction.valor}
            date={transaction.data}
            category={transaction.categoria}
            paymentMethod={transaction.metodoPagamento}
            showActions={false}
          />
        )
      })}
    </div>
  )
}