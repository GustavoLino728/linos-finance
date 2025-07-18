"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styles from "./DropdownMenu.module.css"

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
}

interface DropdownMenuItemProps {
  onClick: () => void
  children: React.ReactNode
  variant?: "default" | "danger"
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, children, align = "right" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  return (
    <div className={styles.dropdown} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>

      {isOpen && (
        <div className={`${styles.menu} ${styles[align]}`} role="menu">
          {children}
        </div>
      )}
    </div>
  )
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ onClick, children, variant = "default" }) => {
  const handleClick = () => {
    onClick()
  }

  return (
    <button type="button" className={`${styles.item} ${styles[variant]}`} onClick={handleClick} role="menuitem">
      {children}
    </button>
  )
}
