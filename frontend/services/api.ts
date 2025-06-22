import type { Transaction, ApiResponse } from "../types/Transaction"

// Configure o IP do seu backend aqui
const API_BASE_URL = "https://organizacao-financeira-app.onrender.com" // Substitua pelo IP da sua máquina

export class ApiService {
  static async addLancamento(transaction: Transaction): Promise<ApiResponse> {
    try {
      const backendData = {
        desc: transaction.descricao,    
        tipo: transaction.tipo,
        valor: transaction.valor,
        data: transaction.data,
        categoria: transaction.categoria,
        metodo_pagamento: transaction.metodo_pagamento,
    }
      const response = await fetch(`${API_BASE_URL}/add-lancamento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Lançamento adicionado com sucesso!",
          data: data,
        }
      } else {
        return {
          success: false,
          message: data.error || "Erro ao adicionar lançamento",
        }
      }
    } catch (error) {
      console.error("Erro na API:", error)
      return {
        success: false,
        message: "Erro de conexão com o servidor",
      }
    }
  }

  static async testConnection(): Promise<boolean> {
  try {
    // Teste com o endpoint que realmente existe
    const response = await fetch(`${API_BASE_URL}/add-lancamento`, {
      method: 'OPTIONS' // Teste de CORS sem enviar dados
    })
    return response.status !== 404 // 404 é ok, significa que o servidor respondeu
  } catch (error) {
    console.error("Erro de conexão:", error)
    return false
  }
}
}
