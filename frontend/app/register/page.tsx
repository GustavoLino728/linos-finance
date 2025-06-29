"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"
import { Moon, Sun } from "lucide-react"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sheet_url: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("https://organizacao-financeira-app.onrender.com/cadastrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.erro || "Erro ao cadastrar usuário")
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
    }

    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="card w-full max-w-md text-center">
          <div className="text-success text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-success mb-2">Cadastro realizado!</h2>
          <p className="text-text-secondary">Redirecionando para o login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary mb-2">Criar Conta</h1>
          <p className="text-text-secondary">Preencha os dados para se cadastrar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="sheet_url" className="block text-sm font-medium mb-2">
              Link da Planilha Google Sheets
            </label>
            <input
              type="url"
              id="sheet_url"
              name="sheet_url"
              value={formData.sheet_url}
              onChange={handleChange}
              className="input-field"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              required
            />
            <p className="text-xs text-text-secondary mt-1">Cole aqui o link da sua planilha do Google Sheets</p>
          </div>

          {error && <div className="text-error text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}

          <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary text-sm">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
