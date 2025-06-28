import { ApiService } from "./api"
import { OfflineCacheService } from "./offlineCache"
import { NotificationService } from "./notifications"
import { PlatformService } from "./platformDetection"
import type { Transaction } from "../types/Transaction"

export class EnhancedApiService extends ApiService {
  // Método inteligente que funciona em APK e PWA
  static async addLancamentoUniversal(transaction: Omit<Transaction, "email">): Promise<any> {
    try {
      // Tentar enviar normalmente
      const result = await this.addLancamento(transaction)

      if (result.success) {
        // Sucesso - notificar usuário
        if (PlatformService.isWeb()) {
          await NotificationService.notifyTransactionSaved(transaction.parcelado, transaction.parcelas)
        }
        // No APK, você pode usar Expo Notifications aqui

        return result
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.log("Erro na API, salvando offline...")

      // Salvar offline (funciona em ambos)
      await OfflineCacheService.saveOfflineTransaction(transaction)

      // Notificar que foi salvo offline
      if (PlatformService.isWeb()) {
        await NotificationService.notifyConnectionError()
      }

      return {
        success: true,
        message: "Transação salva offline. Será sincronizada quando conectar.",
        offline: true,
      }
    }
  }

  // Sincronização inteligente
  static async smartSync(): Promise<void> {
    if (PlatformService.isNative()) {
      // APK: verificar conectividade nativa
      const NetInfo = require("@react-native-netinfo/netinfo")
      const netInfo = await NetInfo.fetch()
      if (!netInfo.isConnected) return
    } else {
      // PWA: verificar navigator.onLine
      if (!navigator.onLine) return
    }

    // Sincronizar transações offline
    await OfflineCacheService.syncOfflineTransactions()
  }
}