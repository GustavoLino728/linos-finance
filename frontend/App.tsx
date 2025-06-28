"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet } from "react-native"
import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import HomeScreen from "./screens/HomeScreen"
import { AuthService } from "./services/auth"
import { Colors } from "./constants/Colors"

type Screen = "login" | "register" | "home"

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await AuthService.isLoggedIn()
      if (isLoggedIn) {
        setCurrentScreen("home")
      } else {
        setCurrentScreen("login")
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      setCurrentScreen("login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setCurrentScreen("home")
  }

  const handleRegisterSuccess = () => {
    setCurrentScreen("login")
  }

  const handleLogout = async () => {
    await AuthService.logout()
    setCurrentScreen("login")
  }

  if (isLoading) {
    return <View style={styles.container} />
  }

  switch (currentScreen) {
    case "login":
      return (
        <LoginScreen onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setCurrentScreen("register")} />
      )
    case "register":
      return (
        <RegisterScreen onRegisterSuccess={handleRegisterSuccess} onNavigateToLogin={() => setCurrentScreen("login")} />
      )
    case "home":
      return <HomeScreen onLogout={handleLogout} />
    default:
      return <View style={styles.container} />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
})
