export interface User {
  id: number
  email: string
  name: string
  sheet_url: string
}

export interface LoginRequest {
  email: string
}

export interface LoginResponse {
  id: number
  email: string
  sheet_url: string
}

export interface RegisterRequest {
  email: string
  name: string
  sheet_url: string
}

export interface RegisterResponse {
  mensagem: string
  resposta: any
}
