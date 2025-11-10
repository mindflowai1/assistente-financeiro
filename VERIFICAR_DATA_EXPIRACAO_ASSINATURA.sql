-- ============================================
-- VERIFICAR DATA DE EXPIRAÇÃO DA ASSINATURA
-- Execute este script para descobrir onde está a data de expiração
-- ============================================

-- ============================================
-- 1. VERIFICAR SE EXISTE TABELA 'subscriptions'
-- ============================================
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'subscriptions'
        ) THEN '✅ Tabela subscriptions EXISTE'
        ELSE '❌ Tabela subscriptions NÃO existe'
    END as status_tabela;

-- ============================================
-- 2. ESTRUTURA DA TABELA subscriptions (se existir)
-- ============================================
SELECT 
    '📋 SUBSCRIPTIONS - Estrutura Completa' as secao,
    column_name as coluna,
    data_type as tipo,
    numeric_precision as precisao,
    numeric_scale as escala,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ============================================
-- 3. CAMPOS DE DATA NA TABELA subscriptions
-- ============================================
SELECT 
    '📅 SUBSCRIPTIONS - Campos de Data' as secao,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subscriptions'
  AND (
    data_type IN ('timestamp', 'timestamptz', 'date', 'timestamp without time zone', 'timestamp with time zone') OR
    column_name ILIKE '%date%' OR
    column_name ILIKE '%expires%' OR
    column_name ILIKE '%period%' OR
    column_name ILIKE '%end%' OR
    column_name ILIKE '%trial%' OR
    column_name ILIKE '%payment%' OR
    column_name ILIKE '%valid%' OR
    column_name ILIKE '%until%'
  )
ORDER BY column_name;

-- ============================================
-- 4. VERIFICAR CAMPOS DE ASSINATURA NA TABELA profiles
-- ============================================
SELECT 
    '📋 PROFILES - Campos de Assinatura' as secao,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND (
    column_name ILIKE '%subscription%' OR
    column_name ILIKE '%assinatura%' OR
    column_name ILIKE '%expires%' OR
    column_name ILIKE '%period%' OR
    column_name ILIKE '%trial%' OR
    column_name ILIKE '%payment%' OR
    column_name ILIKE '%status%' OR
    column_name ILIKE '%date%' OR
    column_name ILIKE '%end%' OR
    column_name ILIKE '%valid%'
  )
ORDER BY column_name;

-- ============================================
-- 5. TODAS AS COLUNAS DA TABELA profiles (para referência)
-- ============================================
SELECT 
    '📋 PROFILES - Todas as Colunas' as secao,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- 6. LISTAR TODAS AS TABELAS QUE PODEM TER DADOS DE ASSINATURA
-- ============================================
SELECT 
    '📊 TABELAS RELACIONADAS A ASSINATURA' as secao,
    table_name as tabela,
    CASE 
        WHEN table_name = 'subscriptions' THEN '✅ Principal'
        WHEN table_name = 'profiles' THEN 'ℹ️ Pode ter campos de assinatura'
        ELSE '⚠️ Outras'
    END as tipo
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name ILIKE '%subscription%' OR
    table_name ILIKE '%assinatura%' OR
    table_name ILIKE '%payment%' OR
    table_name ILIKE '%plan%' OR
    table_name = 'profiles'
  )
ORDER BY 
    CASE 
        WHEN table_name = 'subscriptions' THEN 1
        WHEN table_name = 'profiles' THEN 2
        ELSE 3
    END,
    table_name;

-- ============================================
-- 7. EXEMPLO DE DADOS (se tabela subscriptions existir)
-- ============================================
-- Descomente e execute com seu user_id para ver os dados:
-- SELECT 
--     user_id,
--     subscription_status,
--     subscription_period,
--     expires_at,
--     end_date,
--     trial_ends_at,
--     next_payment,
--     created_at,
--     updated_at
-- FROM subscriptions
-- WHERE user_id = 'SEU_USER_ID_AQUI'
-- LIMIT 1;

-- ============================================
-- 8. VERIFICAR POLÍTICAS RLS DA TABELA subscriptions (se existir)
-- ============================================
SELECT 
    '🛡️ SUBSCRIPTIONS - Políticas RLS' as secao,
    policyname as politica,
    cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'subscriptions'
ORDER BY 
    CASE cmd
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
    END;

-- ============================================
-- 9. RESUMO - CAMPOS DE DATA ENCONTRADOS
-- ============================================
SELECT 
    '📊 RESUMO - Campos de Data Encontrados' as secao,
    table_name as tabela,
    column_name as campo_data,
    data_type as tipo
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    table_name = 'subscriptions' OR
    (table_name = 'profiles' AND (
        column_name ILIKE '%date%' OR
        column_name ILIKE '%expires%' OR
        column_name ILIKE '%period%' OR
        column_name ILIKE '%trial%' OR
        column_name ILIKE '%payment%'
    ))
  )
  AND data_type IN ('timestamp', 'timestamptz', 'date', 'timestamp without time zone', 'timestamp with time zone')
ORDER BY table_name, column_name;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar, verifique:
-- 1. Se existe tabela 'subscriptions'
-- 2. Quais campos de data existem
-- 3. Se há campos de assinatura na tabela 'profiles'
-- 4. Use os campos encontrados para atualizar o código
-- ============================================

