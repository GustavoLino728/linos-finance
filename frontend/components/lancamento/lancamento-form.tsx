"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Star } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"

const categorias = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Roupas",
  "Tecnologia",
  "Outros",
]

const metodosPagamento = ["Dinheiro", "Cartão de Débito", "Cartão de Crédito", "PIX", "Transferência", "Outros"]

export function LancamentoForm() {
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada")
  const [formData, setFormData] = useState({
    desc: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoria: "",
    metodoPag: "",
    parcelado: false,
    parcelas: 1,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [showMetodoModal, setShowMetodoModal] = useState(false)

  const { getAuthToken, user } = useAuth()
  const { saveFavorite } = useFavorites()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const token = await getAuthToken()
      if (!token) {
        setMessage("Erro de autenticação. Faça login novamente.")
        return
      }

      if (!user) {
        setMessage("Usuário não encontrado. Faça login novamente.")
        return
      }

      console.log("Enviando lançamento:", {
        tipo,
        desc: formData.desc,
        valor: Number.parseFloat(formData.valor),
        data: formData.data,
        categoria: formData.categoria,
        metodoPag: formData.metodoPag,
        parcelado: formData.parcelado,
        parcelas: formData.parcelas,
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-lancamento`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo,
          desc: formData.desc,
          valor: Number.parseFloat(formData.valor),
          data: formData.data,
          categoria: formData.categoria,
          metodoPag: formData.metodoPag,
          parcelado: formData.parcelado,
          parcelas: formData.parcelas,
        }),
      })

      const responseData = await response.json()
      console.log("Resposta do servidor:", responseData)

      if (response.ok) {
        setMessage("Lançamento adicionado com sucesso!")
        setFormData({
          desc: "",
          valor: "",
          data: new Date().toISOString().split("T")[0],
          categoria: "",
          metodoPag: "",
          parcelado: false,
          parcelas: 1,
        })
      } else {
        setMessage(responseData.erro || responseData.mensagem || "Erro ao adicionar lançamento.")
      }
    } catch (error: any) {
      console.error("Erro ao adicionar lançamento:", error)
      setMessage(`Erro de conexão: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFavorite = async () => {
    if (!formData.desc || !formData.valor) {
      setMessage("Preencha descrição e valor para salvar como favorito.")
      return
    }

    const success = await saveFavorite({
      type: tipo,
      description: formData.desc,
      value: Number.parseFloat(formData.valor),
      category: formData.categoria,
      payment_method: formData.metodoPag,
    })

    if (success) {
      setMessage("Favorito salvo com sucesso!")
    } else {
      setMessage("Erro ao salvar favorito.")
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-primary dark:text-dark-primary">Adicionar Lançamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tipo} onValueChange={(value) => setTipo(value as "entrada" | "saida")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrada" className="text-success dark:text-dark-success">
              Entrada
            </TabsTrigger>
            <TabsTrigger value="saida" className="text-error dark:text-dark-error">
              Saída
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Input
                id="desc"
                value={formData.desc}
                onChange={(e) => handleChange("desc", e.target.value)}
                placeholder="Descrição do lançamento"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => handleChange("valor", e.target.value)}
                placeholder="0,00"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleChange("data", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <TabsContent value="saida" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Dialog open={showCategoriaModal} onOpenChange={setShowCategoriaModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      {formData.categoria || "Selecionar categoria"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Selecionar Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2">
                      {categorias.map((categoria) => (
                        <Button
                          key={categoria}
                          variant="ghost"
                          onClick={() => {
                            handleChange("categoria", categoria)
                            setShowCategoriaModal(false)
                          }}
                          className="justify-start"
                        >
                          {categoria}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <Dialog open={showMetodoModal} onOpenChange={setShowMetodoModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      {formData.metodoPag || "Selecionar método"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Método de Pagamento</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2">
                      {metodosPagamento.map((metodo) => (
                        <Button
                          key={metodo}
                          variant="ghost"
                          onClick={() => {
                            handleChange("metodoPag", metodo)
                            setShowMetodoModal(false)
                          }}
                          className="justify-start"
                        >
                          {metodo}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {formData.metodoPag === "Cartão de Crédito" && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parcelado"
                      checked={formData.parcelado}
                      onCheckedChange={(checked) => handleChange("parcelado", checked)}
                    />
                    <Label htmlFor="parcelado">Foi parcelado?</Label>
                  </div>

                  {formData.parcelado && (
                    <div className="space-y-2">
                      <Label htmlFor="parcelas">Quantidade de parcelas</Label>
                      <Input
                        id="parcelas"
                        type="number"
                        min="2"
                        max="24"
                        value={formData.parcelas}
                        onChange={(e) => handleChange("parcelas", Number.parseInt(e.target.value))}
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {message && (
              <Alert
                className={message.includes("sucesso") ? "border-success text-success" : "border-error text-error"}
              >
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveFavorite}
                disabled={loading || !formData.desc || !formData.valor}
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
