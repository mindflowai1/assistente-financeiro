import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      console.log('🔧 Tentando atualizar senha...');
      
      // Método 1: Tentar updateUser normalmente
      let result;
      try {
        result = await supabase.auth.updateUser({
          password: password
        });
        console.log('✅ UpdateUser retornou:', result);
      } catch (err) {
        console.error('❌ UpdateUser falhou:', err);
        throw err;
      }

      const { data, error } = result;

      if (error) {
        console.error('❌ Erro:', error);
        setError(error.message || 'Erro ao atualizar senha');
        setLoading(false);
        return;
      }

      if (data && data.user) {
        console.log('✅✅✅ Senha atualizada com sucesso!');
        setMessage('✅ Senha atualizada com sucesso! Redirecionando...');
        setLoading(false);
        setTimeout(() => navigate('/account'), 2000);
      } else {
        setError('Erro ao atualizar senha');
        setLoading(false);
      }

    } catch (error: any) {
      console.error('❌ Erro:', error);
      setError('Erro: ' + (error.message || 'Não foi possível trocar senha'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-100 p-4">
      <div className="w-full max-w-md mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-center text-green-500">
          Redefinir Senha
        </h1>
        <p className="text-gray-400 mb-4 text-center">
          Digite e confirme sua nova senha abaixo.
        </p>

        {error && (
          <div className="mb-4 text-center text-red-500 bg-red-500/10 p-3 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        {message && <p className="mb-4 text-center text-green-500 bg-green-500/10 p-3 rounded-lg">{message}</p>}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-2" htmlFor="password">
              Nova Senha
            </label>
            <input
              id="password"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-2" htmlFor="confirm-password">
              Confirmar Nova Senha
            </label>
            <input
              id="confirm-password"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/account" className="text-green-500 hover:underline">
            Voltar para Conta
          </Link>
        </div>
      </div>
    </div>
  );
};

