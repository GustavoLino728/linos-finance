"use client"

import { Progress } from "@mantine/core"

interface GoalCardProps {
  id: string
  name: string
  current: number
  target: number
  category?: string
  onEdit?: () => void
  onDelete?: () => void
}

export default function GoalCard({
  name,
  current,
  target,
  category,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const isCompleted = current >= target

  return (
    <div
      className="card"
      style={{
        padding: "20px",
        marginBottom: "16px",
        position: "relative",
      }}
    >
      {/* Nome da meta */}
      <div style={{ marginBottom: "12px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--text-primary)",
          }}
        >
          {name}
        </h3>
        {category && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "4px",
              display: "block",
            }}
          >
            {category}
          </span>
        )}
      </div>

      {/* Valores */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: isCompleted ? "var(--success)" : "var(--text-primary)",
          }}
        >
          R$ {current.toFixed(2).replace(".", ",")}
        </span>
        <span
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
          }}
        >
          / R$ {target.toFixed(2).replace(".", ",")}
        </span>
      </div>

      {/* Barra de progresso */}
      <Progress
        value={percentage}
        size="lg"
        radius="md"
        color={isCompleted ? "green" : "blue"}
        style={{ marginBottom: "12px" }}
      />

      {/* Percentual */}
      <div
        style={{
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "600",
          color: isCompleted ? "var(--success)" : "var(--primary)",
        }}
      >
        {percentage.toFixed(0)}% {isCompleted && "✓ Concluída!"}
      </div>

      {/* Botões de ação */}
      {(onEdit || onDelete) && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "16px",
            justifyContent: "flex-end",
          }}
        >
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn"
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                background: "var(--primary)",
              }}
            >
              ✏️ Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="btn btn-error"
              style={{
                padding: "6px 12px",
                fontSize: "13px",
              }}
            >
              🗑️ Remover
            </button>
          )}
        </div>
      )}
    </div>
  )
}
