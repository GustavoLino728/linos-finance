interface Transaction {
  id?: number
  email: string
  tipo: "entrada" | "saida"
  desc: string
  valor: number
  data: string
  categoria?: string
  metodoPag?: string
  parcelado?: boolean
  parcelas?: number
  synced: boolean
  timestamp: number
}

class IndexedDBManager {
  private dbName = "FinanceAppDB"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create transactions store
        if (!db.objectStoreNames.contains("transactions")) {
          const store = db.createObjectStore("transactions", {
            keyPath: "id",
            autoIncrement: true,
          })
          store.createIndex("email", "email", { unique: false })
          store.createIndex("synced", "synced", { unique: false })
          store.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  async addTransaction(transaction: Omit<Transaction, "id">): Promise<number> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["transactions"], "readwrite")
      const store = tx.objectStore("transactions")
      const request = store.add(transaction)

      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedTransactions(): Promise<Transaction[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["transactions"], "readonly")
      const store = tx.objectStore("transactions")
      const index = store.index("synced")
      const request = index.getAll(false)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markTransactionSynced(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["transactions"], "readwrite")
      const store = tx.objectStore("transactions")
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const transaction = getRequest.result
        if (transaction) {
          transaction.synced = true
          const putRequest = store.put(transaction)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          reject(new Error("Transaction not found"))
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async getAllTransactions(email: string): Promise<Transaction[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["transactions"], "readonly")
      const store = tx.objectStore("transactions")
      const index = store.index("email")
      const request = index.getAll(email)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clearSyncedTransactions(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["transactions"], "readwrite")
      const store = tx.objectStore("transactions")
      const index = store.index("synced")
      const request = index.openCursor(true)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const dbManager = new IndexedDBManager()
export type { Transaction }
