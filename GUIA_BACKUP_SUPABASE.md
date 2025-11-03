# 💾 Guia Completo: Backup do Supabase

## 🎯 Por que fazer backup?

Antes de criar a tabela `reminders`, é importante fazer backup do banco de dados para poder reverter caso algo dê errado.

---

## 🔧 Método 1: Backup via Supabase Dashboard (Mais Simples)

### 1.1 Backup Manual via Dashboard

1. Acesse: https://supabase.com/dashboard/project/wgtntctzljufpikogvur/settings/database
2. Vá em **Settings** → **Database**
3. Role até a seção **Backups**
4. Clique em **Create Backup**
5. Aguarde o backup ser criado
6. ✅ Backup salvo!

### 1.2 Restaurar Backup (se necessário)

1. Vá em **Settings** → **Database** → **Backups**
2. Selecione o backup desejado
3. Clique em **Restore**
4. ⚠️ **ATENÇÃO:** Isso vai restaurar o banco inteiro para o estado do backup!

---

## 🔧 Método 2: Backup via SQL (Exportar Dados)

### 2.1 Exportar Estrutura das Tabelas

Execute este SQL no Supabase SQL Editor para exportar a estrutura:

```sql
-- ============================================
-- EXPORTAR ESTRUTURA DAS TABELAS
-- ============================================
SELECT 
    'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' ||
    string_agg(
        column_name || ' ' || 
        CASE 
            WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
            WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
            WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
            WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
            WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
            ELSE UPPER(data_type)
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ', '
        ORDER BY ordinal_position
    ) || ');'
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'transactions', 'categories', 'limites_gastos')
GROUP BY table_name
ORDER BY table_name;
```

### 2.2 Exportar Dados das Tabelas

Execute este SQL para gerar comandos INSERT:

```sql
-- ============================================
-- EXPORTAR DADOS DAS TABELAS
-- ============================================

-- Exportar profiles
SELECT 'INSERT INTO profiles (id, email, name, phone, subscription_status, created_at, updated_at, next_payment, phone_2, plan) VALUES (' ||
       quote_literal(id) || ', ' ||
       quote_literal(email) || ', ' ||
       COALESCE(quote_literal(name), 'NULL') || ', ' ||
       COALESCE(quote_literal(phone), 'NULL') || ', ' ||
       COALESCE(quote_literal(subscription_status), 'NULL') || ', ' ||
       COALESCE(quote_literal(created_at), 'NULL') || ', ' ||
       COALESCE(quote_literal(updated_at), 'NULL') || ', ' ||
       COALESCE(quote_literal(next_payment), 'NULL') || ', ' ||
       COALESCE(quote_literal(phone_2), 'NULL') || ', ' ||
       COALESCE(quote_literal(plan), 'NULL') || ');'
FROM profiles;

-- Exportar transactions
SELECT 'INSERT INTO transactions (id, user_id, description, type, category, created_at, updated_at, amount, date) VALUES (' ||
       quote_literal(id) || ', ' ||
       quote_literal(user_id) || ', ' ||
       quote_literal(description) || ', ' ||
       quote_literal(type) || ', ' ||
       COALESCE(quote_literal(category), 'NULL') || ', ' ||
       COALESCE(quote_literal(created_at), 'NULL') || ', ' ||
       COALESCE(quote_literal(updated_at), 'NULL') || ', ' ||
       amount || ', ' ||
       COALESCE(quote_literal(date), 'NULL') || ');'
FROM transactions;

-- Exportar categories
SELECT 'INSERT INTO categories (id, user_id, name, type, color, icon, created_at) VALUES (' ||
       quote_literal(id) || ', ' ||
       quote_literal(user_id) || ', ' ||
       quote_literal(name) || ', ' ||
       quote_literal(type) || ', ' ||
       COALESCE(quote_literal(color), 'NULL') || ', ' ||
       COALESCE(quote_literal(icon), 'NULL') || ', ' ||
       COALESCE(quote_literal(created_at), 'NULL') || ');'
FROM categories;

-- Exportar limites_gastos
SELECT 'INSERT INTO limites_gastos (id, user_id, limite_alimentacao, limite_lazer, limite_impostos, limite_saude, limite_transporte, limite_moradia, limite_educacao, limite_outros, created_at, updated_at) VALUES (' ||
       quote_literal(id) || ', ' ||
       quote_literal(user_id) || ', ' ||
       COALESCE(limite_alimentacao::text, 'NULL') || ', ' ||
       COALESCE(limite_lazer::text, 'NULL') || ', ' ||
       COALESCE(limite_impostos::text, 'NULL') || ', ' ||
       COALESCE(limite_saude::text, 'NULL') || ', ' ||
       COALESCE(limite_transporte::text, 'NULL') || ', ' ||
       COALESCE(limite_moradia::text, 'NULL') || ', ' ||
       COALESCE(limite_educacao::text, 'NULL') || ', ' ||
       COALESCE(limite_outros::text, 'NULL') || ', ' ||
       COALESCE(quote_literal(created_at), 'NULL') || ', ' ||
       COALESCE(quote_literal(updated_at), 'NULL') || ');'
FROM limites_gastos;
```

