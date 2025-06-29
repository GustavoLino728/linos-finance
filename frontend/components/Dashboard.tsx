"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { LogOut, Moon, Sun, TrendingUp, TrendingDown } from "lucide-react"
import TransactionForm from "./TransactionForm"
import ConnectionStatus from "./ConnectionStatus"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [showForm, setShowForm] = useState(false)
  const [transactionType, setTransactionType] = useState<"entrada" | "saida">("entrada")

  const handleNewTransaction = (type: "entrada" | "saida") => {
    setTransactionType(type)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-background-dark shadow-sm border-b border-neutral dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-primary">Organização Financeira</h1>
              <p className="text-sm text-text-secondary">Olá, {user?.email}</p>
            </div>

            <div className="flex items-center space-x-4">
              <ConnectionStatus />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={logout}
                className="flex items-center space-x-2 text-error hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Botão Nova Entrada */}
          <button
            onClick={() => handleNewTransaction("entrada")}
            className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-success"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-success mb-2">Nova Entrada</h3>
                <p className="text-text-secondary text-sm">Registrar receita ou ganho</p>
              </div>
              <div className="bg-success/10 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </button>

          {/* Botão Nova Saída */}
          <button
            onClick={() => handleNewTransaction("saida")}
            className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-error"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-error mb-2">Nova Saída</h3>
                <p className="text-text-secondary text-sm">Registrar gasto ou despesa</p>
              </div>
              <div className="bg-error/10 p-3 rounded-full">
                <TrendingDown className="w-6 h-6 text-error" />
              </div>
            </div>
          </button>
        </div>

        {/* Informações da Planilha */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Informações da Conta</h3>
          <div className="space-y-2">
            <p className="text-text-secondary">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p className="text-text-secondary">
              <span className="font-medium">Planilha:</span> Conectada
            </p>
          </div>
        </div>
      </main>

      {/* Modal do Formulário */}
      {showForm && (
        <TransactionForm type={transactionType} onClose={() => setShowForm(false)} userEmail={user?.email || ""} />
      )}
    </div>
  )
}
