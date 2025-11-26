"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let result;

    if (type === 'login') {
      result = await signIn(email, password);
    } else {
      result = await signUp(email, password);
    }

    setLoading(false);

    if (result.success) {
      if (type === 'login') {
        navigate('/dashboard');
      } else {
        // For registration, user needs to verify email, so stay on login page or redirect to a message page
        navigate('/login');
      }
    } else {
      // Error message already handled by toast in AuthContext
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{type === 'login' ? 'Login' : 'Registrar'}</CardTitle>
        <CardDescription>
          {type === 'login' ? 'Entre com seu e-mail e senha para acessar sua conta.' : 'Crie uma nova conta para começar.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Carregando...' : (type === 'login' ? 'Entrar' : 'Registrar')}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {type === 'login' ? (
            <>
              Não tem uma conta?{' '}
              <Button variant="link" onClick={() => navigate('/register')} className="p-0 h-auto">
                Cadastre-se
              </Button>
            </>
          ) : (
            <>
              Já tem uma conta?{' '}
              <Button variant="link" onClick={() => navigate('/login')} className="p-0 h-auto">
                Entrar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;