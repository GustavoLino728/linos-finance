"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

interface Favorite {
  id?: string
  type: "entrada" | "saida"
  description: string
  value: number
  category?: string
  payment_method?: string
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)
  const { getAuthToken } = useAuth()

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Token não encontrado")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favoritos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites(data.resposta || [])
      } else {
        console.error("Erro ao buscar favoritos:", response.statusText)
      }
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveFavorite = async (favorite: Omit<Favorite, "id">) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Token não encontrado")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favoritos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: favorite.type,
          desc: favorite.description,
          valor: favorite.value,
          categoria: favorite.category || "",
          metodoPag: favorite.payment_method || "",
        }),
      })

      if (response.ok) {
        await fetchFavorites() // Recarrega a lista
        return true
      } else {
        console.error("Erro ao salvar favorito:", response.statusText)
        return false
      }
    } catch (error) {
      console.error("Erro ao salvar favorito:", error)
      return false
    }
  }

  const updateFavorite = async (favorite: Favorite) => {
    try {
      const token = await getAuthToken()
      if (!token || !favorite.id) {
        throw new Error("Token ou ID não encontrado")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favoritos/${favorite.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: favorite.type,
          desc: favorite.description,
          valor: favorite.value,
          categoria: favorite.category || "",
          metodoPag: favorite.payment_method || "",
        }),
      })

      if (response.ok) {
        await fetchFavorites() // Recarrega a lista
        return true
      } else {
        console.error("Erro ao atualizar favorito:", response.statusText)
        return false
      }
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error)
      return false
    }
  }

  const deleteFavorite = async (id: string) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Token não encontrado")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favoritos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await fetchFavorites() // Recarrega a lista
        return true
      } else {
        console.error("Erro ao deletar favorito:", response.statusText)
        return false
      }
    } catch (error) {
      console.error("Erro ao deletar favorito:", error)
      return false
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  return {
    favorites,
    loading,
    saveFavorite,
    updateFavorite,
    deleteFavorite,
    refetch: fetchFavorites,
  }
}
