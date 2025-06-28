export interface Transaction {
  email: string
  tipo: "entrada" | "saida"
  desc: string
  valor: number
  data: string
  categoria?: string
  metodoPag?: string
  parcelado?: boolean
  parcelas?: number
}

export interface TransactionFormData {
  tipo: "entrada" | "saida"
  desc: string
  valor: string
  data: string
  categoria: string
  metodoPag: string
  parcelado: boolean
  parcelas: string
}

export interface ApiResponse {
  success: boolean
  message: string
  data?: any
}
