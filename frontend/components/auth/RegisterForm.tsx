"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import styles from "./AuthForm.module.css"

interface RegisterFormProps {
  onToggleMode: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sheetUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signUp(formData.email, formData.name, formData.sheetUrl)
      setSuccess(true)
    } catch (error: any) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <Card className={styles.authCard}>
        <CardContent>
          <div className={styles.success}>Conta criada com sucesso!</div>
          <Button onClick={onToggleMode} variant="primary" size="lg" className={styles.submitButton}>
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={styles.authCard}>
      <CardHeader>
        <h1 className={styles.logo}>Lino$</h1>
        <p className={styles.subtitle}>Crie sua conta para começar a organizar suas finanças</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Seu nome completo"
            required
            disabled={loading}
          />

          <Input
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="seu@email.com"
            required
            disabled={loading}
          />

          <Input
            label="Link da Planilha Google Sheets"
            value={formData.sheetUrl}
            onChange={(e) => handleChange("sheetUrl", e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/..."
            required
            disabled={loading}
          />

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitButton}>
            Criar Conta
          </Button>
        </form>

        <div className={styles.toggleText}>
          Já tem uma conta?{" "}
          <button onClick={onToggleMode} className={styles.toggleButton} type="button">
            Faça login
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
