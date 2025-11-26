"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  Stack,
  Group,
  Alert,
  Code,
  Paper,
  Badge,
  Loader,
  Title,
} from "@mantine/core";
import { Send, Check, Clock, X, AlertCircle } from "lucide-react";
import { apiRequest } from "../utils/api";

interface TelegramStatus {
  connected: boolean;
  telegram_id?: string;
  first_name?: string;
  username?: string;
  synced_at?: string;
}

export default function TelegramSync() {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar status da integração
  useEffect(() => {
    loadStatus();
  }, []);

  // Timer de expiração
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      
      if (diff <= 0) {
        setSyncCode(null);
        setExpiresAt(null);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest("/integrations/telegram/status", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Erro ao carregar status:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiRequest("/integrations/telegram/generate-code", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setSyncCode(data.code);
        setExpiresAt(new Date(data.expires_at));
        setTimeRemaining(data.expires_in);
      } else {
        const errorData = await response.json();
        setError(errorData.erro || "Erro ao gerar código");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading && !syncCode) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="center" py="xl">
          <Loader size="md" />
          <Text size="sm" c="dimmed">Carregando...</Text>
        </Group>
      </Card>
    );
  }

  // Usuário já conectado
  if (status?.connected) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <Send size={24} color="var(--mantine-color-blue-6)" />
              <Title order={4}>Telegram Conectado</Title>
            </Group>
            <Badge color="green" variant="light" leftSection={<Check size={14} />}>
              Ativo
            </Badge>
          </Group>

          <Paper p="md" withBorder bg="var(--mantine-color-gray-0)">
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="sm" fw={500}>Nome:</Text>
                <Text size="sm">{status.first_name}</Text>
              </Group>
              {status.username && (
                <Group gap="xs">
                  <Text size="sm" fw={500}>Usuário:</Text>
                  <Text size="sm">@{status.username}</Text>
                </Group>
              )}
              <Group gap="xs">
                <Text size="sm" fw={500}>ID:</Text>
                <Text size="sm" c="dimmed">{status.telegram_id}</Text>
              </Group>
            </Stack>
          </Paper>

          <Alert color="blue" variant="light" title="Integração ativa">
            Você pode enviar mensagens e áudios para o bot do Telegram para registrar
            transações automaticamente.
          </Alert>

          <Button
            variant="outline"
            color="red"
            onClick={() => {
              // Implementar desconexão se necessário
              alert("Funcionalidade de desconexão em desenvolvimento");
            }}
          >
            Desconectar Telegram
          </Button>
        </Stack>
      </Card>
    );
  }

  // Código gerado - aguardando sincronização
  if (syncCode) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <Send size={24} color="var(--mantine-color-blue-6)" />
              <Title order={4}>Sincronizar Telegram</Title>
            </Group>
            <Badge
              color={timeRemaining < 60 ? "red" : "blue"}
              variant="light"
              leftSection={<Clock size={14} />}
            >
              {formatTime(timeRemaining)}
            </Badge>
          </Group>

          <Alert color="blue" title="Código gerado!" variant="light">
            Envie o comando abaixo no chat com o bot do Telegram:
          </Alert>

          <Paper p="lg" withBorder bg="var(--mantine-color-gray-1)" style={{ textAlign: "center" }}>
            <Code size="xl" fw={700} style={{ fontSize: "1.5rem" }}>
              /sincronizar {syncCode}
            </Code>
          </Paper>

          <Alert color="orange" variant="light" icon={<Clock size={16} />}>
            Este código expira em <strong>{formatTime(timeRemaining)}</strong>. 
            Após sincronizar, volte aqui para confirmar a conexão.
          </Alert>

          <Group grow>
            <Button
              variant="light"
              onClick={loadStatus}
              loading={loading}
            >
              Verificar conexão
            </Button>
            <Button
              variant="outline"
              color="red"
              onClick={() => {
                setSyncCode(null);
                setExpiresAt(null);
              }}
              leftSection={<X size={16} />}
            >
              Cancelar
            </Button>
          </Group>
        </Stack>
      </Card>
    );
  }

  // Tela inicial - gerar código
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          <Send size={24} color="var(--mantine-color-blue-6)" />
          <Title order={4}>Conectar Telegram</Title>
        </Group>

        <Text size="sm" c="dimmed">
          Conecte sua conta do Telegram para enviar transações via mensagens e áudios
          diretamente pelo bot.
        </Text>

        {error && (
          <Alert color="red" variant="light" title="Erro" icon={<AlertCircle size={16} />}>
            {error}
          </Alert>
        )}

        <Alert color="blue" variant="light" title="Como funciona?">
          <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
            <li>Clique em "Gerar código de sincronização"</li>
            <li>Copie o código gerado</li>
            <li>Abra o bot do Telegram</li>
            <li>Envie: <Code>/sincronizar SEU_CODIGO</Code></li>
            <li>Pronto! Você está conectado 🎉</li>
          </ol>
        </Alert>

        <Button
          fullWidth
          leftSection={<Send size={20} />}
          onClick={generateCode}
          loading={loading}
          size="md"
        >
          Gerar código de sincronização
        </Button>
      </Stack>
    </Card>
  );
}