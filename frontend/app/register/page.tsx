"use client"

import { useRouter } from "next/navigation"
import RegisterForm from "@/components/RegisterForm"
import Header from "@/components/Header"

export default function RegisterPage() {
  const router = useRouter()

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
          <RegisterForm
            onSwitchToLogin={() => router.push("/login")}
            onSuccess={() => router.push("/login")}
          />
          <p style={{ marginTop: "20px", textAlign: "center" }}>
            Já tem uma conta?{" "}
            <a href="/login" style={{ color: "blue", cursor: "pointer" }}>
              Faça login
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}