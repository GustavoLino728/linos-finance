"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/hooks/useFavorites"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import styles from "./LancamentoForm.module.css"

const categorias = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Roupas",
  "Tecnologia",
  "Outros",
]

const metodosPagamento = ["Dinheiro", "Cartão de Débito", "Cartão de Crédito", "PIX", "Transferência", "Outros"]

export const LancamentoForm: React.FC = () => {
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada")
  const [formData, setFormData] = useState({
    desc: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoria: "",
    metodoPag: "",
    parcelado: false,
    parcelas: 1,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [showMetodoModal, setShowMetodoModal] = useState(false)

  const { getAuthToken } = useAuth()
  const { saveFavorite } = useFavorites()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const token = await getAuthToken()
      if (!token) {
        setMessage("Erro de autenticação. Faça login novamente.")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-lancamento`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo,
          desc: formData.desc,
          valor: Number.parseFloat(formData.valor),
          data: formData.data,
          categoria: formData.categoria,
          metodoPag: formData.metodoPag,
          parcelado: formData.parcelado,
          parcelas: formData.parcelas,
        }),
      })

      if (response.ok) {
        setMessage("Lançamento adicionado com sucesso!")
        resetForm()
      } else {
        setMessage("Erro ao adicionar lançamento.")
      }
    } catch (error) {
      setMessage("Erro ao adicionar lançamento.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      desc: "",
      valor: "",
      data: new Date().toISOString().split("T")[0],
      categoria: "",
      metodoPag: "",
      parcelado: false,
      parcelas: 1,
    })
  }

  const handleSaveFavorite = async () => {
    const success = await saveFavorite({
      type: tipo,
      description: formData.desc,
      value: Number.parseFloat(formData.valor),
      category: formData.categoria,
      payment_method: formData.metodoPag,
    })

    if (success) {
      setMessage("Favorito salvo com sucesso!")
    } else {
      setMessage("Erro ao salvar favorito.")
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Card>
        <CardHeader>
          <h2 className={styles.title}>Adicionar Lançamento</h2>
        </CardHeader>
        <CardContent>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${tipo === "entrada" ? styles.tabActive : ""} ${styles.tabEntrada}`}
              onClick={() => setTipo("entrada")}
            >
              Entrada
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tipo === "saida" ? styles.tabActive : ""} ${styles.tabSaida}`}
              onClick={() => setTipo("saida")}
            >
              Saída
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Descrição"
              value={formData.desc}
              onChange={(e) => handleChange("desc", e.target.value)}
              placeholder="Descrição do lançamento"
              required
              disabled={loading}
            />

            <Input
              label="Valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => handleChange("valor", e.target.value)}
              placeholder="0,00"
              required
              disabled={loading}
            />

            <Input
              label="Data"
              type="date"
              value={formData.data}
              onChange={(e) => handleChange("data", e.target.value)}
              required
              disabled={loading}
            />

            {tipo === "saida" && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Categoria</label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoriaModal(true)}
                    className={styles.selectButton}
                  >
                    {formData.categoria || "Selecionar categoria"}
                  </Button>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Método de Pagamento</label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMetodoModal(true)}
                    className={styles.selectButton}
                  >
                    {formData.metodoPag || "Selecionar método"}
                  </Button>
                </div>

                {formData.metodoPag === "Cartão de Crédito" && (
                  <div className={styles.parcelamento}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.parcelado}
                        onChange={(e) => handleChange("parcelado", e.target.checked)}
                        className={styles.checkbox}
                      />
                      Foi parcelado?
                    </label>

                    {formData.parcelado && (
                      <Input
                        label="Quantidade de parcelas"
                        type="number"
                        min="2"
                        max="24"
                        value={formData.parcelas}
                        onChange={(e) => handleChange("parcelas", Number.parseInt(e.target.value))}
                        disabled={loading}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {message && <div className={message.includes("sucesso") ? styles.success : styles.error}>{message}</div>}

            <div className={styles.buttonGroup}>
              <Button type="submit" variant="primary" loading={loading} className={styles.submitButton}>
                ➕ Adicionar
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveFavorite}
                disabled={loading || !formData.desc || !formData.valor}
                className={styles.favoriteButton}
              >
                ⭐
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Modal isOpen={showCategoriaModal} onClose={() => setShowCategoriaModal(false)} title="Selecionar Categoria">
        <div className={styles.modalOptions}>
          {categorias.map((categoria) => (
            <Button
              key={categoria}
              variant="ghost"
              onClick={() => {
                handleChange("categoria", categoria)
                setShowCategoriaModal(false)
              }}
              className={styles.optionButton}
            >
              {categoria}
            </Button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showMetodoModal} onClose={() => setShowMetodoModal(false)} title="Método de Pagamento">
        <div className={styles.modalOptions}>
          {metodosPagamento.map((metodo) => (
            <Button
              key={metodo}
              variant="ghost"
              onClick={() => {
                handleChange("metodoPag", metodo)
                setShowMetodoModal(false)
              }}
              className={styles.optionButton}
            >
              {metodo}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  )
}
