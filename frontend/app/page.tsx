"use client"
import { useAuth } from "@/contexts/AuthContext"
import { AuthScreen } from "@/components/auth/AuthScreen"
import { MainLayout } from "@/components/layout/MainLayout"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import styles from "./page.module.css"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Card className={styles.loadingCard}>
          <CardHeader>
            <h1 className={styles.loadingLogo}>Lino$</h1>
            <p className={styles.loadingText}>Carregando aplicação...</p>
          </CardHeader>
          <CardContent>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user) {
    return <MainLayout />
  }

  return <AuthScreen />
}
