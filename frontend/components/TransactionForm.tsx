"use client"

import type React from "react"

import { useState } from "react"
import { X, Calendar } from "lucide-react"
import DatePicker from "./DatePicker"
import CategoryModal from "./CategoryModal"
import PaymentMethodModal from "./PaymentMethodModal"
import { useOffline } from "@/contexts/OfflineContext"

interface TransactionFormProps {
  type: "entrada" | "saida"
  onClose: () => void
  userEmail: string
}

export default function TransactionForm({ type, onClose, userEmail }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    desc: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoria: "",
    metodoPag: "",
    parcelado: false,
    parcelas: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [success, setSuccess] = useState(false)

  const { isBackendConnected, addOfflineTransaction } = useOffline()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        email: userEmail,
        tipo: type,
        desc: formData.desc,
        valor: Number.parseFloat(formData.valor),
        data: formData.data,
        ...(type === "saida" && {
          categoria: formData.categoria,
          metodoPag: formData.metodoPag,
          parcelado: formData.parcelado,
          parcelas: formData.parcelado ? formData.parcelas : 1,
        }),
      }

      if (isBackendConnected) {
        // Tentar enviar diretamente
        const response = await fetch("https://organizacao-financeira-app.onrender.com/add-lancamento", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          setSuccess(true)
          setTimeout(() => {
            onClose()
          }, 2000)
        } else {
          throw new Error("Falha na conexão")
        }
      } else {
        // Salvar offline
        await addOfflineTransaction(payload)
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error("Erro ao salvar lançamento:", error)
      // Em caso de erro, tentar salvar offline
      try {
        const payload = {
          email: userEmail,
          tipo: type,
          desc: formData.desc,
          valor: Number.parseFloat(formData.valor),
          data: formData.data,
          ...(type === "saida" && {
            categoria: formData.categoria,
            metodoPag: formData.metodoPag,
            parcelado: formData.parcelado,
            parcelas: formData.parcelado ? formData.parcelas : 1,
          }),
        }

        await addOfflineTransaction(payload)
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } catch (offlineError) {
        console.error("Erro ao salvar offline:", offlineError)
      }
    }

    setIsLoading(false)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="card w-full max-w-md text-center">
          <div className="text-success text-6xl mb-4">✓</div>
          <h3 className="text-xl font-bold text-success mb-2">Lançamento salvo!</h3>
          <p className="text-text-secondary">
            {type === "entrada" ? "Entrada" : "Saída"} registrada com sucesso
            {!isBackendConnected && (
              <span className="block text-warning text-sm mt-1">Salvo offline - será sincronizado quando conectar</span>
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Nova {type === "entrada" ? "Entrada" : "Saída"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <input
              type="text"
              value={formData.desc}
              onChange={(e) => handleChange("desc", e.target.value)}
              className="input-field"
              placeholder="Descreva o lançamento"
              required
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium mb-2">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => handleChange("valor", e.target.value)}
              className="input-field"
              placeholder="0,00"
              required
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium mb-2">Data</label>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="input-field flex items-center justify-between"
            >
              <span>{new Date(formData.data).toLocaleDateString("pt-BR")}</span>
              <Calendar className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Campos específicos para saída */}
          {type === "saida" && (
            <>
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="input-field flex items-center justify-between"
                >
                  <span>{formData.categoria || "Selecionar categoria"}</span>
                  <span className="text-text-secondary">▼</span>
                </button>
              </div>

              {/* Método de Pagamento */}
              <div>
                <label className="block text-sm font-medium mb-2">Método de Pagamento</label>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="input-field flex items-center justify-between"
                >
                  <span>{formData.metodoPag || "Selecionar método"}</span>
                  <span className="text-text-secondary">▼</span>
                </button>
              </div>

              {/* Parcelamento (apenas para cartão de crédito) */}
              {formData.metodoPag === "Cartão de Crédito" && (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="parcelado"
                      checked={formData.parcelado}
                      onChange={(e) => handleChange("parcelado", e.target.checked)}
                      className="w-4 h-4 text-primary"
                    />
                    <label htmlFor="parcelado" className="text-sm font-medium">
                      Parcelado
                    </label>
                  </div>

                  {formData.parcelado && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Número de Parcelas</label>
                      <input
                        type="number"
                        min="2"
                        max="24"
                        value={formData.parcelas}
                        onChange={(e) => handleChange("parcelas", Number.parseInt(e.target.value))}
                        className="input-field"
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
            {isLoading ? "Salvando..." : "Salvar Lançamento"}
          </button>
        </form>
      </div>

      {/* Modais */}
      {showDatePicker && (
        <DatePicker
          selectedDate={formData.data}
          onDateSelect={(date) => {
            handleChange("data", date)
            setShowDatePicker(false)
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          selectedCategory={formData.categoria}
          onCategorySelect={(category) => {
            handleChange("categoria", category)
            setShowCategoryModal(false)
          }}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {showPaymentModal && (
        <PaymentMethodModal
          selectedMethod={formData.metodoPag}
          onMethodSelect={(method) => {
            handleChange("metodoPag", method)
            setShowPaymentModal(false)
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  )
}
