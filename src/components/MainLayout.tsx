"use client";

import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Home, Users, MessageSquare, DollarSign, LogOut, UserCheck, Bot } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MadeWithDyad } from './made-with-dyad';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MainLayout = () => {
  const { signOut, user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    const { success } = await signOut();
    if (success) {
      navigate('/login');
    }
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-2 p-4">
      <Button variant="ghost" className="justify-start" asChild>
        <Link to="/dashboard">
          <Home className="mr-2 h-4 w-4" /> Dashboard
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link to="/clients">
          <Users className="mr-2 h-4 w-4" /> Clientes
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link to="/messages">
          <MessageSquare className="mr-2 h-4 w-4" /> Mensagens
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link to="/payments">
          <DollarSign className="mr-2 h-4 w-4" /> Pagamentos
        </Link>
      </Button>
      {user?.profile?.is_admin && (
        <Button variant="ghost" className="justify-start" asChild>
          <Link to="/admin/user-approvals">
            <UserCheck className="mr-2 h-4 w-4" /> Aprovar Usuários
          </Link>
        </Button>
      )}
      <Button variant="ghost" className="justify-start" asChild>
        <Link to="/whatsapp-ai">
          <Bot className="mr-2 h-4 w-4" /> WhatsApp AI
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start text-red-500 hover:text-red-600" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Carregando layout...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Meu App</h2>
              </div>
              <div className="flex-grow">
                <NavLinks />
              </div>
              <MadeWithDyad />
            </div>
          </SheetContent>
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </Sheet>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
          <ResizablePanel defaultSize={18} minSize={15} maxSize={25}>
            <div className="flex flex-col h-full border-r bg-sidebar">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-sidebar-primary">Meu App</h2>
              </div>
              <div className="flex-grow">
                <NavLinks />
              </div>
              <MadeWithDyad />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={82}>
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default MainLayout;