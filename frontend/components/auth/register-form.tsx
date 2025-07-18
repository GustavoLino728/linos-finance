"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface RegisterFormProps {
  onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
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
    } catch (error) {
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
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert className="border-success text-success">
            <AlertDescription>Conta criada com sucesso! Você já pode fazer login.</AlertDescription>
          </Alert>
          <Button
            onClick={onToggleMode}
            className="w-full mt-4 bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
          >
            Voltar ao Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary dark:text-dark-primary">Lino$</CardTitle>
        <CardDescription>Crie sua conta para começar a organizar suas finanças</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Seu nome completo"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheetUrl">Link da Planilha Google Sheets</Label>
            <Input
              id="sheetUrl"
              value={formData.sheetUrl}
              onChange={(e) => handleChange("sheetUrl", e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/..."
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert className="border-error text-error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-text-secondary dark:text-dark-text-secondary">
          Já tem uma conta?{" "}
          <button onClick={onToggleMode} className="text-primary dark:text-dark-primary hover:underline font-medium">
            Faça login
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
