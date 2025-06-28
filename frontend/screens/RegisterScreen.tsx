"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Colors } from "../constants/Colors"
import { AuthService } from "../services/auth"

interface RegisterScreenProps {
  onRegisterSuccess: () => void
  onNavigateToLogin: () => void
}

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sheet_url: "",
  })
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    // Validações
    if (!formData.name.trim()) {
      Alert.alert("Erro", "Por favor, informe seu nome.")
      return
    }

    if (!formData.email.trim()) {
      Alert.alert("Erro", "Por favor, informe seu email.")
      return
    }

    if (!formData.email.includes("@")) {
      Alert.alert("Erro", "Por favor, informe um email válido.")
      return
    }

    if (!formData.sheet_url.trim()) {
      Alert.alert("Erro", "Por favor, informe o link da planilha.")
      return
    }

    if (!formData.sheet_url.includes("docs.google.com/spreadsheets")) {
      Alert.alert("Erro", "Por favor, informe um link válido do Google Sheets.")
      return
    }

    setLoading(true)

    try {
      await AuthService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        sheet_url: formData.sheet_url.trim(),
      })

      Alert.alert("Sucesso", "Cadastro realizado com sucesso! Agora você pode fazer login.", [
        { text: "OK", onPress: onRegisterSuccess },
      ])
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao fazer cadastro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📝</Text>
            <Text style={styles.headerSubtitle}>Criar Conta</Text>
            <Text style={styles.headerDescription}>Preencha os dados para começar</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Seu nome completo"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="seu@email.com"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Link da Planilha Google Sheets</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.sheet_url}
                onChangeText={(text) => setFormData({ ...formData, sheet_url: text })}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.helpText}>💡 Cole aqui o link completo da sua planilha do Google Sheets</Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>{loading ? "Cadastrando..." : "Criar Conta"}</Text>
            </TouchableOpacity>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.loginLink}>Faça login aqui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 64,
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  headerDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  helpText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: "italic",
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  registerButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: "600",
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    flexWrap: "wrap",
  },
  loginText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
})
