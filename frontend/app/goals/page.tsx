"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Header from "@/components/Header"
import GoalCard from "@/components/GoalCard"
import { apiRequest } from "@/utils/api"
import { notifications } from "@mantine/notifications"
import { Modal, TextInput, NumberInput, Select, Button, Stack } from "@mantine/core"

interface Goal {
  uuid: string
  name: string
  current: number
  target: number
}

export default function GoalsPage() {
  const { user, token, isLoading } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpened, setModalOpened] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Estado do formulário
  const [name, setName] = useState("")
  const [current, setCurrent] = useState<number>(0)
  const [target, setTarget] = useState<number>(0)

  // Carrega as metas
  const loadGoals = async () => {
    if (!token) return

    try {
      const response = await apiRequest("/goals", { method: "GET" })

      if (response.ok) {
        const data = await response.json()
        console.log("Metas carregadas:", data)
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error("Erro ao carregar metas:", error)
    }
    setLoading(false)
  }

  // Adiciona ou edita meta
  const saveGoal = async () => {
    try {
      const method = editingGoal ? "PUT" : "POST"
      const endpoint = editingGoal ? `/goals/${editingGoal.uuid}` : "/goals"

      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify({ name, current, target }),
      })

      if (response.ok) {
        notifications.show({
          title: "Sucesso!",
          message: editingGoal ? "Meta atualizada" : "Meta criada",
          color: "green",
        })
        loadGoals()
        closeModal()
      } else {
        throw new Error("Erro ao salvar meta")
      }
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Não foi possível salvar a meta",
        color: "red",
      })
    }
  }

  // Deleta meta
  const deleteGoal = async (uuid: string) => {
    if (!confirm("Deseja realmente remover esta meta?")) return

    try {
      const response = await apiRequest(`/goals/${uuid}`, { method: "DELETE" })

      if (response.ok) {
        notifications.show({
          title: "Sucesso!",
          message: "Meta removida",
          color: "green",
        })
        loadGoals()
      }
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Não foi possível remover a meta",
        color: "red",
      })
    }
  }

  // Abre modal para edição
  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setName(goal.name)
    setCurrent(goal.current)
    setTarget(goal.target)
    setModalOpened(true)
  }

  const openNewModal = () => {
    setEditingGoal(null)
    setName("")
    setCurrent(0)
    setTarget(0)
    setModalOpened(true)
  }

  const closeModal = () => {
    setModalOpened(false)
    setEditingGoal(null)
  }

  useEffect(() => {
    if (user && token) {
      loadGoals()
    }
  }, [user, token])

  if (isLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-background">
      <Header />
      <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Título e botão */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>🎯 Metas</h1>
          <button
            onClick={openNewModal}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              background: "#2E7D32",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ➕ Nova Meta
          </button>
        </div>

        {/* Grid de metas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {goals.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "white",
                padding: "60px 40px",
                textAlign: "center",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
                Você ainda não tem metas cadastradas.
                <br />
                Clique em "Nova Meta" para começar!
              </p>
            </div>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.uuid}
                uuid={goal.uuid}
                name={goal.name}
                current={goal.current}
                target={goal.target}
                onEdit={() => openEditModal(goal)}
                onDelete={() => deleteGoal(goal.uuid)}
              />
            ))
          )}
        </div>

        {/* Modal de criação/edição */}
        <Modal
          opened={modalOpened}
          onClose={closeModal}
          title={editingGoal ? "✏️ Editar Meta" : "➕ Nova Meta"}
          centered
          size="md"
        >
          <Stack gap="md">
            <TextInput
              label="Nome da Meta"
              placeholder="Ex: Carro Novo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <NumberInput
              label="Valor Atual (R$)"
              placeholder="0.00"
              value={current}
              onChange={(value) => setCurrent(Number(value) || 0)}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              thousandSeparator="."
              decimalSeparator=","
            />

            <NumberInput
              label="Valor Meta (R$)"
              placeholder="10000.00"
              value={target}
              onChange={(value) => setTarget(Number(value) || 0)}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              required
              prefix="R$ "
              thousandSeparator="."
              decimalSeparator=","
            />

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <Button variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button color="green" onClick={saveGoal}>
                {editingGoal ? "Salvar" : "Criar Meta"}
              </Button>
            </div>
          </Stack>
        </Modal>
      </main>
    </div>
  )
}