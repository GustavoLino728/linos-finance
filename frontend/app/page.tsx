"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import LoginForm from "../components/LoginForm"
import RegisterForm from "../components/RegisterForm"
import LancamentoForm from "../components/LancamentoForm"
import FavoritosSection from "../components/FavoritosSection"
import WelcomeSection from "../components/WelcomeSection"

export default function Home() {
  const { user, isLoading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [refreshFavoritos, setRefreshFavoritos] = useState(0)

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page-background">
        <Header />
        <main
          style={{
            minHeight: "calc(100vh - 80px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 0",
          }}
        >
          <div className="container" style={{ maxWidth: "400px" }}>
            {showRegister ? (
              <RegisterForm onSwitchToLogin={() => setShowRegister(false)} onSuccess={() => setShowRegister(false)} />
            ) : (
              <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page-background">
      <Header />
      <main style={{ minHeight: "calc(100vh - 80px)", padding: "20px 0" }}>
        <div className="container">
          <WelcomeSection />
          <div
            style={{
              display: "grid",
              gap: "24px",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <LancamentoForm onSuccess={() => setRefreshFavoritos((prev) => prev + 1)} />
            <FavoritosSection key={refreshFavoritos} />
          </div>
        </div>
      </main>
    </div>
  )
}
