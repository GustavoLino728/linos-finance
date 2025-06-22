"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Alert } from "react-native"
import TransactionForm from "../components/TransactionForm"
import { Colors } from "../constants/Colors"
import { ApiService } from "../services/api"

export default function HomeScreen() {
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)

  useEffect(() => {
    checkConnection()
  }, [])

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Organização Financeira</Text>
        <View style={styles.connectionIndicator}>
          <View style={[styles.connectionDot, { backgroundColor: connectionStatus ? Colors.success : Colors.error }]} />
          <Text style={styles.connectionText}>
            {connectionStatus === null ? "Verificando..." : connectionStatus ? "Conectado" : "Desconectado"}
          </Text>
        </View>
      </View>

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
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.surface,
    marginBottom: 8,
  },
  connectionIndicator: {
    flexDirection: "row",
    alignItems: "center",
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
