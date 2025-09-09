"use client"

import type React from "react"

import { useState } from "react"
import { apiRequest } from "../utils/api"

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

    if (!formData.name || !formData.email || !formData.sheet_url) {
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
        <h1 style={{ fontSize: "28px", margin: 0 }}>Cadastro</h1>
        <p className="subtitle-text">Crie sua conta para começar a organizar suas finanças</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="label">
            Nome
          </label>
          <input
            id="name"
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Seu nome completo"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sheet_url" className="label">
            Link da Planilha Google Sheets
          </label>
          <input
            id="sheet_url"
            type="url"
            className="input"
            value={formData.sheet_url}
            onChange={(e) => setFormData({ ...formData, sheet_url: e.target.value })}
            placeholder="https://docs.google.com/spreadsheets/..."
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{ width: "100%", marginBottom: "16px" }}
        >
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <div style={{ textAlign: "center" }}>
        <span style={{ color: "var(--text-secondary)" }}>Já tem uma conta? </span>
        <button
          onClick={onSwitchToLogin}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Faça login aqui
        </button>
      </div>
    </div>
  )
}
