"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  created_at: string;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar clientes: ' + error.message);
      console.error('Error fetching clients:', error.message);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const handleAddClient = async () => {
    if (!clientName) {
      toast.error('O nome do cliente é obrigatório.');
      return;
    }

    setLoading(true);
    const { data: _data, error } = await supabase // Corrigido: renomeado 'data' para '_data'
      .from('clientes')
      .insert([{ nome: clientName, email: clientEmail || null, telefone: clientPhone || null }])
      .select();

    if (error) {
      toast.error('Erro ao adicionar cliente: ' + error.message);
      console.error('Error adding client:', error.message);
    } else {
      toast.success('Cliente adicionado com sucesso!');
      fetchClients();
      setIsDialogOpen(false);
      resetForm();
    }
    setLoading(false);
  };

  const handleUpdateClient = async () => {
    if (!currentClient?.id || !clientName) {
      toast.error('Dados do cliente inválidos.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('clientes')
      .update({ nome: clientName, email: clientEmail || null, telefone: clientPhone || null })
      .eq('id', currentClient.id);

    if (error) {
      toast.error('Erro ao atualizar cliente: ' + error.message);
      console.error('Error updating client:', error.message);
    } else {
      toast.success('Cliente atualizado com sucesso!');
      fetchClients();
      setIsDialogOpen(false);
      resetForm();
    }
    setLoading(false);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clientId);

    if (error) {
      toast.error('Erro ao excluir cliente: ' + error.message);
      console.error('Error deleting client:', error.message);
    } else {
      toast.success('Cliente excluído com sucesso!');
      fetchClients();
    }
    setLoading(false);
  };

  const openEditDialog = (client: Client) => {
    setCurrentClient(client);
    setClientName(client.nome);
    setClientEmail(client.email || '');
    setClientPhone(client.telefone || '');
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentClient(null);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gestão de Clientes</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Clientes</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={currentClient ? handleUpdateClient : handleAddClient} disabled={loading}>
                  {loading ? 'Salvando...' : (currentClient ? 'Salvar Alterações' : 'Adicionar')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando clientes...</p>
          ) : clients.length === 0 ? (
            <p className="text-muted-foreground">Nenhum cliente cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.nome}</TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>{client.telefone || '-'}</TableCell>
                      <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(client.id)}>
                          <Trash2 className="h-4 w-4" />
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

export default ClientsPage;