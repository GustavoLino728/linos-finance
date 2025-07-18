"use client"

import { useState } from "react"
import { Header } from "./header" // Importa o novo Header
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LancamentoForm } from "@/components/lancamento/lancamento-form"
import { FavoritosList } from "@/components/favoritos/favoritos-list"
import { Plus, Star } from "lucide-react"

export function MainLayout() {
  const [activeTab, setActiveTab] = useState("lancamento")

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <Header /> {/* Usa o novo componente Header */}
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="lancamento" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Lançamento
              </TabsTrigger>
              <TabsTrigger value="favoritos" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Favoritos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lancamento">
              <LancamentoForm />
            </TabsContent>

            <TabsContent value="favoritos">
              <FavoritosList />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      {/* O rodapé com user info foi removido, pois o Header já exibe */}
    </div>
  )
}
