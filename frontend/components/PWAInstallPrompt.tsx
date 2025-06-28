"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Colors } from "../constants/Colors"

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    // Só funciona no ambiente web
    if (typeof window === "undefined") return

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowInstall(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowInstall(false)
    setDeferredPrompt(null)
  }

  // Não mostrar no React Native (APK)
  if (typeof window === "undefined" || !showInstall) return null

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📱</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Instalar App</Text>
          <Text style={styles.description}>Adicione à tela inicial para acesso rápido</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <Text style={styles.dismissButtonText}>Agora não</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.installButton} onPress={handleInstall}>
            <Text style={styles.installButtonText}>Instalar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary + "15",
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  dismissButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  installButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  installButtonText: {
    fontSize: 12,
    color: Colors.surface,
    fontWeight: "600",
  },
})
