"use client"

import { useAuth } from "@/contexts/auth-context"
import { useFavorites } from "@/hooks/use-favorites"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Play, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"

export function FavoritosList() {
  const { favorites, loading, deleteFavorite } = useFavorites()
  const { getAuthToken } = useAuth()
  const [executingId, setExecutingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const executeFavorite = async (favorite: any) => {
    setExecutingId(favorite.id)
    setMessage("")

    try {
      const token = await getAuthToken()
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
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-primary dark:text-dark-primary">Meus Favoritos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert className={message.includes("sucesso") ? "border-success text-success" : "border-error text-error"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-8 text-text-secondary dark:text-dark-text-secondary">
            Nenhum favorito encontrado
          </div>
        ) : (
          favorites.map((favorite) => (
            <div key={favorite.id} className="border border-border dark:border-dark-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={favorite.type === "entrada" ? "default" : "destructive"}
                      className={
                        favorite.type === "entrada"
                          ? "bg-success dark:bg-dark-success text-white"
                          : "bg-error dark:bg-dark-error text-white"
                      }
                    >
                      {favorite.type === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </div>

                  <h3 className="font-medium text-text-primary dark:text-dark-text-primary">{favorite.description}</h3>

                  <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
                    R$ {favorite.value.toFixed(2).replace(".", ",")}
                  </p>

                  {favorite.category && (
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{favorite.category}</p>
                  )}

                  {favorite.payment_method && (
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                      {favorite.payment_method}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => executeFavorite(favorite)}
                  disabled={executingId === favorite.id}
                  className="flex-1 bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
                  size="sm"
                >
                  {executingId === favorite.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Executar
                </Button>

                <Button
                  onClick={() => handleDelete(favorite.id!)}
                  variant="outline"
                  size="sm"
                  className="border-error text-error hover:bg-error hover:text-white dark:border-dark-error dark:text-dark-error"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
