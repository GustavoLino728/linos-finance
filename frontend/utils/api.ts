const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://organizacao-financeira-app.onrender.com"
    : "http://localhost:5000"

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = localStorage.getItem("auth_token")
  let url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const requestOptions: RequestInit = {
    ...options,
    headers: defaultHeaders,
    mode: "cors",
  }

  // Não modifique o body, não inclua email
  try {
    const response = await fetch(url, requestOptions)
    return response
  } catch (error) {
    throw error
  }
}

export const checkBackendConnection = async (): Promise<boolean> => {
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
  } catch {
    return false
  }
}