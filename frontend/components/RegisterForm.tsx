import { useState } from "react"
import { apiRequest } from "../utils/api"
import { useBalance } from "@/contexts/BalanceContext"
import { notifications } from "@mantine/notifications"
import { TextInput, PasswordInput, Button } from "@mantine/core"

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    sheet_url: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.sheet_url
    ) {
      setError("Todos os campos são obrigatórios")
      setIsLoading(false)
      return
    }
    try {
      const response = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setSuccess("Usuário cadastrado com sucesso!")
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.erro || "Erro ao cadastrar usuário")
      }
    } catch (error) {
      setError("Erro de conexão")
    }
    setIsLoading(false)
  }

  return (
    <div className="card">
      <div className="title-with-gradient">
        <h1 style={{ fontSize: 28, margin: 0 }}>Cadastro</h1>
        <p className="subtitle-text">Crie sua conta para começar a organizar suas finanças</p>
      </div>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Nome"
          placeholder="Seu nome de usuário"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.currentTarget.value })}
          required
          size="md"
          mb="md"
        />
        <TextInput
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
          required
          size="md"
          mb="md"
        />
        <PasswordInput
          label="Senha"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.currentTarget.value })}
          required
          size="md"
          mb="md"
        />
        <TextInput
          label="Link da Planilha Google Sheets"
          placeholder="https://docs.google.com/spreadsheets/..."
          type="url"
          value={formData.sheet_url}
          onChange={(e) => setFormData({ ...formData, sheet_url: e.currentTarget.value })}
          required
          size="md"
          mb="md"
        />
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <Button type="submit" fullWidth loading={isLoading} size="md" mb="md">
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
      <div style={{ textAlign: "center" }}>
        <span style={{ color: "var(--text-secondary)" }}>Já tem uma conta? </span>
        <Button variant="subtle" color="primary" onClick={onSwitchToLogin} size="md">
          Faça login aqui
        </Button>
      </div>
    </div>
  )
}