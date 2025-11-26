"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  is_approved: boolean;
  is_admin: boolean;
  created_at: string;
}

const UserApprovalsPage = () => {
  const { user, loading, refreshUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && user?.profile?.is_admin) {
      fetchPendingUsers();
    } else if (!loading && !user?.profile?.is_admin) {
      // If not admin, redirect
      setPageLoading(false);
    }
  }, [loading, user?.profile?.is_admin]);

  const fetchPendingUsers = async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', false);

    if (error) {
      toast.error('Erro ao carregar usuários pendentes: ' + error.message);
      console.error('Error fetching pending users:', error.message);
    } else {
      setPendingUsers(data || []);
    }
    setPageLoading(false);
  };

  const handleApproveUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', userId);

    if (error) {
      toast.error('Erro ao aprovar usuário: ' + error.message);
      console.error('Error approving user:', error.message);
    } else {
      toast.success('Usuário aprovado com sucesso!');
      fetchPendingUsers(); // Refresh the list
      // If the approved user is the current user, refresh their session
      if (user?.id === userId) {
        refreshUser();
      }
    }
  };

  const handleRejectUser = async (userId: string) => {
    // For rejection, we can delete the user from auth.users, which will cascade delete the profile
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      toast.error('Erro ao rejeitar usuário: ' + authError.message);
      console.error('Error rejecting user:', authError.message);
    } else {
      toast.success('Usuário rejeitado e removido com sucesso!');
      fetchPendingUsers(); // Refresh the list
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user?.profile?.is_admin) {
    toast.error("Acesso negado. Você não tem permissão para acessar esta página.");
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Aprovações de Usuários</h1>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-muted-foreground">Nenhum usuário aguardando aprovação.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Registro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((pendingUser) => (
                    <TableRow key={pendingUser.id}>
                      <TableCell className="font-medium">{pendingUser.email}</TableCell>
                      <TableCell>{new Date(pendingUser.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveUser(pendingUser.id)}
                        >
                          <Check className="h-4 w-4 mr-2" /> Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectUser(pendingUser.id)}
                        >
                          <X className="h-4 w-4 mr-2" /> Rejeitar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserApprovalsPage;