"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

interface User {
  id: string
  email: string
  name: string // Adicionado para capturar o nome do usuário
  sheet_url: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string) => Promise<void>
  signUp: (email: string, name: string, sheetUrl: string) => Promise<void>
  signOut: () => Promise<void>
  getAuthToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const getAuthToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  const fetchUserDataFromBackend = async (token: string, email: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }), // Envia o email no corpo da requisição
    })

    if (response.ok) {
      const userData = await response.json()
      return userData as User
    } else {
      const errorData = await response.json()
      throw new Error(errorData.erro || "Erro ao obter dados do usuário do backend.")
    }
  }

  const signIn = async (email: string) => {
    setLoading(true)
    try {
      // 1. Primeiro, verifica se o usuário existe no seu banco de dados (backend)
      const checkUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!checkUserResponse.ok) {
        const errorData = await checkUserResponse.json()
        // Se o backend disser que o usuário não foi encontrado, LANÇA UM ERRO E PARA AQUI.
        throw new Error(errorData.erro || "Usuário não encontrado. Cadastre-se primeiro.")
      }

      // 2. Se o usuário existe no backend, tenta fazer login no Supabase Auth com magic link.
      //    Crucial: shouldCreateUser: false. Se o usuário não existe no Supabase Auth, isso VAI retornar um erro.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (otpError) {
        // Se otpError ocorrer aqui, significa que o usuário existe no SEU backend, mas NÃO no Supabase Auth.
        // Este é um passo de sincronização: cria o usuário no Supabase Auth.
        console.warn("Usuário existe no backend, mas não no Supabase Auth. Criando no Supabase Auth...")
        const { error: signUpAuthError } = await supabase.auth.signUp({
          email: email,
          password: `temp_${Date.now()}`, // Senha temporária para o MVP
        })
        if (signUpAuthError) {
          throw new Error(signUpAuthError.message || "Erro ao sincronizar usuário com Supabase Auth.")
        }
        // Após o signUp bem-sucedido no Supabase Auth, o usuário agora está no Supabase Auth.
        // Não precisamos chamar signInWithOtp novamente imediatamente, pois o onAuthStateChange irá lidar com isso.
      }

      // 3. Aguarda um pouco para a sessão ser estabelecida pelo listener onAuthStateChange
      //    O listener onAuthStateChange irá buscar os dados do usuário do backend após o evento SIGNED_IN.
      //    Não há necessidade de buscar manualmente os dados do usuário aqui, pois é tratado pelo useEffect em AuthProvider.
    } catch (error: any) {
      console.error("Erro no processo de login:", error)
      await supabase.auth.signOut() // Garante que qualquer sessão parcial seja limpa
      throw new Error(error.message || "Erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, name: string, sheetUrl: string) => {
    setLoading(true)
    try {
      // 1. Primeiro, cadastra o usuário no seu backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadastrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          sheet_url: sheetUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.erro || "Erro ao cadastrar usuário no sistema.")
      }

      // 2. Depois, cria o usuário no Supabase Auth
      const { error: authSignUpError } = await supabase.auth.signUp({
        email: email,
        password: `temp_${Date.now()}`, // Senha temporária para o MVP
      })

      if (authSignUpError) {
        // Se falhar no Supabase Auth, pode ser que o email já exista lá.
        // Tenta fazer login para sincronizar.
        const { error: signInAuthError } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false,
          },
        })
        if (signInAuthError) {
          throw new Error(signInAuthError.message || "Erro ao sincronizar usuário com Supabase Auth.")
        }
      }

      // 3. Após cadastrar e sincronizar, faz login para obter a sessão
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Pequeno delay para Supabase
      await signIn(email)
    } catch (error: any) {
      console.error("Erro no processo de cadastro:", error)
      throw new Error(error.message || "Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user?.email && session.access_token) {
          const userData = await fetchUserDataFromBackend(session.access_token, session.user.email)
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Erro ao carregar sessão inicial:", error)
        await supabase.auth.signOut() // Garante que o usuário seja deslogado se houver erro
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "SIGNED_IN" && session?.user?.email && session.access_token) {
        try {
          const userData = await fetchUserDataFromBackend(session.access_token, session.user.email)
          setUser(userData)
        } catch (error) {
          console.error("Erro ao obter dados do usuário após SIGNED_IN:", error)
          await supabase.auth.signOut()
          setUser(null)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return context
}
