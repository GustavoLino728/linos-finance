"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Animated,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import { Colors } from "../constants/Colors"
import type { TransactionFormData, Transaction } from "../types/Transaction"
import { ApiService } from "../services/api"

// Componente do Toggle Arrastável
interface SliderToggleProps {
  value: "entrada" | "saida"
  onValueChange: (value: "entrada" | "saida") => void
}

function SliderToggle({ value, onValueChange }: SliderToggleProps) {
  const translateX = new Animated.Value(value === "entrada" ? 0 : 150)

  const handleToggle = () => {
    const newValue = value === "entrada" ? "saida" : "entrada"
    onValueChange(newValue)

    Animated.spring(translateX, {
      toValue: newValue === "entrada" ? 0 : 150,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start()
  }

  return (
    <View style={styles.sliderContainer}>
      <TouchableOpacity style={styles.sliderTrack} onPress={handleToggle}>
        <Animated.View
          style={[
            styles.sliderThumb,
            {
              backgroundColor: value === "entrada" ? Colors.income : Colors.expense,
              transform: [{ translateX }],
            },
          ]}
        >
          <Text style={styles.sliderThumbText}>{value === "entrada" ? "💰" : "💸"}</Text>
        </Animated.View>

        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, value === "entrada" && styles.sliderLabelActive]}>Entrada</Text>
          <Text style={[styles.sliderLabel, value === "saida" && styles.sliderLabelActive]}>Saída</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default function TransactionForm() {
  const [formData, setFormData] = useState<TransactionFormData>({
    tipo: "entrada",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoria: "Alimentação",
    metodo_pagamento: "Dinheiro",
  })

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  // Categorias baseadas no seu backend
  const categorias = ["Alimentação", "Transporte", "Lazer", "Saúde", "Educação", "Casa", "Roupas", "Itens", "Outros"]

  const metodosPagamento = ["Dinheiro", "Cartão de Débito", "Cartão de Crédito", "PIX", "Transferência", "Outros"]

  const handleSubmit = async () => {
    // Validações
    if (!formData.descricao.trim()) {
      Alert.alert("Erro", "Por favor, informe a descrição.")
      return
    }

    if (!formData.valor.trim()) {
      Alert.alert("Erro", "Por favor, informe o valor.")
      return
    }

    const valor = Number.parseFloat(formData.valor.replace(",", "."))
    if (isNaN(valor) || valor <= 0) {
      Alert.alert("Erro", "Por favor, insira um valor válido.")
      return
    }

    setLoading(true)

    try {
      const transaction: Transaction = {
        tipo: formData.tipo,
        descricao: formData.descricao.trim(),
        valor: valor,
        data: formData.data,
        ...(formData.tipo === "saida" && {
          categoria: formData.categoria,
          metodo_pagamento: formData.metodo_pagamento,
        }),
      }

      const result = await ApiService.addLancamento(transaction)

      if (result.success) {
        Alert.alert("Sucesso", result.message)
        // Reset form
        setFormData({
          tipo: "entrada",
          descricao: "",
          valor: "",
          data: new Date().toISOString().split("T")[0],
          categoria: "Alimentação",
          metodo_pagamento: "Dinheiro",
        })
      } else {
        Alert.alert("Erro", result.message)
      }
    } catch (error) {
      Alert.alert("Erro", "Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios")
    if (selectedDate) {
      setFormData({
        ...formData,
        data: selectedDate.toISOString().split("T")[0],
      })
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💰 Novo Lançamento</Text>
          <Text style={styles.headerSubtitle}>Registre suas transações financeiras</Text>
        </View>

        {/* Slider Toggle para Tipo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de Transação</Text>
          <SliderToggle value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })} />
        </View>

        {/* Descrição */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={formData.descricao}
            onChangeText={(text) => setFormData({ ...formData, descricao: text })}
            placeholder="Ex: Almoço no restaurante"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Valor */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            value={formData.valor}
            onChangeText={(text) => setFormData({ ...formData, valor: text })}
            placeholder="0,00"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* Data */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{new Date(formData.data).toLocaleDateString("pt-BR")}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={new Date(formData.data)} mode="date" display="default" onChange={onDateChange} />
          )}
        </View>

        {/* Campos específicos para Saída */}
        {formData.tipo === "saida" && (
          <>
            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  style={styles.picker}
                >
                  {categorias.map((categoria) => (
                    <Picker.Item key={categoria} label={categoria} value={categoria} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Método de Pagamento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Método de Pagamento</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.metodo_pagamento}
                  onValueChange={(value) => setFormData({ ...formData, metodo_pagamento: value })}
                  style={styles.picker}
                >
                  {metodosPagamento.map((metodo) => (
                    <Picker.Item key={metodo} label={metodo} value={metodo} />
                  ))}
                </Picker>
              </View>
            </View>
          </>
        )}

        {/* Botão de Salvar */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>{loading ? "Salvando..." : "💾 Salvar Lançamento"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  form: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  picker: {
    height: 50,
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: "600",
  },
  // Estilos do Slider Toggle
  sliderContainer: {
    alignItems: "center",
  },
  sliderTrack: {
    width: 300,
    height: 60,
    backgroundColor: Colors.surface,
    borderRadius: 30,
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sliderThumb: {
    width: 150,
    height: 60,
    borderRadius: 30,
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sliderThumbText: {
    fontSize: 24,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 20,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  sliderLabelActive: {
    color: Colors.surface,
  },
})
