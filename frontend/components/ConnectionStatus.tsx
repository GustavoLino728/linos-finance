"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Colors } from "../constants/Colors"
import { ApiService } from "../services/api"
import { ENV } from "../config/environment"

export default function ConnectionStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    latency?: number
    environment: string
    lastCheck: Date
  }>({
    connected: false,
    environment: ENV.ENVIRONMENT,
    lastCheck: new Date(),
  })

  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    const startTime = Date.now()

    try {
      const healthCheck = await ApiService.healthCheck()

      setStatus({
        connected: healthCheck.status === "healthy",
        latency: healthCheck.latency,
        environment: ENV.ENVIRONMENT,
        lastCheck: new Date(),
      })
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        connected: false,
        lastCheck: new Date(),
      }))
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()

    // Verificar conexão a cada 30 segundos em produção
    const interval = setInterval(checkConnection, ENV.ENVIRONMENT === "production" ? 30000 : 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (isChecking) return Colors.warning
    return status.connected ? Colors.success : Colors.error
  }

  const getStatusText = () => {
    if (isChecking) return "Verificando..."

    if (status.connected) {
      const latencyText = status.latency ? ` (${status.latency}ms)` : ""
      return `Conectado${latencyText}`
    }

    return "Desconectado"
  }

  return (
    <TouchableOpacity style={styles.container} onPress={checkConnection} disabled={isChecking}>
      <View style={styles.content}>
        <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.environmentText}>{status.environment.toUpperCase()}</Text>
      </View>
      <Text style={styles.lastCheck}>Última verificação: {status.lastCheck.toLocaleTimeString()}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    margin: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
    marginRight: 8,
  },
  environmentText: {
    fontSize: 10,
    color: Colors.textSecondary,
    backgroundColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "bold",
  },
  lastCheck: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
  },
})
