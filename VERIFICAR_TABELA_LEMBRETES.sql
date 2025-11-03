-- ============================================
-- VERIFICAÇÃO COMPLETA DA TABELA REMINDERS
-- Execute este SQL para verificar se tudo foi criado corretamente
-- ============================================

-- 1. Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'reminders'
        ) THEN '✅ Tabela reminders EXISTE'
        ELSE '❌ Tabela reminders NÃO EXISTE'
    END as status_tabela;

-- 2. Verificar estrutura completa da tabela
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'reminders'
ORDER BY ordinal_position;

-- 3. Verificar se todas as colunas necessárias existem
SELECT 
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ Todas as colunas criadas (9 colunas)'
        ELSE '⚠️ Faltam colunas. Esperado: 9, Encontrado: ' || COUNT(*)::text
    END as status_colunas
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'reminders';

-- 4. Verificar colunas específicas esperadas
SELECT 
    column_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'reminders'
              AND column_name = column_name_check
        ) THEN '✅'
        ELSE '❌'
    END as status
FROM (VALUES 
    ('id'),
    ('user_id'),
    ('titulo'),
    ('descricao'),
    ('data_lembrete'),
    ('status'),
    ('tipo'),
    ('valor'),
    ('created_at'),
    ('updated_at')
) AS expected_columns(column_name_check)
LEFT JOIN information_schema.columns c 
    ON c.table_schema = 'public' 
    AND c.table_name = 'reminders'
    AND c.column_name = expected_columns.column_name_check;

-- 5. Verificar RLS (Row Level Security)
SELECT 
    relname as tabela,
    CASE 
        WHEN relrowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESABILITADO'
    END as status_rls
FROM pg_class
WHERE relname = 'reminders';

-- 6. Verificar políticas RLS
SELECT 
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Configurada'
        ELSE '⚠️ Sem condição'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'reminders'
ORDER BY 
    CASE cmd
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
    END;

-- 7. Contar políticas RLS
SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ Todas as políticas criadas (4 políticas)'
        ELSE '⚠️ Faltam políticas. Esperado: 4, Encontrado: ' || COUNT(*)::text
    END as status_politicas
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'reminders';

-- 8. Verificar índices
SELECT 
    indexname as indice,
    indexdef as definicao
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'reminders'
ORDER BY indexname;

-- 9. Contar índices (excluindo PK automático)
SELECT 
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Índices criados (' || COUNT(*)::text || ' índices)'
        ELSE '⚠️ Faltam índices. Esperado: 4+, Encontrado: ' || COUNT(*)::text
    END as status_indices
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'reminders';

-- 10. Verificar trigger
SELECT 
    trigger_name as trigger,
    event_manipulation as evento,
    action_timing as timing,
    action_statement as funcao
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'reminders';

-- 11. Verificar se trigger existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.triggers
            WHERE trigger_schema = 'public'
              AND event_object_table = 'reminders'
              AND trigger_name = 'update_reminders_updated_at_trigger'
        ) THEN '✅ Trigger criado'
        ELSE '❌ Trigger NÃO criado'
    END as status_trigger;

-- 12. Verificar se função existe e está sendo usada
SELECT 
    routine_name as funcao,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.routines
            WHERE routine_schema = 'public'
              AND routine_name = 'update_updated_at_column'
        ) THEN '✅ Função existe'
        ELSE '❌ Função NÃO existe'
    END as status_funcao
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_updated_at_column'
LIMIT 1;

-- 13. Verificar constraints (CHECK)
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'reminders'
  AND tc.constraint_type = 'CHECK';

-- 14. Verificar foreign key
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'reminders'
  AND tc.constraint_type = 'FOREIGN KEY';

-- ============================================
-- RESUMO FINAL
-- ============================================
SELECT 
    '========================================' as separador,
    'RESUMO DA VERIFICAÇÃO' as titulo,
    '========================================' as separador;

SELECT 
    'Tabela' as item,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reminders') 
        THEN '✅ EXISTE' 
        ELSE '❌ NÃO EXISTE' 
    END as status
UNION ALL
SELECT 
    'Colunas (9 esperadas)' as item,
    CASE WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reminders') = 9
        THEN '✅ CORRETO' 
        ELSE '⚠️ ' || (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reminders')::text || ' colunas'
    END
UNION ALL
SELECT 
    'RLS Habilitado' as item,
    CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'reminders')
        THEN '✅ SIM' 
        ELSE '❌ NÃO' 
    END
UNION ALL
SELECT 
    'Políticas RLS (4 esperadas)' as item,
    CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reminders') = 4
        THEN '✅ CORRETO' 
        ELSE '⚠️ ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reminders')::text || ' políticas'
    END
UNION ALL
SELECT 
    'Índices (4+ esperados)' as item,
    CASE WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'reminders') >= 4
        THEN '✅ CORRETO' 
        ELSE '⚠️ ' || (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'reminders')::text || ' índices'
    END
UNION ALL
SELECT 
    'Trigger' as item,
    CASE WHEN EXISTS (SELECT FROM information_schema.triggers WHERE trigger_schema = 'public' AND event_object_table = 'reminders' AND trigger_name = 'update_reminders_updated_at_trigger')
        THEN '✅ CRIADO' 
        ELSE '❌ NÃO CRIADO' 
    END
UNION ALL
SELECT 
    'Função update_updated_at_column' as item,
    CASE WHEN EXISTS (SELECT FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'update_updated_at_column')
        THEN '✅ EXISTE' 
        ELSE '❌ NÃO EXISTE' 
    END;

