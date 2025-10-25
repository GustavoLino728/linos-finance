"use client"

import { Progress } from "@mantine/core"

interface GoalCardProps {
  uuid: string
  name: string
  current_value: number
  goal_value: number
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function GoalCard({
  name,
  current_value,
  goal_value,
  onClick,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const percentage = Math.min((current_value / goal_value) * 100, 100)
  const isCompleted = current_value >= goal_value

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e0e0e0",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s",
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = "translateY(-4px)"
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      {/* Nome da meta */}
      <div style={{ marginBottom: "12px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          {name}
        </h3>
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
            color: isCompleted ? "#2E7D32" : "#333",
          }}
        >
          {current_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
        <span style={{ fontSize: "14px", color: "#666" }}>
          / {goal_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </div>

      {/* Barra de progresso do Mantine */}
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
          color: isCompleted ? "#2E7D32" : "#1976d2",
        }}
      >
        {percentage.toFixed(0)}% {isCompleted && "✓ Concluída!"}
      </div>

      {/* Botões de ação */}
      {(onEdit || onDelete) && (
        <div
          style={{ display: "flex", gap: "8px", marginTop: "16px" }}
          onClick={(e) => e.stopPropagation()} // Evita abrir modal de aporte ao clicar nos botões
        >
          {onEdit && (
            <button
              onClick={onEdit}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                background: "#1976d2",
                color: "white",
                cursor: "pointer",
              }}
            >
              ✏️ Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                background: "#d32f2f",
                color: "white",
                cursor: "pointer",
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