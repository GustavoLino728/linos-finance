"use client"

import Header from "@/components/Header"
import { TextInput, Stack, Button, Text, Alert } from '@mantine/core';
import { MoveRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from "react";
import { apiRequest } from "@/utils/api";
import { notifications } from '@mantine/notifications';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.erro || 'Erro ao enviar email');
      }

      setSuccess(true);
      notifications.show({
        title: 'Email enviado!',
        message: 'Verifique sua caixa de entrada para redefinir sua senha',
        color: 'green',
        icon: <CheckCircle size={18} />,
      });
      
      setEmail('');
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao enviar email');
      
      notifications.show({
        title: 'Erro',
        message: 'Não foi possível enviar o email de recuperação',
        color: 'red',
        icon: <AlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Text size="xl" fw={600} style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
            Esqueceu sua senha?
          </Text>
          
          <Text size="sm" c="dimmed" style={{ textAlign: 'center', marginBottom: '16px' }}>
            Insira seu email abaixo e enviaremos um link para redefinir sua senha
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

          {success && (
            <Alert 
              icon={<CheckCircle size={16} />} 
              title="Email enviado!" 
              color="green"
              style={{ width: '100%' }}
            >
              Caso tenha sido um email válido, um email terá sido enviado a você . O link expira em 1 hora
            </Alert>
          )}

          <TextInput 
            label="Email" 
            placeholder="seu@email.com" 
            value={email} 
            onChange={(event) => setEmail(event.currentTarget.value)}
            style={{ width: '100%' }}
            size="md"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleResetPassword();
              }
            }}
          />

          <Button 
            rightSection={<MoveRight size={14} />}
            onClick={handleResetPassword}
            loading={loading}
            fullWidth
            size="md"
            style={{ marginTop: '8px' }}
          >
            Enviar link de recuperação
          </Button>

          <Text size="sm" c="dimmed" style={{ marginTop: '16px' }}>
            Lembrou sua senha?{' '}
            <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Fazer login
            </a>
          </Text>
        </Stack>
      </div>
    </div>
  );
}
