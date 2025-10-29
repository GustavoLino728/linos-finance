"use client"

import { useState } from "react"
import { apiRequest } from "../utils/api"
import { useBalance } from "@/contexts/BalanceContext"
import { notifications } from "@mantine/notifications"
import { BanknoteArrowDown, BanknoteArrowUp, Star } from 'lucide-react'; // ← Importar Star

interface TransactionFormProps {
  onSuccess: () => void
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { refreshBalance } = useBalance()
  const [activeTab, setActiveTab] = useState<"entrada" | "saida">("entrada")
  const [formData, setFormData] = useState({
    description: "",
    value: "",
    data: new Date().toISOString().split("T")[0],
    category: "",
    payment_method: "",
    parcelado: false,
    parcelas: 1,
  })
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [showMetodoModal, setShowMetodoModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSavingFavorite, setIsSavingFavorite] = useState(false)

  const categorias = ["Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Casa", "Roupas", "Outros"]
  const metodosPagamento = ["Dinheiro", "Cartão de débito", "Cartão de crédito", "PIX", "Transferência", "Outros"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify({
          data: formData.data,
          transaction_type: activeTab,
          description: formData.description,
          value: Number.parseFloat(formData.value),
          category: formData.category,
          payment_method: formData.payment_method,
          parcelado: formData.parcelado,
          parcelas: formData.parcelas,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setMessage(data.mensagem || "Lançamento adicionado com sucesso!")
        notifications.show({
          title: "Sucesso!",
          message: "Lançamento adicionado com sucesso!",
          color: "green",
        })
        setFormData({
          description: "",
          value: "",
          data: new Date().toISOString().split("T")[0],
          category: "",
          payment_method: "",
          parcelado: false,
          parcelas: 1,
        })
        refreshBalance()
        onSuccess()
      } else {
        const errorData = await response.json()
        setMessage(errorData.erro || `Erro: ${response.status}`)
      }
    } catch (error) {
      setMessage("Erro de conexão")
    }
    setIsLoading(false)
  }

  const salvarFavorito = async () => {
    setIsSavingFavorite(true)
    setMessage("")
    try {
      const response = await apiRequest("/favorites", {
        method: "POST",
        body: JSON.stringify({
          transaction_type: activeTab,
          description: formData.description,
          value: Number.parseFloat(formData.value),
          category: formData.category,
          payment_method: formData.payment_method,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setMessage(data.mensagem || "Favorito salvo com sucesso!")
        notifications.show({
          title: "Sucesso!",
          message: "Favorito salvo com sucesso!",
          color: "green",
        })
        onSuccess()
      } else {
        const errorData = await response.json()
        setMessage(errorData.erro || `Erro: ${response.status}`)
      }
    } catch (error) {
      setMessage("Erro de conexão")
    }
    setIsSavingFavorite(false)
  }

  return (
    <div className="card">
      <div className="title-with-gradient">
        <h2 style={{ fontSize: "24px", margin: 0 }}>Adicionar Lançamento</h2>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === "entrada" ? "active" : ""}`} onClick={() => setActiveTab("entrada")}>
          <BanknoteArrowUp size={26} style={{ color: "var(--success)" }}/> Entrada
        </button>
        <button className={`tab ${activeTab === "saida" ? "active" : ""}`} onClick={() => setActiveTab("saida")}>
          <BanknoteArrowDown size={26} style={{ color: "var(--error)" }}/> Saída
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description" className="label">
            Descrição
          </label>
          <input
            id="description"
            type="text"
            className="input"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição do lançamento"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="value" className="label">
            Valor (R$)
          </label>
          <input
            id="value"
            type="number"
            step="0.01"
            className="input"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="0,00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="data" className="label">
            Data
          </label>
          <input
            id="data"
            type="date"
            className="input"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            required
          />
        </div>

        {activeTab === "saida" && (
          <>
            <div className="form-group">
              <label className="label">Categoria</label>
              <button
                type="button"
                className="input form-select-button"
                onClick={() => setShowCategoriaModal(true)}
                style={{
                  textAlign: "left",
                }}
              >
                {formData.category || "Selecione a categoria"}
              </button>
            </div>

            <div className="form-group">
              <label className="label">Método de Pagamento</label>
              <button
                type="button"
                className="input form-select-button"
                onClick={() => setShowMetodoModal(true)}
                style={{
                  textAlign: "left",
                }}
              >
                {formData.payment_method || "Selecionar método"}
              </button>
            </div>

            {formData.payment_method === "Cartão de crédito" && (
              <>
                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={formData.parcelado}
                      onChange={(e) => setFormData({ ...formData, parcelado: e.target.checked })}
                    />
                    Foi parcelado?
                  </label>
                </div>

                {formData.parcelado && (
                  <div className="form-group">
                    <label htmlFor="parcelas" className="label">
                      Quantidade de parcelas
                    </label>
                    <input
                      id="parcelas"
                      type="number"
                      min="2"
                      max="24"
                      className="input"
                      value={formData.parcelas}
                      onChange={(e) => setFormData({ ...formData, parcelas: Number.parseInt(e.target.value) })}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {message && <div className={message.includes("sucesso") ? "success-message" : "error-message"}>{message}</div>}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="submit"
            className={`btn ${activeTab === "entrada" ? "btn-success" : "btn-error"}`}
            disabled={isLoading}
            style={{ flex: 1 }}
          >
            {isLoading ? "Salvando..." : `Adicionar ${activeTab === "entrada" ? "Entrada" : "Saída"}`}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={salvarFavorito}
            disabled={isSavingFavorite || !formData.description || !formData.value}
            style={{ minWidth: "120px", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}
          >
            {isSavingFavorite ? (
              "Salvando..."
            ) : (
              <>
                <Star size={16} />
                Favorito
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal categoria */}
      {showCategoriaModal && (
        <div className="modal-overlay" onClick={() => setShowCategoriaModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "16px", color: "var(--primary)" }}>Selecionar Categoria</h3>
            {categorias.map((category) => (
              <button
                key={category}
                className="btn btn-outline"
                onClick={() => {
                  setFormData({ ...formData, category })
                  setShowCategoriaModal(false)
                }}
                style={{
                  width: "100%",
                  marginBottom: "8px",
                  justifyContent: "flex-start",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal Método de Pagamento */}
      {showMetodoModal && (
        <div className="modal-overlay" onClick={() => setShowMetodoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "16px", color: "var(--primary)" }}>Selecionar Método</h3>
            {metodosPagamento.map((metodo) => (
              <button
                key={metodo}
                className="btn btn-outline"
                onClick={() => {
                  setFormData({ ...formData, payment_method: metodo })
                  setShowMetodoModal(false)
                }}
                style={{
                  width: "100%",
                  marginBottom: "8px",
                  justifyContent: "flex-start",
                }}
              >
                {metodo}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}