"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Stats {
  totalClientes: number;
  receitaMensal: number;
  mensagensHoje: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalClientes: 0,
    receitaMensal: 0,
    mensagensHoje: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Total de Clientes
      const { count: totalClientes, error: clientesError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      if (clientesError) throw clientesError;

      // Receita do Mês (adaptado para o frontend)
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('valor')
        .eq('status', 'pago')
        .gte('data_pagamento', inicioMes.toISOString().split('T')[0]);

      if (pagamentosError) throw pagamentosError;

      const receitaMensal = pagamentos?.reduce((acc, curr) => acc + curr.valor, 0) || 0;

      // Mensagens Hoje (adaptado para o frontend)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const { count: mensagensHoje, error: mensagensError } = await supabase
        .from('mensagens')
        .select('*', { count: 'exact', head: true })
        .gte('enviada_em', hoje.toISOString());

      if (mensagensError) throw mensagensError;

      setStats({
        totalClientes: totalClientes || 0,
        receitaMensal: receitaMensal || 0,
        mensagensHoje: mensagensHoje || 0
      });
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error.message);
      toast.error('Erro ao carregar dados do dashboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Carregando..." : stats.totalClientes}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Carregando..." : `R$ ${stats.receitaMensal.toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Carregando..." : stats.mensagensHoje}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Atividades Recentes</h2>
          <Button asChild variant="outline">
            <Link to="/activities">Ver Tudo</Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground">Nenhuma atividade recente para exibir.</p>
      </div>
    </div>
  );
};

export default Dashboard;