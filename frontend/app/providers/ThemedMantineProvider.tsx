"use client";

import React from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BalanceProvider } from "@/contexts/BalanceContext";

export default function ThemedMantineProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme(); // client hook

  return (
    <MantineProvider
      defaultColorScheme={theme}
      forceColorScheme={theme}
      theme={{
        components: {
          PasswordInput: {
            styles: {
              input: {
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                caretColor: "var(--text-primary)",
              },
              visibilityToggle: { color: "var(--text-secondary)" },
            },
          },
          TextInput: {
            styles: {
              input: {
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                caretColor: "var(--text-primary)",
              },
            },
          },
          Select: {
            styles: {
              input: {
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              },
              dropdown: {
                background: "var(--card-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              },
            },
          },
        },
      }}
    >
      <Notifications position="top-right" />
      <AuthProvider>
        <BalanceProvider>{children}</BalanceProvider>
      </AuthProvider>
    </MantineProvider>
  );
}