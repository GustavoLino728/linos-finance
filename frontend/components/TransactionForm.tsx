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
  Modal,
  FlatList,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
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

// Componente Picker Customizado Integrado
interface PickerModalProps {
  visible: boolean
  title: string
  items: string[]
  selectedValue: string
  onSelect: (value: string) => void
  onClose: () => void
}

function PickerModal({ visible, title, items, selectedValue, onSelect, onClose }: PickerModalProps) {
  const handleSelect = (value: string) => {
    onSelect(value)
    onClose()
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, selectedValue === item && styles.selectedOption]}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.optionText, selectedValue === item && styles.selectedOptionText]}>{item}</Text>
                {selectedValue === item && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
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

  // Estados para os modais dos pickers
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [showMetodoModal, setShowMetodoModal] = useState(false)

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

      console.log("Enviando transação:", transaction)
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
              <TouchableOpacity style={styles.pickerInput} onPress={() => setShowCategoriaModal(true)}>
                <Text style={styles.pickerText}>{formData.categoria}</Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Método de Pagamento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Método de Pagamento</Text>
              <TouchableOpacity style={styles.pickerInput} onPress={() => setShowMetodoModal(true)}>
                <Text style={styles.pickerText}>{formData.metodo_pagamento}</Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
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

      {/* Modais dos Pickers */}
      <PickerModal
        visible={showCategoriaModal}
        title="Selecionar Categoria"
        items={categorias}
        selectedValue={formData.categoria}
        onSelect={(value) => setFormData({ ...formData, categoria: value })}
        onClose={() => setShowCategoriaModal(false)}
      />

      <PickerModal
        visible={showMetodoModal}
        title="Selecionar Método de Pagamento"
        items={metodosPagamento}
        selectedValue={formData.metodo_pagamento}
        onSelect={(value) => setFormData({ ...formData, metodo_pagamento: value })}
        onClose={() => setShowMetodoModal(false)}
      />
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
  // Estilos do Picker Customizado
  pickerInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: "90%",
    maxHeight: "70%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary + "20",
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "bold",
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
