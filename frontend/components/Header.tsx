"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = user
    ? [
        { label: "💰 Histórico de Lançamentos", id: "history" },
        { label: "⭐ Favoritos", id: "favorites" },
        { label: "💵 Saldo", id: "balance" },
      ]
    : [];

  const handleMenuItemClick = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <>
      <header className="header-gradient">
        <div className="container">
          <nav className="nav">
            {/* Hamburguer + Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {user && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`hamburger-button ${isMenuOpen ? "hidden" : ""}`}
                  aria-label="Menu"
                >
                  <div className="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </button>
              )}
              <div className="logo-enhanced">Lino$</div>
            </div>

            {/* Tema + Logout (Desktop) */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Mudar para tema ${theme === "light" ? "escuro" : "claro"}`}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>
              {user && (
                <button
                  className="btn btn-outline btn-logout-desktop"
                  onClick={logout}
                >
                  Sair
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Sidebar Menu + Overlay */}
      {user && (
        <>
          {/* Overlay escuro */}
          <div
            className={`sidebar-overlay ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Lateral */}
          <aside className={`sidebar ${isMenuOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <h2>Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="close-button"
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <nav className="sidebar-content">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className="sidebar-item"
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  {item.label}
                </button>
              ))}

              <div className="sidebar-divider" />

              <button className="sidebar-item danger" onClick={handleLogout}>
                🚪 Sair
              </button>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}