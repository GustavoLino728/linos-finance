"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Header from "@/components/Header"
import GoalCard from "@/components/GoalCard"
import { apiRequest } from "@/utils/api"
import { notifications } from "@mantine/notifications"
import { Modal, TextInput, NumberInput, Select, Button } from "@mantine/core"

interface Goal {
  id: string
  name: string
  current: number
  target: number
  category?: string
}

export default function GoalsPage() {
  const { user, token, isLoading } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpened, setModalOpened] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: "",
    current: 0,
    target: 0,
    category: "Carro",
  })

  // Carrega as metas
  const loadGoals = async () => {
    if (!token) return

    try {
      const response = await apiRequest("/goals", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
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
      const endpoint = editingGoal ? `/goals/${editingGoal.id}` : "/goals"

      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(formData),
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
  const deleteGoal = async (id: string) => {
    if (!confirm("Deseja realmente remover esta meta?")) return

    try {
      const response = await apiRequest(`/goals/${id}`, {
        method: "DELETE",
      })

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
    setFormData({
      name: goal.name,
      current: goal.current,
      target: goal.target,
      category: goal.category || "Carro",
    })
    setModalOpened(true)
  }

  // Abre modal para nova meta
  const openNewModal = () => {
    setEditingGoal(null)
    setFormData({
      name: "",
      current: 0,
      target: 0,
      category: "Carro",
    })
    setModalOpened(true)
  }

  // Fecha modal
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
      <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        {/* Título e botão */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>🎯 Metas</h1>
          <button onClick={openNewModal} className="btn btn-success" style={{ padding: "12px 24px" }}>
            ➕ Nova Meta
          </button>
        </div>

        {/* Grid de metas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {goals.length === 0 ? (
            <div className="card" style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
                Você ainda não tem metas cadastradas.
                <br />
                Clique em "Nova Meta" para começar!
              </p>
            </div>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                name={goal.name}
                current={goal.current}
                target={goal.target}
                category={goal.category}
                onEdit={() => openEditModal(goal)}
                onDelete={() => deleteGoal(goal.id)}
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
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveGoal()
            }}
          >
            <TextInput
              label="Nome da Meta"
              placeholder="Ex: Carro Novo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              mb="md"
            />

            <Select
              label="Categoria"
              placeholder="Selecione"
              data={["Carro", "Casa", "Viagem", "Investimento", "Outros"]}
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value || "Carro" })}
              mb="md"
            />

            <NumberInput
              label="Valor Atual (R$)"
              placeholder="0.00"
              value={formData.current}
              onChange={(value) => setFormData({ ...formData, current: Number(value) || 0 })}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              mb="md"
            />

            <NumberInput
              label="Valor Meta (R$)"
              placeholder="10000.00"
              value={formData.target}
              onChange={(value) => setFormData({ ...formData, target: Number(value) || 0 })}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              required
              mb="lg"
            />

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" color="green">
                {editingGoal ? "Salvar" : "Criar Meta"}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}