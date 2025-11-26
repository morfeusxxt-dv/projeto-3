-- Tabela de Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Pagamentos
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- 'pendente', 'pago', 'cancelado'
  data_pagamento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Mensagens
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  enviada_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(50) NOT NULL DEFAULT 'enviada' -- 'enviada', 'lida', 'erro'
);

-- Opcional: Adicionar alguns dados de exemplo para testar o dashboard
INSERT INTO public.clientes (nome, email, telefone) VALUES
('Cliente Exemplo 1', 'cliente1@example.com', '11987654321'),
('Cliente Exemplo 2', 'cliente2@example.com', '11998765432');

INSERT INTO public.pagamentos (cliente_id, valor, status, data_pagamento) VALUES
((SELECT id FROM public.clientes WHERE email = 'cliente1@example.com'), 150.00, 'pago', CURRENT_DATE),
((SELECT id FROM public.clientes WHERE email = 'cliente2@example.com'), 200.00, 'pago', CURRENT_DATE - INTERVAL '1 month');

INSERT INTO public.mensagens (cliente_id, conteudo) VALUES
((SELECT id FROM public.clientes WHERE email = 'cliente1@example.com'), 'Olá, tudo bem?'),
((SELECT id FROM public.clientes WHERE email = 'cliente1@example.com'), 'Mensagem de teste.'),
((SELECT id FROM public.clientes WHERE email = 'cliente2@example.com'), 'Outra mensagem de teste.');