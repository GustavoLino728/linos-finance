"use client"

import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="header-gradient">
      <div className="container">
        <nav className="nav">
          <div className="logo-enhanced">Lino$</div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Mudar para tema ${theme === "light" ? "escuro" : "claro"}`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            {user && (
              <button className="btn btn-outline" onClick={logout} style={{ color: "white", borderColor: "white" }}>
                Sair
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
