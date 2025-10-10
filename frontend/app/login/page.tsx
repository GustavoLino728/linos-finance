"use client"

import { useRouter } from "next/navigation"
import LoginForm from "@/components/LoginForm"
import Header from "@/components/Header"

export default function LoginPage() {
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
          <LoginForm 
            onSwitchToRegister={() => router.push("/register")} 
            onSuccess={() => router.push("/")}
          />
        </div>
      </main>
    </div>
  )
}