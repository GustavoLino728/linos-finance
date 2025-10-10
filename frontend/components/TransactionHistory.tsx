import React from "react"

type Transaction = {
  data: string
  tipo: string
  descrição: string
  valor: string
  categoria?: string
  "método de pagamento"?: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginTop: "2rem"
    }}>
      <h2 style={{ textAlign: "center", fontWeight: "bold" }}>
        Histórico de Transações<br />
        <span style={{ fontWeight: "normal", fontSize: "1rem" }}>
          (Últimas 10 realizadas)
        </span>
      </h2>
      {transactions.map((t, idx) => {
        const isEntrada = t.tipo?.toLowerCase() === "entrada"
        return (
          <div
            key={idx}
            style={{
              background: isEntrada ? "#d2f8d2" : "#ffd6d6",
              borderRadius: "16px",
              padding: "18px 16px",
              boxShadow: "0 2px 8px #0001",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px"
            }}>
            <div style={{ minWidth: "85px", fontWeight: 700 }}>{t.data}</div>
            <div style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>{t.descrição}</div>
            <div style={{
              fontWeight: 700,
              color: isEntrada ? "green" : "red"
            }}>
              {parseFloat(t.valor).toLocaleString("pt-BR", {style: "currency", currency: "BRL"})}
            </div>
          </div>
        )
      })}
    </div>
  )
}