import { UniversalStorage } from "./storage"
import { ApiService } from "./api"
import type { Transaction } from "../types/Transaction"

export class OfflineCacheService {
  private static readonly CACHE_KEY = "offline_transactions"
  private static readonly SYNC_STATUS_KEY = "sync_status"

  // Verificar se está online
  static isOnline(): boolean {
    if (typeof window === "undefined") return true
    return navigator.onLine
  }

  // Salvar transação offline
  static async saveOfflineTransaction(transaction: Omit<Transaction, "email">): Promise<void> {
    try {
      const cachedTransactions = (await UniversalStorage.getObject<any[]>(this.CACHE_KEY)) || []
      const transactionWithId = {
        ...transaction,
        offline_id: Date.now().toString(),
        created_at: new Date().toISOString(),
        synced: false,
      }

      cachedTransactions.push(transactionWithId)
      await UniversalStorage.setObject(this.CACHE_KEY, cachedTransactions)

      console.log("Transação salva offline:", transactionWithId)
    } catch (error) {
      console.error("Erro ao salvar transação offline:", error)
      throw error
    }
  }

  // Obter transações não sincronizadas
  static async getUnsyncedTransactions(): Promise<any[]> {
    try {
      const cachedTransactions = (await UniversalStorage.getObject<any[]>(this.CACHE_KEY)) || []
      return cachedTransactions.filter((t) => !t.synced)
    } catch (error) {
      console.error("Erro ao obter transações não sincronizadas:", error)
      return []
    }
  }

  // Sincronizar transações offline
  static async syncOfflineTransactions(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline()) {
      console.log("Dispositivo offline, sincronização adiada")
      return { success: 0, failed: 0 }
    }

    const unsyncedTransactions = await this.getUnsyncedTransactions()
    let success = 0
    let failed = 0

    for (const transaction of unsyncedTransactions) {
      try {
        const result = await ApiService.addLancamento(transaction)
        if (result.success) {
          // Marcar como sincronizada
          await this.markTransactionAsSynced(transaction.offline_id)
          success++
        } else {
          failed++
        }
      } catch (error) {
        console.error("Erro ao sincronizar transação:", error)
        failed++
      }
    }

    console.log(`Sincronização concluída: ${success} sucesso, ${failed} falhas`)
    return { success, failed }
  }

  // Marcar transação como sincronizada
  private static async markTransactionAsSynced(offlineId: string): Promise<void> {
    try {
      const cachedTransactions = (await UniversalStorage.getObject<any[]>(this.CACHE_KEY)) || []
      const updatedTransactions = cachedTransactions.map((t) =>
        t.offline_id === offlineId ? { ...t, synced: true } : t,
      )
      await UniversalStorage.setObject(this.CACHE_KEY, updatedTransactions)
    } catch (error) {
      console.error("Erro ao marcar transação como sincronizada:", error)
    }
  }

  // Limpar transações sincronizadas antigas
  static async cleanupSyncedTransactions(): Promise<void> {
    try {
      const cachedTransactions = (await UniversalStorage.getObject<any[]>(this.CACHE_KEY)) || []
      const unsyncedOnly = cachedTransactions.filter((t) => !t.synced)
      await UniversalStorage.setObject(this.CACHE_KEY, unsyncedOnly)
    } catch (error) {
      console.error("Erro ao limpar transações sincronizadas:", error)
    }
  }

  // Obter status de sincronização
  static async getSyncStatus(): Promise<{ total: number; synced: number; pending: number }> {
    try {
      const cachedTransactions = (await UniversalStorage.getObject<any[]>(this.CACHE_KEY)) || []
      const total = cachedTransactions.length
      const synced = cachedTransactions.filter((t) => t.synced).length
      const pending = total - synced

      return { total, synced, pending }
    } catch (error) {
      console.error("Erro ao obter status de sincronização:", error)
      return { total: 0, synced: 0, pending: 0 }
    }
  }
}