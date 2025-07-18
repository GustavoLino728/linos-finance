import type React from "react"
import styles from "./Card.module.css"

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => {
  return <div className={`${styles.header} ${className}`}>{children}</div>
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
  return <div className={`${styles.content} ${className}`}>{children}</div>
}
