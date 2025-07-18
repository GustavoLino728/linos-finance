"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import styles from "./EditFavoriteModal.module.css"

interface Favorite {
  id?: string
  type: "entrada" | "saida"
  description: string
  value: number
  category?: string
  payment_method?: string
}

interface EditFavoriteModalProps {
  isOpen: boolean
  onClose: () => void
  favorite: Favorite | null
  onSave: (favorite: Favorite) => Promise<boolean>
}

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

export const EditFavoriteModal: React.FC<EditFavoriteModalProps> = ({ isOpen, onClose, favorite, onSave }) => {
  const [formData, setFormData] = useState({
    type: "entrada" as "entrada" | "saida",
    description: "",
    value: "",
    category: "",
    payment_method: "",
  })
  const [loading, setLoading] = useState(false)
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [showMetodoModal, setShowMetodoModal] = useState(false)

  useEffect(() => {
    if (favorite) {
      setFormData({
        type: favorite.type,
        description: favorite.description,
        value: favorite.value.toString(),
        category: favorite.category || "",
        payment_method: favorite.payment_method || "",
      })
    }
  }, [favorite])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedFavorite: Favorite = {
        id: favorite?.id,
        type: formData.type,
        description: formData.description,
        value: Number.parseFloat(formData.value),
        category: formData.category,
        payment_method: formData.payment_method,
      }

      const success = await onSave(updatedFavorite)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Erro ao salvar favorito:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!favorite) return null

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Favorito">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${formData.type === "entrada" ? styles.tabActive : ""} ${styles.tabEntrada}`}
              onClick={() => handleChange("type", "entrada")}
            >
              Entrada
            </button>
            <button
              type="button"
              className={`${styles.tab} ${formData.type === "saida" ? styles.tabActive : ""} ${styles.tabSaida}`}
              onClick={() => handleChange("type", "saida")}
            >
              Saída
            </button>
          </div>

          <Input
            label="Descrição"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Descrição do favorito"
            required
            disabled={loading}
          />

          <Input
            label="Valor"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => handleChange("value", e.target.value)}
            placeholder="0,00"
            required
            disabled={loading}
          />

          {formData.type === "saida" && (
            <>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Categoria</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoriaModal(true)}
                  className={styles.selectButton}
                >
                  {formData.category || "Selecionar categoria"}
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
                  {formData.payment_method || "Selecionar método"}
                </Button>
              </div>
            </>
          )}

          <div className={styles.buttonGroup}>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCategoriaModal} onClose={() => setShowCategoriaModal(false)} title="Selecionar Categoria">
        <div className={styles.modalOptions}>
          {categorias.map((categoria) => (
            <Button
              key={categoria}
              variant="ghost"
              onClick={() => {
                handleChange("category", categoria)
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
                handleChange("payment_method", metodo)
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
