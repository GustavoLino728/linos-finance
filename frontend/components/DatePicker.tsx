"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface DatePickerProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  onClose: () => void
}

export default function DatePicker({ selectedDate, onDateSelect, onClose }: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate))

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = newDate.toISOString().split("T")[0]
    onDateSelect(dateString)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const selectedDay = new Date(selectedDate).getDate()
  const isSelectedMonth =
    new Date(selectedDate).getMonth() === currentDate.getMonth() &&
    new Date(selectedDate).getFullYear() === currentDate.getFullYear()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Selecionar Data</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header do calendário */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h4 className="font-semibold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-text-secondary p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => day && handleDateClick(day)}
              disabled={!day}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${!day ? "invisible" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                ${day && isSelectedMonth && day === selectedDay ? "bg-primary text-white" : ""}
              `}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={() => onDateSelect(new Date().toISOString().split("T")[0])} className="btn-secondary mr-2">
            Hoje
          </button>
        </div>
      </div>
    </div>
  )
}
