"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Alert, TouchableOpacity } from "react-native"
import TransactionForm from "../components/TransactionForm"
import { Colors } from "../constants/Colors"
import { ApiService } from "../services/api"
import { AuthService } from "../services/auth"
import type { User } from "../types/User"
import PWAInstallPrompt from "../components/PWAInstallPrompt"

interface HomeScreenProps {
  onLogout: () => void
}

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    loadUserData()
    checkConnection()
  }, [])

  const loadUserData = async () => {
    const userData = await AuthService.getUser()
    setUser(userData)
  }

  const checkConnection = async () => {
    const isConnected = await ApiService.testConnection()
    setConnectionStatus(isConnected)

    if (!isConnected) {
      Alert.alert(
        "Conexão",
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando e o IP está correto.",
        [{ text: "OK" }],
      )
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: onLogout, style: "destructive" },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>💰 Organização Financeira</Text>
            {user && <Text style={styles.userText}>Olá, {user.name || user.email}!</Text>}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.connectionIndicator}>
          <View style={[styles.connectionDot, { backgroundColor: connectionStatus ? Colors.success : Colors.error }]} />
          <Text style={styles.connectionText}>
            {connectionStatus === null ? "Verificando..." : connectionStatus ? "Conectado" : "Desconectado"}
          </Text>
        </View>
      </View>

      {/* PWA Install Prompt - só aparece na versão web */}
      <PWAInstallPrompt />

      {/* Form */}
      <TransactionForm />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.surface,
    marginBottom: 4,
  },
  userText: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  connectionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.9,
  },
})
