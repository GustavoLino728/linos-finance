import { mockApiRequest } from "./mockApi"

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "https://organizacao-financeira-app.onrender.com" : "http://localhost:5000"

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("auth_token")
  const userData = localStorage.getItem("user_data")
  const isMockUser = token === "mock_token_123"

  // Se for usuário mock e não for login/cadastro, usar mock API
  if (isMockUser && !endpoint.includes("/login") && !endpoint.includes("/cadastrar")) {
    console.log("Using mock API for:", endpoint)
    return mockApiRequest(endpoint, options)
  }

  // Para usuários reais, usar API real
  let url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  // Para endpoints que precisam de email
  let bodyData = {}
  if (options.body) {
    try {
      bodyData = JSON.parse(options.body as string)
    } catch (e) {
      bodyData = {}
    }
  }

  // Tratar GET requests de forma especial
  if (options.method === "GET" && userData && !endpoint.includes("/login") && !endpoint.includes("/cadastrar")) {
    const user = JSON.parse(userData)

    // Para GET /favoritos, adicionar email na query string
    if (endpoint === "/favoritos") {
      url = `${API_BASE_URL}/favoritos?email=${encodeURIComponent(user.email)}`
    }

    // Para GET, não enviar body
    delete options.body
  } else if (userData && !endpoint.includes("/login") && !endpoint.includes("/cadastrar")) {
    // Para outros métodos (POST, DELETE, PATCH), adicionar email ao body
    const user = JSON.parse(userData)
    bodyData = { ...bodyData, email: user.email }
  }

  try {
    console.log("Making API request to:", url)
    console.log("Method:", options.method || "GET")

    if (options.method !== "GET" && Object.keys(bodyData).length > 0) {
      console.log("Body with email:", bodyData)
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: defaultHeaders,
      mode: "cors",
    }

    // Só adicionar body se não for GET e tiver dados
    if (options.method !== "GET" && Object.keys(bodyData).length > 0) {
      requestOptions.body = JSON.stringify(bodyData)
    }

    const response = await fetch(url, requestOptions)

    console.log("Response status:", response.status)

    return response
  } catch (error) {
    console.error("API Request Error:", error)
    throw error
  }
}

export const checkBackendConnection = async (): Promise<boolean> => {
  const token = localStorage.getItem("auth_token")
  const isMockUser = token === "mock_token_123"

  // Se for usuário mock, sempre retornar true
  if (isMockUser) {
    return true
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
      signal: controller.signal,
      mode: "cors",
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.error("Connection check failed:", error)
    return false
  }
}
