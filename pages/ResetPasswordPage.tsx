import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SUPABASE_URL = 'https://wgtntctzljufpikogvur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndndG50Y3R6bGp1ZnBpa29ndnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTE5MzcsImV4cCI6MjA3NTUyNzkzN30.ZuxOpQCtxBaMhXN4RrtmlSr304ENqPoF1yWumxECTPg';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Obter token do localStorage diretamente (bypassa cliente Supabase)
  useEffect(() => {
    console.log('🔑 [ResetPassword] Obtendo token do localStorage...');
    console.log('📦 [ResetPassword] Total de chaves no localStorage:', localStorage.length);
    
    try {
      // Mostrar TODAS as chaves para debug
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allKeys.push(key);
        }
      }
      console.log('🔍 [ResetPassword] Todas as chaves do localStorage:', allKeys);
      
      // Procurar por qualquer chave do Supabase no localStorage
      for (const key of allKeys) {
        // Verificar se a chave é do Supabase (sb- ou supabase)
        if (key && (key.includes('supabase') || key.startsWith('sb-'))) {
          console.log('🔍 [ResetPassword] Analisando chave:', key);
          const data = localStorage.getItem(key);
          console.log('📦 [ResetPassword] Tamanho dos dados:', data?.length || 0, 'bytes');
          
          if (data) {
            try {
              const parsed = JSON.parse(data);
              console.log('📄 [ResetPassword] Conteúdo da chave:', key, parsed);
              
              // Tentar diferentes caminhos para o token
              const token = 
                parsed?.access_token || 
                parsed?.currentSession?.access_token ||
                parsed?.session?.access_token ||
                parsed?.user?.access_token;
                
              if (token) {
                console.log('✅ [ResetPassword] Token encontrado na chave:', key);
                console.log('🔑 [ResetPassword] Token (primeiros 30 chars):', token.substring(0, 30) + '...');
                setAccessToken(token);
                return;
              } else {
                console.warn('⚠️ [ResetPassword] Chave do Supabase encontrada, mas sem token:', key);
                console.warn('⚠️ [ResetPassword] Estrutura do objeto:', Object.keys(parsed));
              }
            } catch (parseError) {
              console.warn('⚠️ [ResetPassword] Erro ao parsear chave:', key, parseError);
            }
          }
        }
      }
      
      console.error('❌ [ResetPassword] Token não encontrado em nenhuma chave do Supabase');
      console.error('💡 [ResetPassword] SOLUÇÃO: Faça logout e login novamente para gerar um novo token');
    } catch (e) {
      console.error('❌ [ResetPassword] Erro ao buscar token:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔐 [ResetPassword] ========== USANDO REST API DIRETA ==========');
    console.log('═══════════════════════════════════════════════════════');

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!accessToken) {
      setError('⚠️ Token de acesso não encontrado. Por favor, faça LOGOUT e LOGIN novamente.');
      return;
    }

    setLoading(true);

    try {
      console.log('📡 [ResetPassword] Usando fetch() direta para bypass do cliente Supabase');
      console.log('🔑 [ResetPassword] Token:', accessToken.substring(0, 20) + '...');
      console.log('⏰ [ResetPassword] Timestamp início:', new Date().toISOString());

      // Usar fetch direta - BYPASSA o cliente Supabase completamente!
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          password: password
        })
      });

      console.log('📥 [ResetPassword] Status da resposta:', response.status);
      console.log('📥 [ResetPassword] Status text:', response.statusText);
      console.log('⏰ [ResetPassword] Timestamp fim:', new Date().toISOString());

      const data = await response.json();
      console.log('📥 [ResetPassword] Dados da resposta:', data);

      if (!response.ok) {
        console.error('❌ [ResetPassword] Erro HTTP:', response.status);
        setError(data.message || data.error_description || `Erro: ${response.status}`);
        setLoading(false);
        return;
      }

      // SUCESSO!
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅✅✅ [ResetPassword] SUCESSO COM REST API!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('👤 [ResetPassword] Usuário atualizado:', data);

      setMessage('✅ Senha atualizada com sucesso!');
      setLoading(false);

      setTimeout(() => {
        console.log('➡️ [ResetPassword] Redirecionando...');
        navigate('/account');
      }, 2000);

    } catch (err: any) {
      console.log('═══════════════════════════════════════════════════════');
      console.error('❌❌❌ [ResetPassword] ERRO');
      console.log('═══════════════════════════════════════════════════════');
      console.error('❌ [ResetPassword] Mensagem:', err.message);
      console.error('❌ [ResetPassword] Stack:', err.stack);
      console.log('═══════════════════════════════════════════════════════');

      setError(err.message || 'Erro ao atualizar senha');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-green-500 mb-2">
          Redefinir Senha
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Digite sua nova senha abaixo
        </p>

        {/* Mensagens */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-500 text-sm">{message}</p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nova Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Nova Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading || !accessToken}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </button>

        </form>

        {/* Link Voltar */}
        <div className="mt-6 text-center">
          <Link 
            to="/account" 
            className="text-green-500 hover:text-green-400 text-sm transition-colors"
          >
            ← Voltar para Conta
          </Link>
        </div>

      </div>
    </div>
  );
};
