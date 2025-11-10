import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

 

export const RemindersPage: React.FC = () => {
  const { theme } = useTheme();

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border transition-colors duration-300 ${cardClass}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">📅 Meus Lembretes</h1>
          <p className={textMutedClass}>Esta seção estará disponível em breve.</p>
        </div>

        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-600 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Em breve</h2>
          <p className={textMutedClass}>Estamos trabalhando nesta funcionalidade. Volte mais tarde.</p>
        </div>
      </div>
    </div>
  );
};

