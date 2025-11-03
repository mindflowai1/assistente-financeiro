-- ============================================
-- BACKUP RÁPIDO - Verificar Estado Atual
-- Execute ANTES de criar a tabela reminders
-- ============================================

-- 1. Verificar se a tabela reminders já existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'reminders'
        ) THEN '⚠️ ATENÇÃO: Tabela reminders JÁ EXISTE!'
        ELSE '✅ Tabela reminders NÃO existe - pode criar'
    END as status_tabela;

-- 2. Contar registros em cada tabela (para referência)
SELECT 
    'profiles' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT id) as usuarios_unicos
FROM profiles
UNION ALL
SELECT 
    'transactions' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_com_transacoes
FROM transactions
UNION ALL
SELECT 
    'categories' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_com_categorias
FROM categories
UNION ALL
SELECT 
    'limites_gastos' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_com_limites
FROM limites_gastos;

-- 3. Verificar estrutura das tabelas principais
SELECT 
    table_name,
    COUNT(*) as num_colunas
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'transactions', 'categories', 'limites_gastos')
GROUP BY table_name
ORDER BY table_name;

-- 4. Verificar políticas RLS existentes
SELECT 
    tablename,
    COUNT(*) as num_politicas
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'transactions', 'categories', 'limites_gastos')
GROUP BY tablename
ORDER BY tablename;

-- 5. Verificar funções que atualizam updated_at
SELECT 
    routine_name as funcao,
    COUNT(DISTINCT t.trigger_name) as tabelas_que_usam
FROM information_schema.routines r
LEFT JOIN information_schema.triggers t 
    ON t.action_statement LIKE '%' || r.routine_name || '%'
WHERE r.routine_schema = 'public'
  AND r.routine_name LIKE '%updated_at%'
GROUP BY routine_name;

-- ============================================
-- RESUMO
-- ============================================
-- Este backup mostra:
-- ✅ Quantos registros você tem
-- ✅ Estrutura das tabelas
-- ✅ Políticas RLS existentes
-- ✅ Funções disponíveis
--
-- Guarde este resultado para referência!
-- ============================================

