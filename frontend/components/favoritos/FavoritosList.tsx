"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/hooks/useFavorites"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu"
import { EditFavoriteModal } from "./EditFavoriteModal"
import styles from "./FavoritosList.module.css"

interface Favorite {
  id?: string
  type: "entrada" | "saida"
  description: string
  value: number
  category?: string
  payment_method?: string
}

export const FavoritosList: React.FC = () => {
  const { favorites, loading, deleteFavorite, updateFavorite } = useFavorites()
  const { getAuthToken } = useAuth()
  const [executingId, setExecutingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const executeFavorite = async (favorite: any) => {
    setExecutingId(favorite.id)
    setMessage("")

    try {
      const token = await getAuthToken()
      if (!token) {
        setMessage("Erro de autenticação. Faça login novamente.")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-lancamento`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: favorite.type,
          desc: favorite.description,
          valor: favorite.value,
          data: new Date().toISOString().split("T")[0],
          categoria: favorite.category || "",
          metodoPag: favorite.payment_method || "",
          parcelado: false,
          parcelas: 1,
        }),
      })

      if (response.ok) {
        setMessage("Lançamento executado com sucesso!")
      } else {
        setMessage("Erro ao executar lançamento.")
      }
    } catch (error) {
      setMessage("Erro ao executar lançamento.")
    } finally {
      setExecutingId(null)
    }
  }

  const handleEdit = (favorite: Favorite) => {
    setEditingFavorite(favorite)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (favorite: Favorite) => {
    const success = await updateFavorite(favorite)
    if (success) {
      setMessage("Favorito atualizado com sucesso!")
      return true
    } else {
      setMessage("Erro ao atualizar favorito.")
      return false
    }
  }

  const handleDelete = async (id: string) => {
    const success = await deleteFavorite(id)
    if (success) {
      setMessage("Favorito removido com sucesso!")
    } else {
      setMessage("Erro ao remover favorito.")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Carregando favoritos...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <h2 className={styles.title}>Meus Favoritos</h2>
        </CardHeader>
        <CardContent>
          {message && <div className={message.includes("sucesso") ? styles.success : styles.error}>{message}</div>}

          {favorites.length === 0 ? (
            <div className={styles.empty}>Nenhum favorito encontrado</div>
          ) : (
            <div className={styles.favoritesList}>
              {favorites.map((favorite) => (
                <div key={favorite.id} className={styles.favoriteItem}>
                  <div className={styles.favoriteHeader}>
                    <span className={`${styles.badge} ${styles[favorite.type]}`}>
                      {favorite.type === "entrada" ? "Entrada" : "Saída"}
                    </span>

                    <DropdownMenu
                      trigger={
                        <span className={styles.menuTrigger} aria-label="Opções do favorito">
                          ⋯
                        </span>
                      }
                    >
                      <DropdownMenuItem onClick={() => handleEdit(favorite)}>✏️ Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(favorite.id!)} variant="danger">
                        🗑️ Deletar
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>

                  <div className={styles.favoriteContent}>
                    <h3 className={styles.favoriteTitle}>{favorite.description}</h3>
                    <p className={styles.favoriteValue}>R$ {favorite.value.toFixed(2).replace(".", ",")}</p>

                    {favorite.category && <p className={styles.favoriteDetail}>{favorite.category}</p>}

                    {favorite.payment_method && <p className={styles.favoriteDetail}>{favorite.payment_method}</p>}
                  </div>

                  <div className={styles.favoriteActions}>
                    <Button
                      onClick={() => executeFavorite(favorite)}
                      disabled={executingId === favorite.id}
                      variant="success"
                      size="sm"
                      loading={executingId === favorite.id}
                      className={styles.executeButton}
                    >
                      ▶️ Executar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditFavoriteModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingFavorite(null)
        }}
        favorite={editingFavorite}
        onSave={handleSaveEdit}
      />
    </>
  )
}