---

## 🔧 Método 3: Backup via pg_dump (Mais Completo)

### 3.1 Instalar pg_dump

**Windows:**
- Baixe PostgreSQL: https://www.postgresql.org/download/windows/
- Ou use o Supabase CLI

**Mac:**
```bash
brew install postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql-client
```

### 3.2 Obter String de Conexão

1. Acesse: https://supabase.com/dashboard/project/wgtntctzljufpikogvur/settings/database
2. Vá em **Settings** → **Database**
3. Role até **Connection string** → **URI**
4. Copie a string (ela tem o formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

### 3.3 Executar Backup

**Backup Completo (estrutura + dados):**
```bash
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup_completo.sql
```

**Apenas Estrutura:**
```bash
pg_dump -s "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup_estrutura.sql
```

**Apenas Dados:**
```bash
pg_dump -a "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup_dados.sql
```

**Apenas Tabelas Específicas:**
```bash
pg_dump -t profiles -t transactions -t categories -t limites_gastos "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup_tabelas.sql
```

### 3.4 Restaurar Backup

```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < backup_completo.sql
```

---

## 🔧 Método 4: Backup via Supabase CLI (Recomendado)

### 4.1 Instalar Supabase CLI

**Windows (PowerShell):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
npm install -g supabase
```

### 4.2 Fazer Login

```bash
supabase login
```

### 4.3 Fazer Backup

```bash
# Backup completo
supabase db dump -f backup.sql --project-id wgtntctzljufpikogvur

# Backup apenas schema
supabase db dump -f backup_schema.sql --schema-only --project-id wgtntctzljufpikogvur

# Backup apenas dados
supabase db dump -f backup_data.sql --data-only --project-id wgtntctzljufpikogvur
```

### 4.4 Restaurar Backup

```bash
supabase db reset --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < backup.sql
```

---

## 🔧 Método 5: Backup Manual Rápido (SQL simples)

Execute este SQL para ver dados importantes antes de criar a tabela:

```sql
-- ============================================
-- BACKUP RÁPIDO - CONTAR REGISTROS
-- ============================================
SELECT 
    'profiles' as tabela,
    COUNT(*) as total_registros
FROM profiles
UNION ALL
SELECT 
    'transactions' as tabela,
    COUNT(*) as total_registros
FROM transactions
UNION ALL
SELECT 
    'categories' as tabela,
    COUNT(*) as total_registros
FROM categories
UNION ALL
SELECT 
    'limites_gastos' as tabela,
    COUNT(*) as total_registros
FROM limites_gastos;

-- Verificar se há dados críticos
SELECT COUNT(*) as total_usuarios FROM profiles;
SELECT COUNT(*) as total_transacoes FROM transactions;
```

---

## ✅ Checklist de Backup

Antes de executar o SQL de criação da tabela:

- [ ] Backup criado via Dashboard (método mais simples)
- [ ] OU backup via pg_dump (mais completo)
- [ ] OU backup via Supabase CLI
- [ ] Anotado número de registros em cada tabela
- [ ] Backup salvo em local seguro
- [ ] Pronto para executar `CRIAR_TABELA_LEMBRETES_FINAL_OTIMIZADO.sql`

---

## 🚨 Se Precisar Reverter

### Opção 1: Restaurar Backup Completo
1. Vá em **Settings** → **Database** → **Backups**
2. Selecione o backup
3. Clique em **Restore**

### Opção 2: Remover Apenas a Tabela (se necessário)
```sql
-- ⚠️ CUIDADO: Isso remove TODOS os dados da tabela!
DROP TABLE IF EXISTS reminders CASCADE;
```

### Opção 3: Remover Políticas e Mantém Tabela
```sql
-- Remover políticas RLS
DROP POLICY IF EXISTS "Users can view own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can insert own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON reminders;

-- Remover trigger
DROP TRIGGER IF EXISTS update_reminders_updated_at_trigger ON reminders;

-- Remover índices
DROP INDEX IF EXISTS idx_reminders_user_id;
DROP INDEX IF EXISTS idx_reminders_data_lembrete;
DROP INDEX IF EXISTS idx_reminders_status;
```

---

## 🎯 Recomendação

**Para maior segurança, use o Método 1 (Dashboard)** - é o mais simples e seguro:

1. Vá em **Settings** → **Database** → **Backups**
2. Clique em **Create Backup**
3. Aguarde alguns minutos
4. ✅ Pronto! Pode executar o SQL com segurança

---

**Dúvidas?** Consulte a documentação do Supabase: https://supabase.com/docs/guides/database/backups

