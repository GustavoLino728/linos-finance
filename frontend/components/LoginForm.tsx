"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSuccess: () => void
}

export default function LoginForm({ onSwitchToRegister, onSuccess }: LoginFormProps) {
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
        <h1 style={{ fontSize: "28px", margin: 0 }}>Login</h1>
        <p className="subtitle-text">Entre com suas credenciais para acessar</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="label">Senha</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{ width: "100%", marginBottom: "16px" }}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div style={{ textAlign: "center" }}>
        <span style={{ color: "var(--text-secondary)" }}>Não tem uma conta? </span>
        <button
          onClick={onSwitchToRegister}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Cadastre-se aqui
        </button>
      </div>
    </div>
  )
}