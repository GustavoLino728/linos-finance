"use client"

import { X } from "lucide-react"

interface CategoryModalProps {
  selectedCategory: string
  onCategorySelect: (category: string) => void
  onClose: () => void
}

const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Roupas",
  "Tecnologia",
  "Serviços",
  "Outros",
]

export default function CategoryModal({ selectedCategory, onCategorySelect, onClose }: CategoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Selecionar Categoria</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`
                w-full text-left p-3 rounded-lg transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${
                  selectedCategory === category
                    ? "bg-primary/10 text-primary border border-primary"
                    : "border border-transparent"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
