import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Bem-vindo ao seu App!</h1>
        <p className="text-xl text-muted-foreground max-w-prose mx-auto">
          Este é o ponto de partida para o seu incrível projeto. Clique no botão abaixo para ir ao Dashboard.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/dashboard">Ir para o Dashboard</Link>
        </Button>
      </div>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;