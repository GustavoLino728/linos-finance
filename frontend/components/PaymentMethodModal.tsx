"use client"

import { X, CreditCard, Banknote, Smartphone, Building } from "lucide-react"

interface PaymentMethodModalProps {
  selectedMethod: string
  onMethodSelect: (method: string) => void
  onClose: () => void
}

const paymentMethods = [
  { name: "Dinheiro", icon: Banknote },
  { name: "Cartão de Débito", icon: CreditCard },
  { name: "Cartão de Crédito", icon: CreditCard },
  { name: "PIX", icon: Smartphone },
  { name: "Transferência", icon: Building },
]

export default function PaymentMethodModal({ selectedMethod, onMethodSelect, onClose }: PaymentMethodModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Método de Pagamento</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <button
                key={method.name}
                onClick={() => onMethodSelect(method.name)}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${
                    selectedMethod === method.name
                      ? "bg-primary/10 text-primary border border-primary"
                      : "border border-transparent"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{method.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
