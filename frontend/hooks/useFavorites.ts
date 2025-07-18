"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface Favorite {
  id?: string
  type: "entrada" | "saida"
  description: string
  value: number
  category?: string
  payment_method?: string
}

// Dados mockados para desenvolvimento local
const mockFavorites: Favorite[] = [
  {
    id: "1",
    type: "entrada",
    description: "Salário",
    value: 5000.0,
  },
  {
    id: "2",
    type: "saida",
    description: "Supermercado",
    value: 350.0,
    category: "Alimentação",
    payment_method: "Cartão de Débito",
  },
  {
    id: "3",
    type: "saida",
    description: "Combustível",
    value: 200.0,
    category: "Transporte",
    payment_method: "PIX",
  },
  {
    id: "4",
    type: "entrada",
    description: "Freelance",
    value: 800.0,
  },
]

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)
  const { getAuthToken, user } = useAuth()

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      // Simula delay da API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Carrega favoritos do localStorage ou usa mock
      const savedFavorites = localStorage.getItem(`favorites_${user?.email}`)
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      } else {
        setFavorites(mockFavorites)
        localStorage.setItem(`favorites_${user?.email}`, JSON.stringify(mockFavorites))
      }
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error)
      setFavorites(mockFavorites)
    } finally {
      setLoading(false)
    }
  }

  const saveFavorites = (newFavorites: Favorite[]) => {
    if (user?.email) {
      localStorage.setItem(`favorites_${user.email}`, JSON.stringify(newFavorites))
    }
    setFavorites(newFavorites)
  }

  const saveFavorite = async (favorite: Omit<Favorite, "id">) => {
    try {
      // Simula delay da API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newFavorite = { ...favorite, id: Date.now().toString() }
      const newFavorites = [...favorites, newFavorite]
      saveFavorites(newFavorites)
      return true
    } catch (error) {
      console.error("Erro ao salvar favorito:", error)
      return false
    }
  }

  const updateFavorite = async (favorite: Favorite) => {
    try {
      // Simula delay da API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newFavorites = favorites.map((fav) => (fav.id === favorite.id ? favorite : fav))
      saveFavorites(newFavorites)
      return true
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error)
      return false
    }
  }

  const deleteFavorite = async (id: string) => {
    try {
      // Simula delay da API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newFavorites = favorites.filter((fav) => fav.id !== id)
      saveFavorites(newFavorites)
      return true
    } catch (error) {
      console.error("Erro ao deletar favorito:", error)
      return false
    }
  }

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  return {
    favorites,
    loading,
    saveFavorite,
    updateFavorite,
    deleteFavorite,
    refetch: fetchFavorites,
  }
}
