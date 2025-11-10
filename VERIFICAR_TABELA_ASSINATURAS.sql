-- ============================================
-- VERIFICAR TABELA DE ASSINATURAS
-- Execute este script para descobrir onde estão os dados de assinatura
-- ============================================

-- 1. Verificar se existe tabela 'subscriptions'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'subscriptions'
        ) THEN '✅ Tabela subscriptions EXISTE'
        ELSE '❌ Tabela subscriptions NÃO existe'
    END as status_tabela_subscriptions;

-- 2. Se existir, mostrar estrutura da tabela subscriptions
SELECT 
    '📋 SUBSCRIPTIONS' as tabela,
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

-- 3. Verificar se há campos de assinatura na tabela profiles
SELECT 
    '📋 PROFILES - Campos de Assinatura' as secao,
    column_name as coluna,
    data_type as tipo
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
    column_name ILIKE '%status%'
  )
ORDER BY column_name;

-- 4. Listar TODAS as tabelas que podem conter dados de assinatura
SELECT 
    '📊 TODAS AS TABELAS' as secao,
    table_name as tabela
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name ILIKE '%subscription%' OR
    table_name ILIKE '%assinatura%' OR
    table_name ILIKE '%payment%' OR
    table_name ILIKE '%plan%'
  )
ORDER BY table_name;

-- 5. Se existir tabela subscriptions, mostrar um exemplo de dados (sem expor dados sensíveis)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
    ) THEN
        RAISE NOTICE '✅ Tabela subscriptions encontrada!';
        RAISE NOTICE 'Execute: SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ''subscriptions'';';
    ELSE
        RAISE NOTICE '❌ Tabela subscriptions não encontrada';
        RAISE NOTICE 'Verifique se os dados estão na tabela profiles ou em outra tabela';
    END IF;
END $$;

-- 6. Verificar todas as colunas da tabela profiles (caso tenha campos de assinatura)
SELECT 
    '📋 TODAS AS COLUNAS DE PROFILES' as secao,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

