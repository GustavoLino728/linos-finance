"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import styles from "./AuthForm.module.css"

interface LoginFormProps {
  onToggleMode: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email)
    } catch (error: any) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={styles.authCard}>
      <CardHeader>
        <h1 className={styles.logo}>Lino$</h1>
        <p className={styles.subtitle}>Entre com seu e-mail para gerenciar suas finanças</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            disabled={loading}
          />

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitButton}>
            Entrar
          </Button>
        </form>

        <div className={styles.toggleText}>
          Não tem uma conta?{" "}
          <button onClick={onToggleMode} className={styles.toggleButton} type="button">
            Cadastre-se aqui
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
