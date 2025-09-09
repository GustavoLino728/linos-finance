"use client"

import type React from "react"

import { useState } from "react"
import { apiRequest } from "../utils/api"

interface LancamentoFormProps {
  onSuccess: () => void
}

export default function LancamentoForm({ onSuccess }: LancamentoFormProps) {
  const [activeTab, setActiveTab] = useState<"entrada" | "saida">("entrada")
  const [formData, setFormData] = useState({
    desc: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoria: "",
    metodoPag: "",
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
          tipo: activeTab,
          desc: formData.desc,
          valor: Number.parseFloat(formData.valor),
          categoria: formData.categoria,
          metodoPag: formData.metodoPag,
          parcelado: formData.parcelado,
          parcelas: formData.parcelas,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(data.mensagem || "Lançamento adicionado com sucesso!")
        setFormData({
          desc: "",
          valor: "",
          data: new Date().toISOString().split("T")[0],
          categoria: "",
          metodoPag: "",
          parcelado: false,
          parcelas: 1,
        })
        onSuccess()
      } else {
        const errorData = await response.json()
        setMessage(errorData.erro || `Erro: ${response.status}`)
      }
    } catch (error) {
      setMessage("Erro de conexão")
      console.error("Erro:", error)
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
          tipo: activeTab,
          desc: formData.desc,
          valor: Number.parseFloat(formData.valor),
          categoria: formData.categoria,
          metodoPag: formData.metodoPag,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(data.mensagem || "Favorito salvo com sucesso!")
        onSuccess()
      } else {
        const errorData = await response.json()
        setMessage(errorData.erro || `Erro: ${response.status}`)
      }
    } catch (error) {
      setMessage("Erro de conexão")
      console.error("Erro:", error)
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
          💰 Entrada
        </button>
        <button className={`tab ${activeTab === "saida" ? "active" : ""}`} onClick={() => setActiveTab("saida")}>
          💸 Saída
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="desc" className="label">
            Descrição
          </label>
          <input
            id="desc"
            type="text"
            className="input"
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            placeholder="Descrição do lançamento"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="valor" className="label">
            Valor (R$)
          </label>
          <input
            id="valor"
            type="number"
            step="0.01"
            className="input"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
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
                {formData.categoria || "Selecionar categoria"}
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
                {formData.metodoPag || "Selecionar método"}
              </button>
            </div>

            {formData.metodoPag === "Cartão de crédito" && (
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
            className="btn btn-favorite"
            onClick={salvarFavorito}
            disabled={isSavingFavorite || !formData.desc || !formData.valor}
            style={{ minWidth: "120px" }}
          >
            {isSavingFavorite ? "Salvando..." : "⭐ Favorito"}
          </button>
        </div>
      </form>

      {/* Modal Categoria */}
      {showCategoriaModal && (
        <div className="modal-overlay" onClick={() => setShowCategoriaModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "16px", color: "var(--primary)" }}>Selecionar Categoria</h3>
            {categorias.map((categoria) => (
              <button
                key={categoria}
                className="btn btn-outline"
                onClick={() => {
                  setFormData({ ...formData, categoria })
                  setShowCategoriaModal(false)
                }}
                style={{
                  width: "100%",
                  marginBottom: "8px",
                  justifyContent: "flex-start",
                }}
              >
                {categoria}
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
                  setFormData({ ...formData, metodoPag: metodo })
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
