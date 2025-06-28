// Configurações por ambiente
export interface EnvironmentConfig {
  API_BASE_URL: string
  ENVIRONMENT: "development" | "staging" | "production"
  ENABLE_LOGGING: boolean
  CACHE_TIMEOUT: number
  MAX_RETRY_ATTEMPTS: number
  REQUEST_TIMEOUT: number
}

// Detectar ambiente
const getEnvironment = (): "development" | "staging" | "production" => {
  // Para React Native
  const isReactNative = typeof window === "undefined"
  const devMode = isReactNative ? process.env.NODE_ENV === "development" : false

  if (isReactNative) {
    return devMode ? "development" : "production"
  }

  // Para Web/PWA
  const hostname = window.location.hostname

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development"
  } else if (hostname.includes("staging") || hostname.includes("preview")) {
    return "staging"
  } else {
    return "production"
  }
}

// Configurações por ambiente
const configs: Record<string, EnvironmentConfig> = {
  development: {
    API_BASE_URL: "http://192.168.56.1:5000", // Seu IP local atual
    ENVIRONMENT: "development",
    ENABLE_LOGGING: true,
    CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutos
    MAX_RETRY_ATTEMPTS: 3,
    REQUEST_TIMEOUT: 10000, // 10 segundos
  },
  staging: {
    API_BASE_URL: "https://organizacao-financeira-app.onrender.com", // URL de staging
    ENVIRONMENT: "staging",
    ENABLE_LOGGING: true,
    CACHE_TIMEOUT: 10 * 60 * 1000, // 10 minutos
    MAX_RETRY_ATTEMPTS: 3,
    REQUEST_TIMEOUT: 15000, // 15 segundos
  },
  production: {
    API_BASE_URL: "https://organizacao-financeira-app.onrender.com", // URL de produção
    ENVIRONMENT: "production",
    ENABLE_LOGGING: false,
    CACHE_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    MAX_RETRY_ATTEMPTS: 5,
    REQUEST_TIMEOUT: 20000, // 20 segundos
  },
}

export const ENV = configs[getEnvironment()]

// Log da configuração atual
if (ENV.ENABLE_LOGGING) {
  console.log("🔧 Environment Config:", ENV)
}
