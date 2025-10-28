import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

export const AccountPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (isLoggingOut) {
      console.log('⚠️ [AccountPage] Logout já em andamento, ignorando clique duplicado');
      return;
    }

    console.log('🚪 [AccountPage] Botão de logout clicado');
    setIsLoggingOut(true);
    
    try {
      console.log('⏳ [AccountPage] Chamando função signOut...');
      await signOut();
      console.log('✅ [AccountPage] signOut completado, navegando para /');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ [AccountPage] Erro ao fazer logout:', error);
      setIsLoggingOut(false);
    }
  };
  
  const userMetadata = user?.user_metadata;

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const infoBoxClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-lg border space-y-8 transition-colors duration-300 ${cardClass}`}>
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-green-600">
            Minha Conta
            </h1>
        </div>
        
        <div className="space-y-4">
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className={`font-semibold ${textMutedClass}`}>Bem-vindo(a),</span> {userMetadata?.full_name || 'Usuário'}!
            </p>
            <div className={`${infoBoxClass} p-4 rounded-lg`}>
                <p className={`text-md ${textMutedClass}`}>Email:</p>
                <p className="text-lg font-mono text-green-500 break-all">{user?.email}</p>
            </div>
             <div className={`${infoBoxClass} p-4 rounded-lg`}>
                <p className={`text-md ${textMutedClass}`}>Telefone:</p>
                <p className="text-lg font-mono text-green-500">{userMetadata?.phone || 'Não informado'}</p>
            </div>
            <div className={`${infoBoxClass} p-4 rounded-lg`}>
                <p className={`text-md ${textMutedClass}`}>ID do Usuário:</p>
                <p className="text-sm font-mono text-green-500 break-all">{user?.id}</p>
            </div>
            <div className="pt-4">
                <Link
                    to="/reset-password"
                    className="w-full flex items-center justify-center py-3 px-4 bg-transparent border border-green-500 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-semibold transition-all duration-300 ease-in-out"
                >
                    Redefinir Senha
                </Link>
            </div>
        </div>

        <div className="border-t pt-8 mt-8 border-gray-700">
            <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                {isLoggingOut && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
            </button>
        </div>
    </div>
  );
};
