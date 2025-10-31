import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    console.log('👤 [AuthContext] Buscando perfil do usuário:', userId);
    
    try {
      const startTime = performance.now();
      
      // Adicionar timeout para evitar travamento
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT_PROFILE')), 5000)
      );
      
      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;
      
      const duration = performance.now() - startTime;
      
      if (error) {
        console.error(`❌ [AuthContext] Erro ao buscar perfil (${duration.toFixed(2)}ms):`, error.message);
        setUserProfile(null);
      } else {
        console.log(`✅ [AuthContext] Perfil carregado em ${duration.toFixed(2)}ms:`, profile);
        setUserProfile(profile);
      }
    } catch (err: any) {
      if (err.message === 'TIMEOUT_PROFILE') {
        console.error('❌ [AuthContext] TIMEOUT ao buscar perfil do usuário!');
        console.error('⚠️ A tabela profiles pode não existir ou está inacessível');
      } else {
        console.error('❌ [AuthContext] Erro ao buscar perfil:', err);
      }
      setUserProfile(null);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('🔐 [AuthContext] Inicializando AuthContext (modo simplificado)...');
    
    // USAR APENAS onAuthStateChange - sem buscar sessão inicial
    // Deixar o Supabase gerenciar tudo automaticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 [AuthContext] Evento:', event, '| Sessão:', !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      setUserProfile(null); // Perfil desabilitado
      setLoading(false); // Sempre definir loading como false quando houver evento
    });

    // Fallback: se não houver evento em 1 segundo, definir loading como false
    const fallbackTimer = setTimeout(() => {
      console.log('⚠️ [AuthContext] Fallback - nenhum evento em 1s, definindo loading=false');
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('🚪 [AuthContext] Iniciando logout...');
    
    // Limpar o estado imediatamente para feedback visual instantâneo
    console.log('🧹 [AuthContext] Limpando estado do usuário imediatamente...');
    setSession(null);
    setUser(null);
    setUserProfile(null);
    console.log('✅ [AuthContext] Estado limpo com sucesso');
    
    // Tentar sincronizar com o Supabase em background (não bloqueia o logout)
    try {
      console.log('📡 [AuthContext] Sincronizando logout com Supabase em background...');
      
      // Timeout reduzido para 3 segundos (resposta mais rápida)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 3000)
      );
      
      const signOutPromise = supabase.auth.signOut();
      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
      
      if (error) {
        console.warn("⚠️ [AuthContext] Erro ao sincronizar logout no Supabase (ignorado):", error.message);
      } else {
        console.log('✅ [AuthContext] Logout sincronizado com sucesso no Supabase');
      }
    } catch (error: any) {
      if (error.message === 'Logout timeout') {
        console.log('⏱️ [AuthContext] Logout local completado - Supabase ainda sincronizando em background');
      } else {
        console.warn('⚠️ [AuthContext] Erro ao sincronizar com Supabase (ignorado):', error);
      }
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    signOut,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};