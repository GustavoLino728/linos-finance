import type { Transaction, ApiResponse } from "../types/Transaction"
import { AuthService } from "./auth"
import { ENV } from "../config/environment"

export class ApiService {
  private static readonly BASE_URL = ENV.API_BASE_URL
  private static readonly TIMEOUT = ENV.REQUEST_TIMEOUT
  private static readonly MAX_RETRIES = ENV.MAX_RETRY_ATTEMPTS

  // Método auxiliar para fazer requests com retry e timeout
  private static async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = this.MAX_RETRIES,
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Headers para CORS em produção
          "Access-Control-Allow-Origin": "*",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      // Se não for sucesso e ainda temos tentativas
      if (!response.ok && retries > 0) {
        if (ENV.ENABLE_LOGGING) {
          console.warn(`Request failed, retrying... (${retries} attempts left)`)
        }

        // Aguardar antes de tentar novamente (backoff exponencial)
        await new Promise((resolve) => setTimeout(resolve, (this.MAX_RETRIES - retries + 1) * 1000))
        return this.fetchWithRetry(url, options, retries - 1)
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)

      // Se foi timeout ou erro de rede e ainda temos tentativas
      if (retries > 0) {
        if (ENV.ENABLE_LOGGING) {
          console.warn(`Network error, retrying... (${retries} attempts left)`, error)
        }

        await new Promise((resolve) => setTimeout(resolve, (this.MAX_RETRIES - retries + 1) * 1000))
        return this.fetchWithRetry(url, options, retries - 1)
      }

      throw error
    }
  }

  static async addLancamento(transaction: Omit<Transaction, "email">): Promise<ApiResponse> {
    try {
      // Obter usuário logado
      const user = await AuthService.getUser()
      if (!user) {
        throw new Error("Usuário não está logado")
      }

      const transactionWithEmail: Transaction = {
        ...transaction,
        email: user.email,
      }

      if (ENV.ENABLE_LOGGING) {
        console.log("Enviando transação:", transactionWithEmail)
      }

      const response = await this.fetchWithRetry(`${this.BASE_URL}/add-lancamento`, {
        method: "POST",
        body: JSON.stringify(transactionWithEmail),
      })

      const data = await response.json()

      if (ENV.ENABLE_LOGGING) {
        console.log("Resposta do servidor:", data)
      }

      if (response.ok) {
        return {
          success: true,
          message: data.mensagem || "Lançamento adicionado com sucesso!",
          data: data,
        }
      } else {
        return {
          success: false,
          message: data.erro || "Erro ao adicionar lançamento",
        }
      }
    } catch (error: any) {
      if (ENV.ENABLE_LOGGING) {
        console.error("Erro na API:", error)
      }

      // Diferentes mensagens baseadas no tipo de erro
      let message = "Erro de conexão com o servidor"

      if (error.name === "AbortError") {
        message = "Timeout: Servidor demorou para responder"
      } else if (error.message?.includes("fetch")) {
        message = "Erro de rede: Verifique sua conexão"
      }

      return {
        success: false,
        message,
      }
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const response = await this.fetchWithRetry(`${this.BASE_URL}/`, {
        method: "GET",
      })
      return response.ok
    } catch (error) {
      if (ENV.ENABLE_LOGGING) {
        console.error("Erro de conexão:", error)
      }
      return false
    }
  }

  // Método para verificar saúde do servidor
  static async healthCheck(): Promise<{
    status: "healthy" | "unhealthy" | "unknown"
    latency?: number
    version?: string
  }> {
    const startTime = Date.now()

    try {
      const response = await this.fetchWithRetry(`${this.BASE_URL}/health`, {
        method: "GET",
      })

      const latency = Date.now() - startTime

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        return {
          status: "healthy",
          latency,
          version: data.version || "unknown",
        }
      } else {
        return { status: "unhealthy", latency }
      }
    } catch (error) {
      return { status: "unknown" }
    }
  }
}
