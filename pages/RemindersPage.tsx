import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';

interface Reminder {
  id: string;
  titulo: string;
  descricao: string | null;
  dia_vencimento: number;
  status: string;
  tipo: string;
  valor: number | null;
  created_at: string;
}

export const RemindersPage: React.FC = () => {
  const { theme } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      
      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('🔍 Debug - Usuário:', user?.id);
      console.log('🔍 Debug - Erro de autenticação:', userError);
      
      if (!user) {
        console.error('❌ Usuário não autenticado');
        setLoading(false);
        return;
      }

      console.log('✅ Usuário autenticado:', user.id);

      // Buscar lembretes do usuário (sem order by para descobrir as colunas)
      const { data, error, count } = await supabase
        .from('reminders')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      console.log('🔍 Debug - Query result:', { data, error, count, userId: user.id });
      console.log('🔍 Debug - Lembretes encontrados:', data?.length || 0);

      if (error) {
        console.error('❌ Erro ao buscar lembretes:', error);
        alert(`Erro ao buscar lembretes: ${error.message}`);
      } else {
        console.log('✅ Lembretes carregados:', data);
        setReminders(data || []);
      }
    } catch (err) {
      console.error('❌ Erro inesperado ao buscar lembretes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este lembrete?')) {
      return;
    }

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar lembrete:', error);
        alert('Erro ao cancelar lembrete. Tente novamente.');
      } else {
        setReminders(reminders.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Erro ao deletar lembrete:', err);
      alert('Erro ao cancelar lembrete. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDiaVencimento = (dia: number) => {
    return `Dia do Vencimento: ${dia}`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pendente: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      enviado: 'bg-green-500/10 text-green-600 border-green-500/20',
      cancelado: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    };
    const labels = {
      pendente: 'Pendente',
      enviado: 'Enviado',
      cancelado: 'Cancelado'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badges[status as keyof typeof badges] || badges.pendente}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      conta_pagar: '💰',
      lembrete: '📌',
      outro: '📝'
    };
    return icons[tipo as keyof typeof icons] || '📝';
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border transition-colors duration-300 ${cardClass}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">📅 Meus Lembretes</h1>
            <p className={`text-base sm:text-lg ${textMutedClass}`}>
              Gerencie seus lembretes e notificações
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <span className="text-2xl font-bold">{reminders.length}</span>
            <span className={`ml-2 text-sm ${textMutedClass}`}>
              {reminders.length === 1 ? 'lembrete' : 'lembretes'}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && reminders.length === 0 && (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500/10 text-blue-600 mb-6 text-4xl sm:text-5xl">
              📅
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Nenhum lembrete encontrado
            </h2>
            <p className={`text-base sm:text-lg ${textMutedClass} max-w-md mx-auto`}>
              Você ainda não tem lembretes cadastrados. Crie lembretes pelo WhatsApp para vê-los aqui!
            </p>
          </div>
        )}

        {/* Reminders List */}
        {!loading && reminders.length > 0 && (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-4 sm:p-6 rounded-xl border transition-all duration-200 ${cardClass} ${hoverClass}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Type */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTipoIcon(reminder.tipo)}</span>
                      <h3 className="text-lg sm:text-xl font-semibold truncate">
                        {reminder.titulo}
                      </h3>
                    </div>

                    {/* Description */}
                    {reminder.descricao && (
                      <p className={`text-sm sm:text-base ${textMutedClass} mb-3`}>
                        {reminder.descricao}
                      </p>
                    )}

                    {/* Date and Value */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`text-sm ${textMutedClass}`}>
                          {formatDiaVencimento(reminder.dia_vencimento)}
                        </span>
                      </div>
                      {reminder.valor && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-green-600">
                            R$ {reminder.valor.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    disabled={deletingId === reminder.id}
                    className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                        : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Cancelar lembrete"
                  >
                    {deletingId === reminder.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

