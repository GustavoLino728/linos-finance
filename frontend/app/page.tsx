"use client"

import ProtectedRoute from "@/components/ProtectedRoute"
import Header from "@/components/Header"
import WelcomeSection from "@/components/WelcomeSection"
import BalanceSection from "@/components/BalanceSection"
import TransactionForm from "@/components/TransactionForm"
import FavoritesSection from "@/components/FavoritesSection"
import { useState } from "react"

export default function HomePage() {
  const [refreshFavorites, setRefreshFavorites] = useState(0)

  return (
    <ProtectedRoute>
      <div className="page-background">
        <Header />
        <main style={{ minHeight: "calc(100vh - 80px)", padding: "20px 0" }}>
          <div className="container">
            <WelcomeSection />
            <BalanceSection />
            <div
              style={{
                display: "grid",
                gap: "24px",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              <TransactionForm onSuccess={() => setRefreshFavorites((prev) => prev + 1)} />
              <FavoritesSection key={refreshFavorites} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}