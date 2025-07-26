"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email) {
      setError("Email é obrigatório")
      setIsLoading(false)
      return
    }

    const success = await login(email)
    if (!success) {
      setError("Usuário não encontrado")
    }
    setIsLoading(false)
  }

  return (
    <div className="card">
      <div className="title-with-gradient">
        <h1 style={{ fontSize: "28px", margin: 0 }}>Login</h1>
        <p className="subtitle-text">Entre com suas credenciais para acessar</p>
      </div>

      <div
        style={{
          background: "var(--secondary)",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        💡 Para teste local: use <strong>teste@gmail.com</strong>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="label">
            Email
          </label>
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
