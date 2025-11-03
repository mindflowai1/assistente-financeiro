-- ============================================
-- CRIAR TABELA DE LEMBRETES/NOTIFICAÇÕES
-- VERSÃO ULTRA SEGURA - Verifica TUDO antes
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/wgtntctzljufpikogvur/sql/new
-- ============================================

-- ============================================
-- ETAPA 1: VERIFICAÇÕES PRÉVIAS
-- ============================================
DO $$
DECLARE
  table_exists BOOLEAN;
  table_has_data BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Verificar se tabela já existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reminders'
  ) INTO table_exists;
  
  -- Se existe, verificar se tem dados
  IF table_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM reminders LIMIT 1
    ) INTO table_has_data;
    
    IF table_has_data THEN
      RAISE EXCEPTION '⚠️ ATENÇÃO: Tabela reminders já existe E tem dados! Não vamos sobrescrever. Execute VERIFICAR_ANTES_CRIAR.sql primeiro.';
    ELSE
      RAISE NOTICE '✅ Tabela reminders existe mas está vazia. Prosseguindo...';
    END IF;
  ELSE
    RAISE NOTICE '✅ Tabela reminders não existe. Criando...';
  END IF;
  
  -- Verificar se função existe
  SELECT EXISTS (
    SELECT FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'update_updated_at_column'
  ) INTO function_exists;
  
  IF NOT function_exists THEN
    RAISE EXCEPTION '❌ ERRO: Função update_updated_at_column não encontrada! Esta função é necessária e deve existir.';
  ELSE
    RAISE NOTICE '✅ Função update_updated_at_column encontrada. Prosseguindo...';
  END IF;
  
END $$;

-- ============================================
-- ETAPA 2: CRIAR TABELA (apenas se não existir)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reminders'
  ) THEN
    -- Criar tabela de lembretes (seguindo padrão das outras tabelas)
    CREATE TABLE reminders (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data_lembrete TIMESTAMPTZ NOT NULL,
      status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'cancelado')),
      tipo TEXT DEFAULT 'conta_pagar' CHECK (tipo IN ('conta_pagar', 'lembrete', 'outro')),
      valor NUMERIC(10, 2),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    RAISE NOTICE '✅ Tabela reminders criada com sucesso!';
  ELSE
    RAISE NOTICE 'ℹ️ Tabela reminders já existe. Pulando criação.';
  END IF;
END $$;

-- ============================================
-- ETAPA 3: HABILITAR RLS (seguro - não quebra nada)
-- ============================================
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ETAPA 4: CRIAR POLÍTICAS RLS (apenas se não existirem)
-- ============================================
DO $$
BEGIN
  -- Política: usuários só podem ver seus próprios lembretes
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reminders' 
    AND policyname = 'Users can view own reminders'
  ) THEN
    CREATE POLICY "Users can view own reminders"
      ON reminders FOR SELECT
      USING (auth.uid() = user_id);
    RAISE NOTICE '✅ Política SELECT criada!';
  ELSE
    RAISE NOTICE 'ℹ️ Política SELECT já existe. Pulando.';
  END IF;

  -- Política: usuários só podem criar seus próprios lembretes
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reminders' 
    AND policyname = 'Users can insert own reminders'
  ) THEN
    CREATE POLICY "Users can insert own reminders"
      ON reminders FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE '✅ Política INSERT criada!';
  ELSE
    RAISE NOTICE 'ℹ️ Política INSERT já existe. Pulando.';
  END IF;

  -- Política: usuários só podem atualizar seus próprios lembretes
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reminders' 
    AND policyname = 'Users can update own reminders'
  ) THEN
    CREATE POLICY "Users can update own reminders"
      ON reminders FOR UPDATE
      USING (auth.uid() = user_id);
    RAISE NOTICE '✅ Política UPDATE criada!';
  ELSE
    RAISE NOTICE 'ℹ️ Política UPDATE já existe. Pulando.';
  END IF;

  -- Política: usuários só podem deletar seus próprios lembretes
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reminders' 
    AND policyname = 'Users can delete own reminders'
  ) THEN
    CREATE POLICY "Users can delete own reminders"
      ON reminders FOR DELETE
      USING (auth.uid() = user_id);
    RAISE NOTICE '✅ Política DELETE criada!';
  ELSE
    RAISE NOTICE 'ℹ️ Política DELETE já existe. Pulando.';
  END IF;
