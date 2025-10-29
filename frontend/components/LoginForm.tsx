"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { TextInput, PasswordInput, Button } from "@mantine/core"


interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToResetPassword: () => void
  onSuccess: () => void
}

export default function LoginForm({ onSwitchToRegister, onSwitchToResetPassword, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    if (!email || !password) {
      setError("Email e senha são obrigatórios")
      setIsLoading(false)
      return
    }
    const success = await login(email, password)
    if (!success) {
      setError("Credenciais inválidas ou usuário não encontrado")
    } else {
      onSuccess()
    }
    setIsLoading(false)
  }

  return (
    <div className="card">
      <div className="title-with-gradient">
        <h1 style={{ fontSize: 28, margin: 0 }}>Login</h1>
        <p className="subtitle-text">Entre com suas credenciais para acessar</p>
      </div>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
          size="md"
          mb="md"
        />
        <PasswordInput
          label="Senha"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          size="md"
          mb="md"
        />
        {error && <div className="error-message">{error}</div>}
        <Button type="submit" fullWidth loading={isLoading} size="md" style={{ marginBottom: 16 }}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <div style={{ textAlign: "center" }}>
        <span style={{ color: "var(--text-secondary)" }}>Não tem uma conta? </span>
        <button
          onClick={onSwitchToRegister}
          style={{ background: "none", border: "none", color: "var(--primary)", textDecoration: "underline", cursor: "pointer", fontSize: 16 }}
        >
          Cadastre-se aqui
        </button>
        <span style={{ color: "var(--text-secondary)" }}> Esqueceu a senha? </span>
        <button
          onClick={onSwitchToResetPassword}
          style={{ background: "none", border: "none", color: "var(--primary)", textDecoration: "underline", cursor: "pointer", fontSize: 16 }}
        >
          Clique aqui
        </button>
      </div>
    </div>
  )
}