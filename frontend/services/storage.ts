// Adaptador universal de storage para PWA
export class UniversalStorage {
  // Detectar se está em ambiente web
  private static isWeb(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  }

  // Detectar se está em React Native
  private static isNative(): boolean {
    return typeof window === "undefined"
  }

  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb()) {
        // Web: usar localStorage
        localStorage.setItem(key, value)
      } else {
        // React Native: usar AsyncStorage
        const AsyncStorage = require("@react-native-async-storage/async-storage").default
        await AsyncStorage.setItem(key, value)
      }
    } catch (error) {
      console.error("Erro ao salvar no storage:", error)
      throw error
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb()) {
        // Web: usar localStorage
        return localStorage.getItem(key)
      } else {
        // React Native: usar AsyncStorage
        const AsyncStorage = require("@react-native-async-storage/async-storage").default
        return await AsyncStorage.getItem(key)
      }
    } catch (error) {
      console.error("Erro ao ler do storage:", error)
      return null
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb()) {
        // Web: usar localStorage
        localStorage.removeItem(key)
      } else {
        // React Native: usar AsyncStorage
        const AsyncStorage = require("@react-native-async-storage/async-storage").default
        await AsyncStorage.removeItem(key)
      }
    } catch (error) {
      console.error("Erro ao remover do storage:", error)
      throw error
    }
  }

  // Para dados mais complexos - usar IndexedDB no web
  static async setObject(key: string, value: any): Promise<void> {
    const jsonValue = JSON.stringify(value)
    await this.setItem(key, jsonValue)
  }

  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
      console.error("Erro ao parsear objeto do storage:", error)
      return null
    }
  }

  // Cache offline robusto para transações
  static async cacheTransaction(transaction: any): Promise<void> {
    try {
      const existingCache = (await this.getObject<any[]>("cached_transactions")) || []
      const newCache = [...existingCache, { ...transaction, cached_at: new Date().toISOString() }]
      await this.setObject("cached_transactions", newCache)
    } catch (error) {
      console.error("Erro ao cachear transação:", error)
    }
  }

  static async getCachedTransactions(): Promise<any[]> {
    try {
      return (await this.getObject<any[]>("cached_transactions")) || []
    } catch (error) {
      console.error("Erro ao recuperar transações cacheadas:", error)
      return []
    }
  }

  static async clearCachedTransactions(): Promise<void> {
    try {
      await this.removeItem("cached_transactions")
    } catch (error) {
      console.error("Erro ao limpar cache de transações:", error)
    }
  }
}