END $$;

-- ============================================
-- ETAPA 5: CRIAR ÍNDICES (seguro com IF NOT EXISTS)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_data_lembrete ON reminders(data_lembrete);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- ============================================
-- ETAPA 6: CRIAR TRIGGER (remove se existir e cria novo)
-- ============================================
DO $$
BEGIN
  -- Remover trigger se existir (seguro - só remove o trigger específico desta tabela)
  IF EXISTS (
    SELECT FROM pg_trigger 
    WHERE tgname = 'update_reminders_updated_at_trigger'
    AND tgrelid = 'reminders'::regclass
  ) THEN
    DROP TRIGGER update_reminders_updated_at_trigger ON reminders;
    RAISE NOTICE 'ℹ️ Trigger antigo removido.';
  END IF;
  
  -- Criar trigger usando função existente
  CREATE TRIGGER update_reminders_updated_at_trigger
    BEFORE UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  
  RAISE NOTICE '✅ Trigger criado com sucesso!';
END $$;

-- ============================================
-- ETAPA 7: VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
  table_exists BOOLEAN;
  rls_enabled BOOLEAN;
  policies_count INTEGER;
  indexes_count INTEGER;
  trigger_exists BOOLEAN;
  function_used BOOLEAN;
BEGIN
  -- Verificar se tabela existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reminders'
  ) INTO table_exists;
  
  -- Verificar se RLS está habilitado
  SELECT COALESCE(relrowsecurity, false)
  FROM pg_class 
  WHERE relname = 'reminders'
  INTO rls_enabled;
  
  -- Contar políticas
  SELECT COUNT(*) 
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'reminders'
  INTO policies_count;
  
  -- Contar índices (excluindo índices automáticos de PK)
  SELECT COUNT(*) 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename = 'reminders'
  AND indexname NOT LIKE '%_pkey'
  INTO indexes_count;
  
  -- Verificar se trigger existe
  SELECT EXISTS (
    SELECT FROM pg_trigger 
    WHERE tgname = 'update_reminders_updated_at_trigger'
  ) INTO trigger_exists;
  
  -- Verificar se função está sendo usada
  SELECT EXISTS (
    SELECT FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'update_updated_at_column'
  ) INTO function_used;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESULTADO DA VERIFICAÇÃO FINAL:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tabela existe: %', table_exists;
  RAISE NOTICE 'RLS habilitado: %', rls_enabled;
  RAISE NOTICE 'Políticas RLS: %', policies_count;
  RAISE NOTICE 'Índices: %', indexes_count;
  RAISE NOTICE 'Trigger existe: %', trigger_exists;
  RAISE NOTICE 'Função disponível: %', function_used;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  IF table_exists AND rls_enabled AND policies_count >= 4 AND indexes_count >= 3 AND trigger_exists AND function_used THEN
    RAISE NOTICE '✅✅✅ TUDO CONFIGURADO CORRETAMENTE! ✅✅✅';
    RAISE NOTICE '';
    RAISE NOTICE 'A tabela reminders está pronta para uso!';
    RAISE NOTICE 'Nenhum dado foi alterado ou removido.';
    RAISE NOTICE 'Todas as tabelas existentes continuam funcionando normalmente.';
  ELSE
    RAISE WARNING '⚠️ Alguma configuração pode estar faltando. Verifique os logs acima.';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabela existe: %', table_exists;
    RAISE NOTICE 'RLS: %', rls_enabled;
    RAISE NOTICE 'Políticas: % (esperado: 4)', policies_count;
    RAISE NOTICE 'Índices: % (esperado: 3+)', indexes_count;
    RAISE NOTICE 'Trigger: %', trigger_exists;
  END IF;
END $$;

-- ============================================
-- GARANTIAS DE SEGURANÇA
-- ============================================
-- ✅ NÃO altera tabelas existentes
-- ✅ NÃO altera dados existentes
-- ✅ NÃO remove nada existente
-- ✅ NÃO cria funções duplicadas (reutiliza existente)
-- ✅ NÃO cria políticas duplicadas (verifica antes)
-- ✅ NÃO cria índices duplicados (IF NOT EXISTS)
-- ✅ Verifica tudo antes de executar
-- ✅ Pode ser executado múltiplas vezes sem problemas
-- ============================================

