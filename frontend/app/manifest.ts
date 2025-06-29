import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Organização Financeira",
    short_name: "FinanceApp",
    description: "Aplicativo de controle financeiro pessoal com suporte offline",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F9FC",
    theme_color: "#2C7BE5",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
    categories: ["finance", "productivity"],
    shortcuts: [
      {
        name: "Nova Entrada",
        short_name: "Entrada",
        description: "Registrar nova entrada",
        url: "/?action=entrada",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Nova Saída",
        short_name: "Saída",
        description: "Registrar nova saída",
        url: "/?action=saida",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  }
}
