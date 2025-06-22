export interface Transaction {
  tipo: "entrada" | "saida"
  descricao: string
  valor: number
  data: string
  categoria?: string
  metodo_pagamento?: string
}

export interface TransactionFormData {
  tipo: "entrada" | "saida"
  descricao: string
  valor: string
  data: string
  categoria: string
  metodo_pagamento: string
}

export interface ApiResponse {
  success: boolean
  message: string
  data?: any
}
