# 📚 Documentação Completa da Implementação - Assistente Financeiro

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Script SQL Completo para Criação do Banco de Dados](#️-script-sql-completo-para-criação-do-banco-de-dados)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Dashboard - Interpretação e Processamento de Dados](#dashboard---interpretação-e-processamento-de-dados)
7. [Componentes Principais](#componentes-principais)
8. [Contextos e Estado Global](#contextos-e-estado-global)
9. [Autenticação e Segurança](#autenticação-e-segurança)
10. [Integrações Externas](#integrações-externas)
11. [Configuração e Deploy](#configuração-e-deploy)

---

## 🎯 Visão Geral

O Assistente Financeiro é uma aplicação React TypeScript que permite aos usuários gerenciar suas finanças através de um dashboard completo. Os dados são registrados via WhatsApp (através de integração com n8n) e visualizados em tempo real no dashboard web.

### Stack Tecnológica

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Estilização**: Tailwind CSS 3
- **Roteamento**: React Router DOM 7
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Orquestração**: n8n (webhooks para processamento de dados)

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
assistente-financeiro/
├── components/          # Componentes React reutilizáveis
│   ├── AppLayout.tsx    # Layout principal com navegação
│   └── ProtectedRoute.tsx # Rota protegida por autenticação
├── contexts/            # Contextos React (estado global)
│   ├── AuthContext.tsx   # Autenticação e sessão do usuário
│   └── ThemeContext.tsx # Gerenciamento de tema (dark/light)
├── pages/               # Páginas da aplicação
│   ├── LandingPage.tsx   # Página inicial (marketing)
│   ├── AuthPage.tsx      # Login/Registro
│   ├── DashboardPage.tsx # Dashboard principal (CORE)
│   ├── AccountPage.tsx   # Perfil do usuário
│   ├── LimitsPage.tsx    # Gestão de limites de gastos
│   └── SubscriptionPage.tsx # Status da assinatura
├── services/            # Serviços externos
│   └── supabase.ts      # Cliente Supabase configurado
├── src/                  # Assets estáticos
│   └── index.css        # Estilos globais (Tailwind)
├── App.tsx              # Componente raiz e roteamento
├── index.tsx            # Entry point da aplicação
└── package.json         # Dependências e scripts
```

---

## 💾 Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **profiles** (Perfis de Usuário)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE, -- Formato: 55 + DDD + número (ex: 553199766846)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos**:
- `id`: UUID do usuário (referência ao auth.users)
- `full_name`: Nome completo (opcional)
- `phone`: Telefone no formato internacional (55 + DDD + número, sem o 9 extra)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

**Políticas RLS**:
- Usuários só podem ver/editar seu próprio perfil

---

#### 2. **transactions** (Transações Financeiras)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Entrada', 'Saída')),
  categoria TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL CHECK (valor > 0),
  data TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, data DESC);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, categoria);
```

**Campos**:
- `id`: UUID único da transação
- `user_id`: Referência ao usuário
- `descricao`: Descrição da transação (ex: "Supermercado", "Salário")
- `tipo`: Tipo da transação - `'Entrada'` ou `'Saída'`
- `categoria`: Categoria da transação (ex: "Alimentação", "Transporte", "Lazer", etc.)
- `valor`: Valor numérico (sempre positivo, validado por CHECK)
- `data`: Data/hora da transação (TIMESTAMPTZ)
- `created_at`: Data de criação do registro
- `updated_at`: Data de atualização

**Categorias Disponíveis**:
```typescript
const CATEGORIES = [
  'Alimentação', 
  'Lazer', 
  'Impostos', 
  'Saúde', 
  'Transporte', 
  'Moradia', 
  'Educação', 
  'Outros'
];
```

**Políticas RLS**:
- Usuários só podem ver/editar suas próprias transações

---

#### 3. **limites_gastos** (Limites de Gastos por Categoria)

```sql
CREATE TABLE limites_gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Colunas dinâmicas por categoria (exemplos):
  alimentacao NUMERIC(10, 2) DEFAULT 0,
  lazer NUMERIC(10, 2) DEFAULT 0,
  impostos NUMERIC(10, 2) DEFAULT 0,
  saude NUMERIC(10, 2) DEFAULT 0,
  transporte NUMERIC(10, 2) DEFAULT 0,
  moradia NUMERIC(10, 2) DEFAULT 0,
  educacao NUMERIC(10, 2) DEFAULT 0,
  outros NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_limites_user ON limites_gastos(user_id);
```

**Estrutura**:
- Uma linha por usuário (`user_id` UNIQUE)
- Colunas por categoria (normalizadas: sem acentos, lowercase, snake_case)
- Valores em NUMERIC(10, 2) representando o limite máximo em R$

**Mapeamento de Categorias para Colunas**:
```typescript
// Normalização: "Alimentação" → "alimentacao"
const toSnake = (s: string) => 
  s.normalize('NFD')
   .replace(/\p{Diacritic}/gu, '')  // Remove acentos
   .toLowerCase()
   .replace(/[^a-z0-9]+/g, '_')      // Substitui não-alfanuméricos por _
   .replace(/^_|_$/g, '');           // Remove _ do início/fim
```

**Políticas RLS**:
- Usuários só podem ver/editar seus próprios limites

---

#### 4. **saldos_diarios** (Cálculo de Saldos Diários)

**Nota**: Esta tabela pode ser uma view ou ser calculada dinamicamente via webhook.

**Estrutura Esperada**:
```typescript
interface DailyBalance {
  data: string;        // Data no formato YYYY-MM-DD
  saldo: number;       // Saldo acumulado até aquela data
}
```

**Cálculo**:
- Ordena transações por data
- Calcula saldo acumulado: Entradas - Saídas
- Agrupa por dia

---

## 🛠️ Script SQL Completo para Criação do Banco de Dados

### Script Completo de Criação

Execute este script no SQL Editor do Supabase para criar toda a estrutura do banco de dados:

```sql
-- ============================================
-- SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS
-- Assistente Financeiro - Estrutura Completa
-- ============================================

-- ============================================
-- 1. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. TABELA: profiles (Perfis de Usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
    ON profiles FOR DELETE
    USING (auth.uid() = id);

-- ============================================
-- 3. TABELA: transactions (Transações Financeiras)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Entrada', 'Saída')),
    categoria TEXT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor > 0),
    data TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, categoria);
CREATE INDEX IF NOT EXISTS idx_transactions_data ON transactions(data DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tipo ON transactions(tipo);

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 4. TABELA: limites_gastos (Limites de Gastos por Categoria)
-- ============================================
CREATE TABLE IF NOT EXISTS limites_gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    alimentacao NUMERIC(10, 2) DEFAULT 0 CHECK (alimentacao >= 0),
    lazer NUMERIC(10, 2) DEFAULT 0 CHECK (lazer >= 0),
    impostos NUMERIC(10, 2) DEFAULT 0 CHECK (impostos >= 0),
    saude NUMERIC(10, 2) DEFAULT 0 CHECK (saude >= 0),
    transporte NUMERIC(10, 2) DEFAULT 0 CHECK (transporte >= 0),
    moradia NUMERIC(10, 2) DEFAULT 0 CHECK (moradia >= 0),
    educacao NUMERIC(10, 2) DEFAULT 0 CHECK (educacao >= 0),
    outros NUMERIC(10, 2) DEFAULT 0 CHECK (outros >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para limites_gastos
CREATE INDEX IF NOT EXISTS idx_limites_gastos_user_id ON limites_gastos(user_id);

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_limites_gastos_updated_at ON limites_gastos;
CREATE TRIGGER update_limites_gastos_updated_at
    BEFORE UPDATE ON limites_gastos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE limites_gastos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para limites_gastos
DROP POLICY IF EXISTS "Users can view own limits" ON limites_gastos;
CREATE POLICY "Users can view own limits"
    ON limites_gastos FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own limits" ON limites_gastos;
CREATE POLICY "Users can insert own limits"
    ON limites_gastos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own limits" ON limites_gastos;
CREATE POLICY "Users can update own limits"
    ON limites_gastos FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own limits" ON limites_gastos;
CREATE POLICY "Users can delete own limits"
    ON limites_gastos FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 5. FUNÇÃO: change_user_password (Trocar Senha)
-- ============================================
CREATE OR REPLACE FUNCTION change_user_password(current_password text, new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  user_email text;
BEGIN
  -- Pegar o ID do usuário autenticado
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Não autenticado');
  END IF;
  
  -- Pegar o email do usuário
  SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
  
  -- Atualizar a senha
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = current_user_id;
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true, 
    'message', 'Senha atualizada com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Erro ao atualizar senha: ' || SQLERRM
    );
END;
$$;

-- Dar permissão para usuários autenticados chamarem a função
GRANT EXECUTE ON FUNCTION change_user_password(text, text) TO authenticated;

-- ============================================
-- FIM DO SCRIPT DE CRIAÇÃO
-- ============================================
```

### Resumo da Estrutura Criada

**Tabelas**:
- ✅ `profiles` - Perfis de usuário
- ✅ `transactions` - Transações financeiras
- ✅ `limites_gastos` - Limites de gastos por categoria

**Funções**:
- ✅ `update_updated_at_column()` - Atualiza `updated_at` automaticamente
- ✅ `change_user_password()` - Troca senha do usuário

**Triggers**:
- ✅ `update_profiles_updated_at` - Atualiza `updated_at` em `profiles`
- ✅ `update_transactions_updated_at` - Atualiza `updated_at` em `transactions`
- ✅ `update_limites_gastos_updated_at` - Atualiza `updated_at` em `limites_gastos`

**Índices**:
- ✅ `profiles`: `id`, `phone`
- ✅ `transactions`: `user_id`, `user_id + data`, `user_id + categoria`, `data`, `tipo`
- ✅ `limites_gastos`: `user_id`

**Políticas RLS** (10 políticas no total):
- ✅ `profiles`: SELECT, INSERT, UPDATE, DELETE (4 políticas)
- ✅ `transactions`: SELECT, INSERT, UPDATE, DELETE (4 políticas)
- ✅ `limites_gastos`: SELECT, INSERT, UPDATE, DELETE (4 políticas)

### Verificação Pós-Criação

Execute o script `VERIFICAR_ESTRUTURA_BANCO.sql` para verificar se tudo foi criado corretamente.

### Observações Importantes

1. **RLS (Row Level Security)**: Todas as tabelas têm RLS habilitado. Usuários só podem acessar seus próprios dados.

2. **Constraints**:
   - `transactions.tipo`: Aceita apenas `'Entrada'` ou `'Saída'`
   - `transactions.valor`: Deve ser maior que 0
   - `limites_gastos.*`: Todos os valores devem ser >= 0
   - `profiles.phone`: UNIQUE (telefone único por usuário)
   - `limites_gastos.user_id`: UNIQUE (um limite por usuário)

3. **Foreign Keys**: Todas as tabelas referenciam `auth.users(id)` com `ON DELETE CASCADE` (quando usuário é deletado, seus dados são deletados automaticamente).

4. **Triggers**: Todos os `updated_at` são atualizados automaticamente quando um registro é modificado.

5. **Categorias Disponíveis**:
   - Alimentação
   - Lazer
   - Impostos
   - Saúde
   - Transporte
   - Moradia
   - Educação
   - Outros

---

## 🔄 Fluxo de Dados

### 1. Registro de Transação via WhatsApp

```
WhatsApp → n8n Webhook → Supabase (transactions)
                          ↓
                    Dashboard atualiza
```

**Fluxo Detalhado**:
1. Usuário envia mensagem via WhatsApp (texto, áudio ou imagem)
2. n8n processa a mensagem (transcrição, extração de dados via IA)
3. n8n salva transação no Supabase (`transactions`)
4. Dashboard busca transações via webhook n8n

### 2. Visualização no Dashboard

```
Dashboard → Webhook n8n → Supabase Query → Dashboard
```

**Webhook de Consulta**:
- **URL**: `https://n8n-n8n-start.kof6cn.easypanel.host/webhook/c45f6c27-0314-494f-aaa6-2990f3ee14aa`
- **Método**: GET
- **Parâmetros**:
  - `startDate`: Data inicial (formato: `YYYY-MM-DDTHH:mm:ss.SSS000-03:00`)
  - `endDate`: Data final (formato: `YYYY-MM-DDTHH:mm:ss.SSS000-03:00`)
  - `userId`: UUID do usuário
  - `category` (opcional): Categoria para filtrar

**Resposta Esperada**:
```json
{
  "transacoes": [
    {
      "id": "uuid",
      "descricao": "Supermercado",
      "tipo": "Saída",
      "categoria": "Alimentação",
      "valor": 54.90,
      "data": "2024-01-15T10:30:00Z"
    }
  ],
  "saldos_diarios": [
    {
      "data": "2024-01-15",
      "saldo": 1250.00
    }
  ]
}
```

### 3. Exclusão de Transações

```
Dashboard → Webhook n8n (DELETE) → Supabase Delete → Dashboard atualiza
```

**Webhook de Exclusão**:
- **URL**: `https://n8n-n8n-start.kof6cn.easypanel.host/webhook/cac5d2ea-fc98-490c-94ae-7a354e871c44`
- **Método**: POST
- **Body**:
```json
{
  "ids": ["uuid1", "uuid2", ...]
}
```

---

## 📊 Dashboard - Interpretação e Processamento de Dados

### Componente Principal: `DashboardPage.tsx`

### 1. Estados e Dados

```typescript
interface TransactionRecord {
  id: string;
  descricao: string;
  tipo: 'Entrada' | 'Saída';
  categoria: string;
  data: string;
  valor: number;
}

interface DailyBalance {
  data: string;
  saldo: number;
}

// Estados principais
const [records, setRecords] = useState<TransactionRecord[]>([]);
const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
const [totalIncome, setTotalIncome] = useState(0);
const [totalOutcome, setTotalOutcome] = useState(0);
const [balance, setBalance] = useState(0);
```

---

### 2. Busca de Dados (`handleGetRecords`)

**Processo**:
1. Validação de datas (inicial e final)
2. Formatação de datas para UTC-3 (Brasil)
3. Chamada ao webhook n8n com parâmetros
4. Sanitização dos dados recebidos
5. Ordenação por data (mais recente primeiro)
6. Cálculo de totais
7. Cache no localStorage

**Código Principal**:
```typescript
const formattedStartDate = `${startDate}T00:00:00.000000-03:00`;
const formattedEndDate = `${endDate}T23:59:59.999000-03:00`;
const baseUrl = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/c45f6c27-0314-494f-aaa6-2990f3ee14aa';
const params = new URLSearchParams({ 
  startDate: formattedStartDate, 
  endDate: formattedEndDate, 
  userId: user.id 
});
if (selectedCategory) {
  params.append('category', selectedCategory);
}

// Sanitização
const sanitizedTransactions = transactions.map(tx => ({ 
  ...tx, 
  valor: Number(tx.valor) || 0 
}));
sanitizedTransactions.sort((a, b) => 
  new Date(b.data).getTime() - new Date(a.data).getTime()
);
```

---

### 3. Cálculo de Totais

**Processo Automático** (via `useEffect`):

```typescript
useEffect(() => {
  // Entradas (tipo === 'Entrada')
  const income = records
    .filter((r) => r.tipo === 'Entrada')
    .reduce((sum: number, r) => sum + r.valor, 0);

  // Saídas (tipo === 'Saída')
  const outcome = records
    .filter((r) => r.tipo === 'Saída')
    .reduce((sum: number, r) => sum + r.valor, 0);
  
  setTotalIncome(income);
  setTotalOutcome(outcome);
  setBalance(income - outcome); // Saldo = Entradas - Saídas
}, [records]);
```

**Importante**: 
- `valor` é sempre tratado como número (sanitizado)
- Cálculos são feitos em tempo real conforme os registros mudam

---

### 4. Agrupamento por Categoria (Gráfico Donut)

**Processo** (`useMemo` para otimização):

```typescript
const spendingData = useMemo(() => {
  if (!records || totalOutcome === 0) return [];

  // Agrupa saídas por categoria
  const spendingByCategory = records
    .filter(r => r.tipo === 'Saída')
    .reduce((acc: Record<string, number>, record) => {
      const category = record.categoria || 'Outros';
      acc[category] = (acc[category] || 0) + record.valor;
      return acc;
    }, {} as Record<string, number>);

  // Cores para cada categoria
  const COLORS = [
    '#818cf8', '#34d399', '#fbbF24', 
    '#fb7185', '#a78bfa', '#2dd4bf', 
    '#38bdf8', '#22d3ee'
  ];

  // Transforma em array e ordena por valor
  return Object.entries(spendingByCategory)
    .map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);
}, [records, totalOutcome]);
```

**Resultado**:
- Array de objetos com `name`, `value`, `color`
- Ordenado por valor (maior primeiro)
- Usado no componente `SpendingDonutChart`

---

### 5. Gráfico de Evolução do Saldo

**Componente**: `DailyBalanceChart`

**Dados**:
- Recebe `dailyBalances` (array de `{ data, saldo }`)
- Ordena por data
- Calcula escala Y (min/max baseado nos valores)

**Processamento**:
```typescript
const maxBalance = Math.max(...data.map(d => d.saldo), 0);
const minBalance = Math.min(...data.map(d => d.saldo), 0);
const yMax = Math.max(Math.abs(maxBalance), Math.abs(minBalance)) * 1.1 || 10;
const yMin = -yMax;

// Escala Y
const yScale = (value: number) => {
  return CHART_HEIGHT - ((value - yMin) / (yMax - yMin)) * CHART_HEIGHT;
};
```

**Renderização**:
- Linha SVG conectando pontos
- Área preenchida com gradiente
- Linha zero (saldo = 0)
- Tooltip interativo ao passar o mouse

---

### 6. Busca e Filtragem

**Busca por Texto**:
```typescript
const filteredRecords = useMemo(() => {
  if (!normalizedQuery) return records;
  return records.filter((r) => {
    const parts: string[] = [
      r.descricao || '',
      r.categoria || '',
      r.tipo || '',
      formatDate(r.data, { day: '2-digit', month: '2-digit', year: 'numeric' }) || '',
      String(r.valor) || ''
    ].map((s) => s.toLowerCase());
    return parts.some((p) => p.includes(normalizedQuery));
  });
}, [records, normalizedQuery]);
```

**Filtros Disponíveis**:
- Data inicial e final
- Categoria (dropdown)
- Busca textual (descrição, categoria, tipo, data, valor)

---

### 7. Cache Local

**Estratégia**:
- Salva no `localStorage` após cada busca bem-sucedida
- Carrega automaticamente ao montar o componente
- Chave: `dashboard:lastQuery:${user.id}`

**Estrutura do Cache**:
```typescript
{
  startDate: string;
  endDate: string;
  selectedCategory: string;
  records: TransactionRecord[];
  dailyBalances: DailyBalance[];
  totalIncome: number;
  totalOutcome: number;
  balance: number;
  savedAt: number; // timestamp
}
```

---

## 🧩 Componentes Principais

### 1. `AppLayout.tsx`

**Responsabilidades**:
- Layout principal com header fixo
- Navegação desktop e mobile
- Menu dropdown com avatar do usuário
- Toggle de tema (dark/light)
- Logout

**Estrutura**:
```typescript
<header>
  <Logo />
  <DesktopMenu />
  <ThemeSwitcher />
  <MobileMenuButton />
</header>
<main>
  <Outlet /> {/* Páginas renderizadas aqui */}
</main>
```

---

### 2. `ProtectedRoute.tsx`

**Função**: Protege rotas que exigem autenticação

**Lógica**:
```typescript
if (loading) return <LoadingSpinner />;
if (user) return <Outlet />;
return <Navigate to="/auth" replace />;
```

---

### 3. `DashboardPage.tsx`

**Subcomponentes**:
- `DailyBalanceChart`: Gráfico de linha SVG
- `SpendingDonutChart`: Gráfico donut SVG

**Seções**:
1. Filtros (datas, categoria)
2. Cards de resumo (Entradas, Saídas, Saldo)
3. Lista de transações (com busca e seleção)
4. Gráficos (donut e linha)

---

## 🔐 Contextos e Estado Global

### 1. `AuthContext.tsx`

**Estado**:
```typescript
{
  session: Session | null;
  user: User | null;
  userProfile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}
```

**Funcionalidades**:
- Gerencia sessão do Supabase
- Listens para mudanças de autenticação (`onAuthStateChange`)
- Timeout de 5s para busca de perfil (evita travamento)
- Logout otimizado (limpa estado local primeiro)

---

### 2. `ThemeContext.tsx`

**Estado**:
```typescript
{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

**Persistência**:
- Salva no `localStorage`
- Aplica classe `dark` no `document.documentElement`
- Tema padrão: `dark`

---

## 🔒 Autenticação e Segurança

### Supabase Auth

**Configuração**:
```typescript
const supabaseUrl = 'https://wgtntctzljufpikogvur.supabase.co';
const supabaseAnonKey = 'eyJ...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Fluxo de Login**:
1. Usuário insere email/senha
2. `supabase.auth.signInWithPassword()`
3. Sessão salva automaticamente
4. Redireciona para `/dashboard`

**Row Level Security (RLS)**:
- Todas as tabelas têm políticas RLS ativadas
- Usuários só acessam seus próprios dados
- Políticas definidas no Supabase Dashboard

---

## 🔌 Integrações Externas

### 1. Webhooks n8n

**Consultar Transações**:
```
GET /webhook/c45f6c27-0314-494f-aaa6-2990f3ee14aa
?startDate=YYYY-MM-DDTHH:mm:ss.SSS000-03:00
&endDate=YYYY-MM-DDTHH:mm:ss.SSS000-03:00
&userId=uuid
&category=Alimentação (opcional)
```

**Excluir Transações**:
```
POST /webhook/cac5d2ea-fc98-490c-94ae-7a354e871c44
Body: { "ids": ["uuid1", "uuid2"] }
```

**Consultar Gastos por Categoria** (LimitsPage):
```
GET /webhook/2ce26a1e-dd57-4e9c-99fe-b7abd277dcde
?user_id=uuid
```

**Salvar Limites**:
```
POST /webhook/0aa3de2b-d7a9-461c-8f2e-b69fbd8215fb
Body: {
  "userId": "uuid",
  "limites": [
    { "categoria": "Alimentação", "valor": 500.00 },
    ...
  ]
}
```

**Consultar Status de Assinatura**:
```
GET /webhook/025e3469-c4cc-4963-ae2f-4fb16ac999e8
?user_id=uuid
```

---

### 2. Supabase

**Tabelas Acessadas**:
- `profiles` (via cliente Supabase)
- `limites_gastos` (via cliente Supabase)
- `transactions` (via webhook n8n, não diretamente)

**Queries Diretas**:
```typescript
// Buscar perfil
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Atualizar telefone
await supabase
  .from('profiles')
  .update({ phone: digits })
  .eq('id', user.id);

// Buscar limites
const { data } = await supabase
  .from('limites_gastos')
  .select('*')
  .eq('user_id', user.id)
  .maybeSingle();
```

---

## ⚙️ Configuração e Deploy

### Variáveis de Ambiente

**Desenvolvimento** (`.env.local`):
```env
VITE_SUPABASE_URL=https://wgtntctzljufpikogvur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Produção**: Configuradas no ambiente de deploy

---

### Scripts Disponíveis

```json
{
  "dev": "vite",              // Desenvolvimento
  "build": "vite build",       // Build de produção
  "preview": "vite preview"    // Preview do build
}
```

---

### Build Otimizado

**Configurações** (`vite.config.ts`):
- Minificação com Terser (2 passes)
- Code splitting granular
- Remoção de console.logs
- CSS code splitting
- Tree shaking automático

**Chunks Gerados**:
- `vendor-react.js`: React e React DOM
- `vendor-router.js`: React Router
- `vendor-supabase.js`: Supabase client
- `vendor-other.js`: Outras dependências
- `main.js`: Código da aplicação

---

### Deploy

**Opções**:
1. **Docker**: Imagem nginx servindo build estático
2. **Google Cloud Build**: Deploy automático via `cloudbuild.yaml`
3. **Vercel/Netlify**: Deploy direto do repositório

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📝 Formatação de Dados

### Moeda (BRL)

```typescript
const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};
// Exemplo: 1234.56 → "R$ 1.234,56"
```

### Data

```typescript
const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  const date = new Date(isDateOnly ? `${dateString}T00:00:00` : dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
  };
  return date.toLocaleDateString('pt-BR', { ...defaultOptions, ...options });
};
// Exemplo: "2024-01-15" → "15/01"
```

---

## 🎨 Temas e Estilização

### Tema Dark (Padrão)

**Classes Tailwind**:
- Backgrounds: `bg-gray-900`, `bg-gray-800`, `bg-gray-700`
- Textos: `text-gray-100`, `text-gray-200`, `text-gray-400`
- Borders: `border-gray-700`, `border-gray-600`

### Tema Light

**Classes Tailwind**:
- Backgrounds: `bg-gray-50`, `bg-white`
- Textos: `text-gray-900`, `text-gray-800`, `text-gray-600`
- Borders: `border-gray-200`, `border-gray-300`

**Aplicação**:
- Classes condicionais baseadas em `theme === 'dark'`
- Transições suaves entre temas

---

## 🔍 Validações e Tratamento de Erros

### Validações no Dashboard

1. **Datas**:
   - Data final não pode ser anterior à data inicial
   - Ambos os campos obrigatórios

2. **Valores**:
   - Sanitização: `Number(tx.valor) || 0`
   - Remoção de valores inválidos/NaN

3. **Telefone** (AccountPage):
   - Formato: 55 + DDD(2) + número(8) = 12 dígitos
   - Remove o 9 extra se presente
   - Validação de duplicidade (unique constraint)

---

## 📊 Resumo dos Fluxos Principais

### Fluxo Completo: Registro → Visualização

```
1. Usuário envia mensagem no WhatsApp
   ↓
2. n8n processa (transcrição, IA, extração)
   ↓
3. n8n salva em transactions (Supabase)
   ↓
4. Usuário acessa Dashboard
   ↓
5. Dashboard busca via webhook n8n
   ↓
6. Dados são sanitizados e ordenados
   ↓
7. Cálculos automáticos (totais, saldos)
   ↓
8. Renderização em gráficos e tabelas
   ↓
9. Cache salvo no localStorage
```

### Fluxo: Limites de Gastos

```
1. Usuário define limites (LimitsPage)
   ↓
2. Dados enviados via webhook n8n
   ↓
3. n8n salva em limites_gastos (Supabase)
   ↓
4. Dashboard busca gastos por categoria
   ↓
5. Comparação: Gasto vs Limite
   ↓
6. Visualização com barras de progresso
```

---

## 🚀 Próximos Passos (Sugestões)

1. **Otimizações**:
   - Paginação na lista de transações
   - Virtual scrolling para grandes volumes
   - Debounce na busca

2. **Funcionalidades**:
   - Exportação de relatórios (PDF/Excel)
   - Filtros salvos (favoritos)
   - Notificações push

3. **Performance**:
   - Service Worker para cache offline
   - Lazy loading de gráficos pesados
   - Compressão de dados no cache

---

## 📞 Suporte e Contato

Para dúvidas sobre a implementação, consulte:
- Código-fonte: `/pages/DashboardPage.tsx`
- Banco de dados: Supabase Dashboard
- Webhooks: n8n Dashboard

---

**Documentação criada em**: 2024
**Versão**: 1.0
**Última atualização**: Documentação completa da implementação (exceto reminders)

