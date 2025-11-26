"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConfirmEmail() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/';

        if (token_hash && type === 'signup') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup',
          });

          if (error) throw error;
          
          setSuccess(true);
          // Redireciona após 3 segundos
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Erro ao confirmar email:', error);
        setError(error.message || 'Erro ao confirmar email');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Confirmando seu email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="p-6 bg-destructive/10 rounded-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro na Confirmação</h1>
          <p className="mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            Voltar para a Página Inicial
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="p-6 bg-green-50 rounded-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Email Confirmado!</h1>
          <p className="mb-6">Seu email foi confirmado com sucesso! Redirecionando para o login...</p>
          <Button onClick={() => router.push('/login')}>
            Ir para o Login
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
