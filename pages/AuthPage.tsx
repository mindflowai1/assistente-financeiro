import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';

// Componente de redirecionamento para manter a compatibilidade com a rota antiga
export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
};

// Nova página de Login
export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, insira seu email para recuperar a senha.');
      return;
    }

    setForgotPasswordLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('📧 [LoginPage] Enviando email de recuperação para:', email);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });

      if (error) throw error;

      console.log('✅ [LoginPage] Email de recuperação enviado com sucesso');
      setMessage('Email de recuperação enviado! Verifique sua caixa de entrada e siga as instruções.');
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error('❌ [LoginPage] Erro ao enviar email de recuperação:', error);
      setError(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError(null);
    setMessage(null);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-100 p-4">
      <Link to="/" className="mb-8">
        <img 
          src="https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/seu%20assistente%20financeiro%20sem%20fundo.png?alt=media&token=01d3c41a-a247-43fb-8823-452e9161a37d" 
          alt="Seu Assistente Financeiro" 
          className="h-40 w-auto" 
        />
      </Link>

      <div className="w-full max-w-md mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-center text-green-500">
          {isForgotPassword ? 'Recuperar Senha' : 'Bem-vindo de Volta'}
        </h1>
        <p className="text-gray-400 mb-8 text-center">
          {isForgotPassword ? 'Digite seu email para receber instruções de recuperação.' : 'Faça login para continuar.'}
        </p>
        
        {error && <p className="mb-4 text-center text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>}
        {message && <p className="mb-4 text-center text-green-500 bg-green-500/10 p-3 rounded-lg">{message}</p>}

        <form onSubmit={isForgotPassword ? handleForgotPassword : handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
          </div>
          {!isForgotPassword && (
            <div>
              <label className="text-sm font-bold text-gray-300 block mb-2" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Senha"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading || forgotPasswordLoading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {(loading || forgotPasswordLoading) && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Entrando...' : forgotPasswordLoading ? 'Enviando email...' : (isForgotPassword ? 'Enviar Email de Recuperação' : 'Entrar')}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          {!isForgotPassword ? (
            <button
              onClick={toggleForgotPassword}
              className="text-sm text-green-500 hover:text-green-400 transition-colors"
            >
              Esqueceu sua senha?
            </button>
          ) : (
            <button
              onClick={toggleForgotPassword}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Voltar para login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
