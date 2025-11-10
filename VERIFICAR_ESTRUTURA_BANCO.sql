-- ============================================
-- SCRIPT DE VERIFICAÇÃO COMPLETA DO BANCO
-- Execute este script para verificar toda a estrutura
-- ============================================

-- ============================================
-- 1. LISTAR TODAS AS TABELAS
-- ============================================
SELECT 
    '📊 TABELAS' as secao,
    table_name as tabela,
    CASE 
        WHEN table_name IN ('profiles', 'transactions', 'limites_gastos') THEN '✅ Principal'
        WHEN table_name = 'reminders' THEN 'ℹ️ Lembretes (não incluído na doc)'
        ELSE '⚠️ Outras'
    END as tipo
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN ('profiles', 'transactions', 'limites_gastos') THEN 1
        WHEN table_name = 'reminders' THEN 2
        ELSE 3
    END,
    table_name;

-- ============================================
-- 2. ESTRUTURA DETALHADA DAS TABELAS PRINCIPAIS
-- ============================================

-- 2.1 PROFILES
SELECT 
    '📋 PROFILES' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2.2 TRANSACTIONS
SELECT 
    '📋 TRANSACTIONS' as tabela,
    column_name as coluna,
    data_type as tipo,
    numeric_precision as precisao,
    numeric_scale as escala,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'transactions'
ORDER BY ordinal_position;

-- 2.3 LIMITES_GASTOS
SELECT 
    '📋 LIMITES_GASTOS' as tabela,
    column_name as coluna,
    data_type as tipo,
    numeric_precision as precisao,
    numeric_scale as escala,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'limites_gastos'
ORDER BY ordinal_position;

-- ============================================
-- 3. CONSTRAINTS (Primary Keys, Foreign Keys, Checks)
-- ============================================

-- 3.1 PRIMARY KEYS
SELECT 
    '🔑 PRIMARY KEYS' as tipo,
    tc.table_name as tabela,
    kc.column_name as coluna,
    tc.constraint_name as constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kc
    ON tc.constraint_name = kc.constraint_name
    AND tc.table_schema = kc.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'transactions', 'limites_gastos')
ORDER BY tc.table_name;

-- 3.2 FOREIGN KEYS
SELECT 
    '🔗 FOREIGN KEYS' as tipo,
    tc.table_name as tabela,
    kc.column_name as coluna,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    tc.constraint_name as constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kc
    ON tc.constraint_name = kc.constraint_name
    AND tc.table_schema = kc.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'transactions', 'limites_gastos')
ORDER BY tc.table_name;

-- 3.3 CHECK CONSTRAINTS
SELECT 
    '✅ CHECK CONSTRAINTS' as tipo,
    tc.table_name as tabela,
    tc.constraint_name as constraint_name,
    cc.check_clause as condicao
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'transactions', 'limites_gastos')
ORDER BY tc.table_name;

-- 3.4 UNIQUE CONSTRAINTS
SELECT 
    '🔒 UNIQUE CONSTRAINTS' as tipo,
    tc.table_name as tabela,
    kc.column_name as coluna,
    tc.constraint_name as constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kc
    ON tc.constraint_name = kc.constraint_name
    AND tc.table_schema = kc.table_schema
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'transactions', 'limites_gastos')
ORDER BY tc.table_name;

-- ============================================
-- 4. ÍNDICES
-- ============================================
SELECT 
    '📇 ÍNDICES' as tipo,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'transactions', 'limites_gastos')
ORDER BY tablename, indexname;

-- ============================================
-- 5. RLS (Row Level Security)
-- ============================================

-- 5.1 Status RLS por tabela
SELECT 
    '🔐 STATUS RLS' as tipo,
    relname as tabela,
    CASE 
        WHEN relrowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESABILITADO'
    END as status_rls
FROM pg_class
WHERE relname IN ('profiles', 'transactions', 'limites_gastos')
ORDER BY relname;

-- 5.2 Políticas RLS detalhadas
SELECT 
    '🛡️ POLÍTICAS RLS' as tipo,
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Configurada'
        ELSE '⚠️ Sem condição'
    END as status,
    qual as condicao_using,
    with_check as condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'transactions', 'limites_gastos')
ORDER BY tablename,
    CASE cmd
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
    END;

-- ============================================
-- 6. FUNÇÕES
-- ============================================
SELECT 
    '⚙️ FUNÇÕES' as tipo,
    routine_name as funcao,
    routine_type as tipo_funcao,
    data_type as retorno,
    routine_definition as definicao
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- ============================================
-- 7. TRIGGERS
-- ============================================
SELECT 
    '🔔 TRIGGERS' as tipo,
    event_object_table as tabela,
    trigger_name as trigger,
    event_manipulation as evento,
    action_timing as timing,
    action_statement as funcao
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('profiles', 'transactions', 'limites_gastos')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 8. ESTATÍSTICAS (Contagem de Registros)
-- ============================================
SELECT 
    '📊 ESTATÍSTICAS' as tipo,
    'profiles' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT id) as usuarios_unicos
FROM profiles
UNION ALL
SELECT 
    '📊 ESTATÍSTICAS',
    'transactions',
    COUNT(*),
    COUNT(DISTINCT user_id) as usuarios_com_transacoes
FROM transactions
UNION ALL
SELECT 
    '📊 ESTATÍSTICAS',
    'limites_gastos',
    COUNT(*),
    COUNT(DISTINCT user_id) as usuarios_com_limites
FROM limites_gastos;

-- ============================================
-- 9. RESUMO FINAL
-- ============================================
SELECT 
    '📋 RESUMO' as secao,
    'Tabelas principais' as item,
    COUNT(*)::text as valor
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'transactions', 'limites_gastos')
UNION ALL
SELECT 
    '📋 RESUMO',
    'Políticas RLS',
    COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'transactions', 'limites_gastos')
UNION ALL
SELECT 
    '📋 RESUMO',
    'Índices',
    COUNT(*)::text
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'transactions', 'limites_gastos')
UNION ALL
SELECT 
    '📋 RESUMO',
    'Funções customizadas',
    COUNT(*)::text
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name NOT LIKE 'pg_%';

-- ============================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- ============================================



