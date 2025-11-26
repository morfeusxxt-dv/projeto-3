-- Habilitar RLS para as tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Criar políticas de leitura para usuários autenticados (para o dashboard)
-- Clientes
DROP POLICY IF EXISTS "Allow authenticated read access to clientes" ON public.clientes;
CREATE POLICY "Allow authenticated read access to clientes" ON public.clientes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Pagamentos
DROP POLICY IF EXISTS "Allow authenticated read access to pagamentos" ON public.pagamentos;
CREATE POLICY "Allow authenticated read access to pagamentos" ON public.pagamentos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Mensagens
DROP POLICY IF EXISTS "Allow authenticated read access to mensagens" ON public.mensagens;
CREATE POLICY "Allow authenticated read access to mensagens" ON public.mensagens
  FOR SELECT USING (auth.role() = 'authenticated');