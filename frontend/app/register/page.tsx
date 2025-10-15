"use client"

import { useRouter } from "next/navigation"
import RegisterForm from "@/components/RegisterForm"
import Header from "@/components/Header"
import { AlignCenter } from "lucide-react"

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
        <div className="container" style={{ maxWidth: "400px", marginBottom: "10px"}}>
          <div className="card">
            <h3 className="title-with-gradient">Importante</h3>
            <p>Antes de preencher com suas informações, acesse a planilha abaixo e faça uma cópia para você, certifique-se de selecionar para compartilhar com as mesmas pessoas, se não quiser fazer isso, terá que adicionar a conta a seguir com permissão de editor: </p>
            <p>financas-bot@financasapp-463621.iam.gserviceaccount.com</p>
            <a style={{color: "var(--primary)"}} href="https://docs.google.com/spreadsheets/d/1I71cva_VIFqj1xoBOUz5U3RT4uOPVi4R02eRRyAYtGY/edit?gid=101044508#gid=101044508">Acesse aqui a planilha</a>     
          </div>
          <RegisterForm
            onSwitchToLogin={() => router.push("/login")}
            onSuccess={() => router.push("/login")}
          />
        </div>
      </main>
    </div>
  )
}