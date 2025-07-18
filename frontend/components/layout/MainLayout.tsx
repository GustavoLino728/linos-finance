"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/Button"
import { LancamentoForm } from "@/components/lancamento/LancamentoForm"
import { FavoritosList } from "@/components/favoritos/FavoritosList"
import styles from "./MainLayout.module.css"

export const MainLayout: React.FC = () => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<"lancamento" | "favoritos">("lancamento")

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.logo}>Lino$</h1>
            </div>

            <div className={styles.headerRight}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={styles.themeButton}
                aria-label={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className={styles.signOutButton}
                aria-label="Sair da conta"
              >
                🚪
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className="container">
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "lancamento" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("lancamento")}
            >
              ➕ Lançamento
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "favoritos" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("favoritos")}
            >
              ⭐ Favoritos
            </button>
          </div>

          <div className={styles.content}>{activeTab === "lancamento" ? <LancamentoForm /> : <FavoritosList />}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <span className={styles.userInfo}>{user?.email}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
