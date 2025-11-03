import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';

interface Reminder {
  id: string;
  titulo: string;
  descricao?: string;
  data_lembrete: string;
  status: 'pendente' | 'enviado' | 'cancelado';
  tipo: 'conta_pagar' | 'lembrete' | 'outro';
  valor?: number;
  created_at: string;
  google_calendar_id?: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
};

const formatDisplayDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (value?: number) => {
  if (!value) return '';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const RemindersPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataLembrete, setDataLembrete] = useState('');
  const [tipo, setTipo] = useState<'conta_pagar' | 'lembrete' | 'outro'>('conta_pagar');
  const [valor, setValor] = useState('');

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClass = theme === 'dark'
    ? 'bg-gray-600 border-gray-500 text-gray-100 focus:border-green-500 focus:ring-green-500/50'
    : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const buttonClass = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  // Carregar lembretes
  const loadReminders = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('data_lembrete', { ascending: true });

      if (fetchError) throw fetchError;

      setReminders(data || []);
    } catch (err: any) {
      setError('Erro ao carregar lembretes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [user?.id]);

  // Criar lembrete
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('Você precisa estar logado para criar lembretes.');
      return;
    }

    if (!titulo.trim() || !dataLembrete) {
      setError('Preencha pelo menos o título e a data do lembrete.');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const reminderData: any = {
        user_id: user.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        data_lembrete: new Date(dataLembrete).toISOString(),
        tipo,
        status: 'pendente'
      };

      if (tipo === 'conta_pagar' && valor) {
        reminderData.valor = parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
      }

      const { data: newReminder, error: insertError } = await supabase
        .from('reminders')
        .insert([reminderData])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess('Lembrete criado com sucesso! Você receberá uma notificação no WhatsApp quando chegar a hora.');
      
      // Limpar formulário
      setTitulo('');
      setDescricao('');
      setDataLembrete('');
      setValor('');
      setTipo('conta_pagar');

      // Recarregar lista
      await loadReminders();
    } catch (err: any) {
      setError('Erro ao criar lembrete: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Deletar lembrete
  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lembrete?')) return;

    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSuccess('Lembrete excluído com sucesso!');
      await loadReminders();
    } catch (err: any) {
      setError('Erro ao excluir lembrete: ' + err.message);
    }
  };

  // Filtrar lembretes
  const pendentes = reminders.filter(r => r.status === 'pendente');
  const enviados = reminders.filter(r => r.status === 'enviado');
  const cancelados = reminders.filter(r => r.status === 'cancelado');

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border transition-colors duration-300 ${cardClass}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">📅 Meus Lembretes</h1>
          <p className={textMutedClass}>
            Crie lembretes e notificações para contas a pagar e outros eventos importantes.
            Você receberá uma mensagem no WhatsApp quando chegar a hora do lembrete.
          </p>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">
            {success}
          </div>
        )}

        {/* Formulário de criação */}
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <h2 className="text-xl font-semibold mb-4">Criar Novo Lembrete</h2>
          <form onSubmit={handleCreateReminder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${textMutedClass}`}>
                  Título *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${inputClass}`}
                  placeholder="Ex: Conta de luz"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textMutedClass}`}>
                  Data e Hora *
                </label>
                <input
                  type="datetime-local"
                  value={dataLembrete}
                  onChange={(e) => setDataLembrete(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${inputClass}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textMutedClass}`}>
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${inputClass}`}
                rows={3}
                placeholder="Detalhes adicionais sobre o lembrete..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${textMutedClass}`}>
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${inputClass}`}
                >
                  <option value="conta_pagar">Conta a Pagar</option>
                  <option value="lembrete">Lembrete</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {tipo === 'conta_pagar' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textMutedClass}`}>
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${inputClass}`}
                    placeholder="0,00"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className={`w-full bg-green-600 hover:bg-green-700 text-white ${buttonClass}`}
            >
              {isCreating ? 'Criando...' : 'Criar Lembrete'}
            </button>
          </form>
        </div>

        {/* Lista de lembretes */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : reminders.length === 0 ? (
          <div className={`text-center py-8 ${textMutedClass}`}>
            <p>Nenhum lembrete criado ainda.</p>
            <p className="text-sm mt-2">Crie seu primeiro lembrete usando o formulário acima.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pendentes */}
            {pendentes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  Pendentes ({pendentes.length})
                </h2>
                <div className="space-y-3">
                  {pendentes.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{reminder.titulo}</h3>
                          {reminder.descricao && (
                            <p className={`text-sm mb-2 ${textMutedClass}`}>{reminder.descricao}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className={textMutedClass}>
                              📅 {formatDisplayDate(reminder.data_lembrete)}
                            </span>
                            <span className={textMutedClass}>
                              🏷️ {reminder.tipo === 'conta_pagar' ? 'Conta a Pagar' : reminder.tipo === 'lembrete' ? 'Lembrete' : 'Outro'}
                            </span>
                            {reminder.valor && (
                              <span className="font-semibold text-green-600">
                                💰 {formatCurrency(reminder.valor)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enviados */}
            {enviados.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Enviados ({enviados.length})
                </h2>
                <div className="space-y-3">
                  {enviados.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 opacity-75' : 'bg-gray-50 border-gray-200 opacity-75'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{reminder.titulo}</h3>
                          {reminder.descricao && (
                            <p className={`text-sm mb-2 ${textMutedClass}`}>{reminder.descricao}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className={textMutedClass}>
                              📅 {formatDisplayDate(reminder.data_lembrete)}
                            </span>
                            {reminder.google_calendar_id && (
                              <span className="text-green-500 text-xs">
                                ✅ No Google Calendar
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelados */}
            {cancelados.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                  Cancelados ({cancelados.length})
                </h2>
                <div className="space-y-3">
                  {cancelados.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 opacity-50' : 'bg-gray-50 border-gray-200 opacity-50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 line-through">{reminder.titulo}</h3>
                          <span className={`text-sm ${textMutedClass}`}>
                            📅 {formatDisplayDate(reminder.data_lembrete)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

