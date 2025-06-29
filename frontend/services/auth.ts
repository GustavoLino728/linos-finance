import { UniversalStorage } from "./storage"
import type { User, LoginResponse, RegisterRequest, RegisterResponse } from "../types/User"
import { ENV } from "../config/environment"

const AUTH_TOKEN_KEY = "@organizacao_financeira:user"

export class AuthService {
  private static readonly BASE_URL = ENV.API_BASE_URL
  private static readonly TIMEOUT = ENV.REQUEST_TIMEOUT

  // Método auxiliar para requests com timeout
  private static async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // Salvar usuário no storage local
  static async saveUser(user: User): Promise<void> {
    try {
      await UniversalStorage.setObject(AUTH_TOKEN_KEY, user)

      if (ENV.ENABLE_LOGGING) {
        console.log("Usuário salvo:", user.email)
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      throw error
    }
  }

  // Recuperar usuário do storage local
  static async getUser(): Promise<User | null> {
    try {
      return await UniversalStorage.getObject<User>(AUTH_TOKEN_KEY)
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error)
      return null
    }
  }

  // Remover usuário do storage (logout)
  static async removeUser(): Promise<void> {
    try {
      await UniversalStorage.removeItem(AUTH_TOKEN_KEY)

      if (ENV.ENABLE_LOGGING) {
        console.log("Usuário removido do storage")
      }
    } catch (error) {
      console.error("Erro ao remover usuário:", error)
      throw error
    }
  }

  // Verificar se usuário está logado
  static async isLoggedIn(): Promise<boolean> {
    const user = await this.getUser()
    return user !== null
  }

  // Login
  static async login(email: string): Promise<LoginResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.BASE_URL}/login`, {
        method: "POST",
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        // Salvar usuário no storage
        const user: User = {
          id: data.id,
          email: data.email,
          name: data.name || "",
          sheet_url: data.sheet_url,
        }
        await this.saveUser(user)

        if (ENV.ENABLE_LOGGING) {
          console.log("Login realizado com sucesso:", user.email)
        }

        return data
      } else {
        throw new Error(data.erro || "Erro no login")
      }
    } catch (error: any) {
      if (ENV.ENABLE_LOGGING) {
        console.error("Erro no login:", error)
      }

      // Mensagens de erro mais específicas
      if (error.name === "AbortError") {
        throw new Error("Timeout: Servidor demorou para responder")
      } else if (error.message?.includes("fetch")) {
        throw new Error("Erro de rede: Verifique sua conexão")
      }

      throw error
    }
  }

  // Cadastro
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Validar e limpar dados
      const cleanData = {
        email: userData.email.toLowerCase().trim(),
        name: userData.name.trim(),
        sheet_url: userData.sheet_url.trim(),
      }

      const response = await this.fetchWithTimeout(`${this.BASE_URL}/cadastrar`, {
        method: "POST",
        body: JSON.stringify(cleanData),
      })

      const data = await response.json()

      if (response.ok) {
        if (ENV.ENABLE_LOGGING) {
          console.log("Cadastro realizado com sucesso:", cleanData.email)
        }
        return data
      } else {
        throw new Error(data.erro || "Erro no cadastro")
      }
    } catch (error: any) {
      if (ENV.ENABLE_LOGGING) {
        console.error("Erro no cadastro:", error)
      }

      if (error.name === "AbortError") {
        throw new Error("Timeout: Servidor demorou para responder")
      } else if (error.message?.includes("fetch")) {
        throw new Error("Erro de rede: Verifique sua conexão")
      }

      throw error
    }
  }

  // Logout
  static async logout(): Promise<void> {
    await this.removeUser()
  }
}
