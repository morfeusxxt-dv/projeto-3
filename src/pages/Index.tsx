import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Carregando...</p>
      </div>
    );
  }

  if (user) {
    // If user is logged in, check approval status
    if (user.profile?.is_approved) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-6">
        {/* Removido: Título e descrição */}
        <div className="flex gap-4 justify-center mt-6">
          <Button asChild size="lg">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/register">Registrar</Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;