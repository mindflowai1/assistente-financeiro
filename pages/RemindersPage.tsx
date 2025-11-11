import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

 

export const RemindersPage: React.FC = () => {
  const { theme } = useTheme();

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border transition-colors duration-300 ${cardClass}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">📅 Meus Lembretes</h1>
          <p className={`text-base sm:text-lg ${textMutedClass}`}>Gerencie seus lembretes e notificações</p>
        </div>

        <div className="text-center py-12 sm:py-20 px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-yellow-500/10 text-yellow-600 mb-6 text-4xl sm:text-5xl">
            🚧
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Em Desenvolvimento
          </h2>
          <p className={`text-lg sm:text-xl lg:text-2xl mb-6 ${textMutedClass} max-w-2xl mx-auto`}>
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </p>
          <p className={`text-base sm:text-lg ${textMutedClass}`}>
            Aguarde novidades! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

