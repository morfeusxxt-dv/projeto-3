"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Settings } from 'lucide-react';

const WhatsappAI = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Integração WhatsApp AI</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" /> Status da Integração
          </CardTitle>
          <CardDescription>
            Gerencie a conexão do seu WhatsApp e as configurações da inteligência artificial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            A integração do WhatsApp com IA requer uma configuração de backend complexa, incluindo a API Oficial do WhatsApp Business e um serviço de IA (como OpenAI ou Google AI).
          </p>
          <p className="text-muted-foreground">
            Atualmente, esta funcionalidade é um placeholder. Para implementá-la, você precisará:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Obter acesso à API Oficial do WhatsApp Business (Meta Developer Account).</li>
            <li>Configurar um webhook para receber mensagens do WhatsApp.</li>
            <li>Desenvolver um serviço de backend para:
              <ul className="list-circle list-inside ml-4">
                <li>Receber mensagens do webhook.</li>
                <li>Processar mensagens com um modelo de IA.</li>
                <li>Enviar respostas de volta para o WhatsApp.</li>
              </ul>
            </li>
            <li>Gerenciar credenciais e tokens de API de forma segura no backend.</li>
          </ul>
          <Button disabled>
            <Settings className="mr-2 h-4 w-4" /> Configurar Integração (Em Breve)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversas Recentes</CardTitle>
          <CardDescription>
            Visualize e gerencie as interações da sua IA com os clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma conversa para exibir ainda.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsappAI;