// Adaptação do AsyncStorage para Web
export class StorageAdapter {
  static async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value)
    }
  }

  static async getItem(key: string): Promise<string | null> {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key)
    }
    return null
  }

  static async removeItem(key: string): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key)
    }
  }
}