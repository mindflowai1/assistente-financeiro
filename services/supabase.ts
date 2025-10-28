
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgtntctzljufpikogvur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndndG50Y3R6bGp1ZnBpa29ndnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTE5MzcsImV4cCI6MjA3NTUyNzkzN30.ZuxOpQCtxBaMhXN4RrtmlSr304ENqPoF1yWumxECTPg';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided.');
}

// Limpar TODOS os dados do Supabase do localStorage (silenciosamente)
try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('supabase')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
} catch (e) {
    // Silenciar erro
}

// Criar cliente SEM configurações adicionais (versão mínima)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
