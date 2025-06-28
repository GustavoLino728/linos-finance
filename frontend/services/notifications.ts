export class NotificationService {
  // Verificar se notificações são suportadas
  static isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator
  }

  // Verificar se está no iOS Safari
  static isIOSSafari(): boolean {
    if (typeof window === "undefined") return false
    const userAgent = window.navigator.userAgent
    return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/CriOS|FxiOS/.test(userAgent)
  }

  // Solicitar permissão para notificações
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log("Notificações não suportadas neste dispositivo")
      return false
    }

    if (this.isIOSSafari()) {
      console.log("Notificações limitadas no iOS Safari")
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error)
      return false
    }
  }

  // Mostrar notificação local
  static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported() || Notification.permission !== "granted") {
      // Fallback: mostrar alert no iOS
      if (this.isIOSSafari()) {
        alert(`${title}\n${options?.body || ""}`)
      }
      return
    }

    try {
      new Notification(title, {
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        ...options,
      })
    } catch (error) {
      console.error("Erro ao mostrar notificação:", error)
    }
  }

  // Notificação de transação salva
  static async notifyTransactionSaved(isInstallment = false, installments?: number): Promise<void> {
    const title = "💰 Transação Salva!"
    const body = isInstallment
      ? `Parcelamento de ${installments}x adicionado com sucesso`
      : "Sua transação foi registrada na planilha"

    await this.showNotification(title, { body })
  }

  // Notificação de erro de conexão
  static async notifyConnectionError(): Promise<void> {
    const title = "⚠️ Erro de Conexão"
    const body = "Transação salva localmente. Será sincronizada quando conectar."

    await this.showNotification(title, { body })
  }
}
