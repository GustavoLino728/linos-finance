"use client"

import Header from "@/components/Header"
import { PasswordInput, Stack, Button, Text, Alert } from '@mantine/core';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && token) {
      setAccessToken(token);
    } else {
      setError('Link inválido ou expirado');
    }
  }, []);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          access_token: accessToken,
          password: password 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.erro || 'Erro ao atualizar senha');
      }

      notifications.show({
        title: 'Senha atualizada!',
        message: 'Sua senha foi alterada com sucesso',
        color: 'green',
        icon: <CheckCircle size={18} />,
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao atualizar senha');
      
      notifications.show({
        title: 'Erro',
        message: 'Não foi possível atualizar a senha',
        color: 'red',
        icon: <AlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken && !error) {
    return (
      <div className="page-background">
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Text>Carregando...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background">
      <Header />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        padding: '20px' 
      }}>
        <Stack 
          align="center" 
          justify="center" 
          gap="md"
          style={{ 
            maxWidth: '500px', 
            width: '100%',
            background: 'var(--card-bg)',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Lock size={48} color="var(--primary)" />
          
          <Text size="xl" fw={600} style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
            Redefinir Senha
          </Text>
          
          <Text size="sm" c="dimmed" style={{ textAlign: 'center', marginBottom: '16px' }}>
            Escolha uma nova senha segura para sua conta
          </Text>

          {error && (
            <Alert 
              icon={<AlertCircle size={16} />} 
              title="Erro" 
              color="red"
              style={{ width: '100%' }}
            >
              {error}
            </Alert>
          )}

          <PasswordInput 
            label="Nova Senha" 
            placeholder="Digite sua nova senha" 
            value={password} 
            onChange={(event) => setPassword(event.currentTarget.value)}
            style={{ width: '100%' }}
            size="md"
            disabled={loading || !accessToken}
          />

          <PasswordInput 
            label="Confirmar Senha" 
            placeholder="Digite novamente sua senha" 
            value={confirmPassword} 
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
            style={{ width: '100%' }}
            size="md"
            disabled={loading || !accessToken}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleUpdatePassword();
              }
            }}
          />

          <Button 
            onClick={handleUpdatePassword}
            loading={loading}
            fullWidth
            size="md"
            style={{ marginTop: '8px' }}
            disabled={!accessToken}
          >
            Redefinir Senha
          </Button>
        </Stack>
      </div>
    </div>
  );
}
