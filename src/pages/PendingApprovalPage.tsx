"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MadeWithDyad } from '@/components/made-with-dyad';

const PendingApprovalPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Conta Pendente de Aprovação</CardTitle>
          <CardDescription>
            Sua conta foi criada com sucesso e está aguardando a aprovação de um administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Você será notificado assim que sua conta for aprovada.</p>
          <Button onClick={handleLogout} className="w-full">
            Sair
          </Button>
        </CardContent>
      </Card>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default PendingApprovalPage;