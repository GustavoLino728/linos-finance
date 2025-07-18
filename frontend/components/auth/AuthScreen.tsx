"use client"

import type React from "react"
import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import styles from "./AuthScreen.module.css"

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className={styles.container}>
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onToggleMode={() => setIsLogin(true)} />
      )}
    </div>
  )
}
