"use client"

interface TransactionCardProps {
  type: "entrada" | "saida"
  description: string
  value: number | string  // Aceita tanto número quanto string
  date?: string
  category?: string
  paymentMethod?: string
  onExecute?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export default function TransactionCard({
  type,
  description,
  value,
  date,
  category,
  paymentMethod,
  onExecute,
  onDelete,
  showActions = false,
}: TransactionCardProps) {
  // Normaliza o valor para número
  const normalizedValue = typeof value === "string" 
    ? parseFloat(value.replace("R$", "").replace(/\s/g, "").replace(",", ".")) || 0
    : value

  return (
    <div
      className={`favorite-item ${type === "entrada" ? "favorite-entrada" : "favorite-saida"}`}
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
          <span style={{ fontSize: "18px" }}>
            {type === "entrada" ? "💰" : "💸"}
          </span>
          <strong style={{ color: "var(--text-primary)" }}>
            {description}
          </strong>
        </div>
        
        <div
          style={{
            color: type === "entrada" ? "var(--success)" : "var(--error)",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          R$ {normalizedValue.toFixed(2).replace(".", ",")}
        </div>

        {date && (
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginTop: "4px",
            }}
          >
            📅 {date}
          </div>
        )}

        {(category || paymentMethod) && (
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginTop: "2px",
            }}
          >
            {category && <span>{category}</span>}
            {category && paymentMethod && <span> • </span>}
            {paymentMethod && <span>{paymentMethod}</span>}
          </div>
        )}
      </div>

      {showActions && (
        <div style={{ display: "flex", gap: "8px" }}>
          {onExecute && (
            <button
              className="btn btn-success"
              onClick={onExecute}
              style={{ padding: "8px 12px", fontSize: "14px" }}
            >
              ✅ Executar
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-error"
              onClick={onDelete}
              style={{ padding: "8px 12px", fontSize: "14px" }}
            >
              🗑️ Remover
            </button>
          )}
        </div>
      )}
    </div>
  )
}