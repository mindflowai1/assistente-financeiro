import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';

const CATEGORIES = ['Alimentação', 'Lazer', 'Impostos', 'Saúde', 'Transporte', 'Moradia', 'Educação', 'Outros'];

export const LimitsPage: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();

    const [limits, setLimits] = useState<{ [key: string]: string }>({});
    const [savingLoading, setSavingLoading] = useState(false);
    const [consultLoading, setConsultLoading] = useState(true); // Start loading on mount
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [spendingByCategory, setSpendingByCategory] = useState<{ [key: string]: number }>({});

    const handleConsultLimits = async (showLoading: boolean = true) => {
        if (showLoading) setConsultLoading(true);
        setMessage(null);
        setError(null);
        setLimits({});

        if (!user) {
            setError("Usuário não autenticado.");
            if (showLoading) setConsultLoading(false);
            return;
        }

        try {
            // Tabela com colunas por categoria. Buscar linha do usuário e mapear colunas.
            const { data, error } = await supabase
                .from('limites_gastos')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
            if (error) throw error;
            if (data && typeof data === 'object') {
                const toSnake = (s: string) => s
                  .normalize('NFD').replace(/\p{Diacritic}/gu, '')
                  .toLowerCase().replace(/[^a-z0-9]+/g, '_')
                  .replace(/^_|_$/g, '');
                const candidatesFor = (category: string) => {
                  const snake = toSnake(category); // ex: alimentacao, saude
                  return [
                    snake,
                    `limite_${snake}`,
                    category,
                    category.toLowerCase(),
                  ];
                };
                const fetchedLimits = CATEGORIES.reduce((acc: { [key: string]: string }, cat) => {
                    const keys = candidatesFor(cat);
                    let found: any = undefined;
                    for (const k of keys) {
                        if (Object.prototype.hasOwnProperty.call(data, k)) {
                            found = (data as any)[k];
                            break;
                        }
                    }
                    const num = Number(found);
                    acc[cat] = isFinite(num) && num > 0 ? String(num) : '0';
                    return acc;
                }, {} as { [key: string]: string });
                setLimits(fetchedLimits);
                setMessage('Limites carregados com sucesso!');
            } else {
                setMessage('Nenhum limite salvo foi encontrado. Você pode definir novos limites.');
            }
        } catch (e: any) {
            setError(e.message || 'Ocorreu um erro ao consultar os limites.');
        } finally {
            if (showLoading) setConsultLoading(false);
        }
    };
    
    // Fetch limits on component mount
    useEffect(() => {
        handleConsultLimits();
    }, []);

    // Fetch totals spent by category to compute utilization (API fornecida)
    useEffect(() => {
        const fetchSpending = async () => {
            if (!user) return;
            try {
                const baseUrl = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/2ce26a1e-dd57-4e9c-99fe-b7abd277dcde';
                const params = new URLSearchParams({ user_id: user.id });
                const url = `${baseUrl}?${params.toString()}`;
                const resp = await fetch(url, { method: 'GET' });
                if (!resp.ok) {
                    // API pode não responder inicialmente; seguir sem bloquear
                    setSpendingByCategory({});
                    return;
                }
                const data = await resp.json();
                let spending: { [k: string]: number } = {};
                // Formato esperado: [{ total_por_categoria: [{ categoria, total }, ...] }]
                if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.total_por_categoria)) {
                    for (const row of data[0].total_por_categoria) {
                        const cat = row?.categoria || 'Outros';
                        const total = Number(row?.total) || 0;
                        spending[cat] = (spending[cat] || 0) + total;
                    }
                } else if (Array.isArray(data)) {
                    // fallback genérico
                    for (const item of data) {
                        const cat = item?.categoria || item?.category || 'Outros';
                        const total = Number(item?.total) || Number(item?.valor_total) || Number(item?.sum) || 0;
                        spending[cat] = (spending[cat] || 0) + total;
                    }
                } else if (data && typeof data === 'object') {
                    // mapa simples { categoria: total }
                    for (const key of Object.keys(data)) {
                        const total = Number((data as any)[key]) || 0;
                        spending[key] = total;
                    }
                }
                // Garantir todas as categorias presentes (0 quando ausente)
                const completed = CATEGORIES.reduce((acc: { [k: string]: number }, cat) => {
                    acc[cat] = spending[cat] || 0;
                    return acc;
                }, {} as { [k: string]: number });
                setSpendingByCategory(completed);
            } catch (err) {
                // Silenciar para não poluir a UI; a visualização ainda funciona com 0 de gasto
                setSpendingByCategory({});
            }
        };
        fetchSpending();
    }, [user]);

    const handleLimitChange = (category: string, value: string) => {
        if (/^\d*\.?\d*$/.test(value)) {
            setLimits(prev => ({ ...prev, [category]: value }));
        }
    };

    const handleSaveLimits = async () => {
        setSavingLoading(true);
        setMessage(null);
        setError(null);

        if (!user) {
            setError("Usuário não autenticado.");
            setSavingLoading(false);
            return;
        }

        const limitsPayload = CATEGORIES
            .map(category => ({
                categoria: category,
                valor: parseFloat(limits[category]) || 0,
            }))
            .filter(limit => limit.valor > 0);

        if (limitsPayload.length === 0) {
            setMessage("Nenhum limite foi definido. Nada para salvar.");
            setSavingLoading(false);
            return;
        }

        const webhookUrl = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/0aa3de2b-d7a9-461c-8f2e-b69fbd8215fb';
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, limites: limitsPayload }),
            });
            if (!response.ok) throw new Error('Falha ao salvar os limites.');
            setMessage('Limites definidos com sucesso!');
            setShowEditor(false);
            // Atualiza visual localmente para refletir imediatamente
            const newState = CATEGORIES.reduce((acc: { [k: string]: string }, cat) => {
                const v = limits[cat];
                acc[cat] = v && !isNaN(Number(v)) ? v : '0';
                return acc;
            }, {} as { [k: string]: string });
            setLimits(newState);
            // Um único refetch em background, sem loading spinner
            handleConsultLimits(false);
        } catch (e: any) {
            setError(e.message || 'Ocorreu um erro ao salvar os limites.');
        } finally {
            setSavingLoading(false);
        }
    };
    
    const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const limitsSectionClass = theme === 'dark' ? 'bg-gray-700/[0.7]' : 'bg-gray-100';
    const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const inputClass = theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300';
    const messageErrorClass = theme === 'dark' ? 'text-red-400 bg-red-500/10' : 'text-red-500 bg-red-100';
    const messageSuccessClass = theme === 'dark' ? 'text-green-400 bg-green-500/10' : 'text-green-600 bg-green-100';

    const parsedLimits = CATEGORIES.map(cat => ({
        category: cat,
        limitValue: parseFloat(limits[cat] || '0') || 0,
        spentValue: spendingByCategory[cat] || 0
    }));

    return (
        <div className={`w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-lg border space-y-8 transition-colors duration-300 ${cardClass}`}>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-green-600">Meus Limites</h1>
            </div>

            <div className={`${limitsSectionClass} p-6 rounded-lg`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-green-600">Limites por Categoria</h2>
                    <button
                        onClick={() => setShowEditor(v => !v)}
                        className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300"
                    >
                        {showEditor ? 'Fechar' : 'Definir Limites'}
                    </button>
                </div>
                {consultLoading ? (
                     <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className={textMutedClass}>Carregando seus limites...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {parsedLimits.map(({ category, limitValue, spentValue }) => {
                                const percent = limitValue > 0 ? Math.round((spentValue / limitValue) * 100) : 0;
                                const clamped = Math.min(100, Math.max(0, percent));
                                const isOver = percent >= 100;
                                const fillColor = isOver ? 'bg-red-500' : 'bg-green-500';
                                const trackClass = theme === 'dark' ? 'bg-gray-700/80' : 'bg-gray-200';
                                const borderClass = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
                                const textPrimary = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
                                return (
                                    <div key={category} className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm` }>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className={`font-semibold ${textPrimary}`}>{category}</div>
                                                <div className={`text-xs ${textMutedClass}`}>Gasto do mês vs Limite</div>
                                            </div>
                                            <div className={`text-right`}>
                                                <div className={`text-sm ${textPrimary}`}>R$ {spentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                                <div className={`text-xs ${textMutedClass}`}>de R$ {limitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                        </div>
                                        <div className={`w-full h-3 rounded-full ${trackClass} border ${borderClass} overflow-hidden`}>
                                            <div className={`h-full ${fillColor} transition-all duration-500`} style={{ width: `${clamped}%` }}></div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={`text-xs ${textMutedClass}`}>0%</span>
                                            <span className={`text-xs font-semibold ${isOver ? 'text-red-500' : 'text-green-600'}`}>{percent}%</span>
                                            <span className={`text-xs ${textMutedClass}`}>100%</span>
                                        </div>
                                        {isOver && (
                                            <div className="mt-2 text-xs text-red-500">Limite estourado</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {showEditor && (
                          <div className="fixed inset-0 z-20">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditor(false)}></div>
                            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl rounded-2xl p-6 border shadow-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Definir Limites</h3>
                                    <button onClick={() => setShowEditor(false)} className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>✕</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {CATEGORIES.map(category => (
                                        <div key={category}>
                                            <label htmlFor={`limit-${category}`} className={`block text-sm font-medium mb-2 ${textMutedClass}`}>
                                                {category}
                                            </label>
                                            <div className="relative">
                                                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${textMutedClass}`}>R$</span>
                                                <input
                                                    type="text"
                                                    id={`limit-${category}`}
                                                    name={category}
                                                    value={limits[category] || ''}
                                                    onChange={(e) => handleLimitChange(category, e.target.value)}
                                                    className={`w-full p-3 pl-10 rounded-lg border focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition ${inputClass}`}
                                                    placeholder="0.00"
                                                    inputMode="decimal"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSaveLimits}
                                    disabled={savingLoading}
                                    className="w-full mt-6 py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {savingLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : null}
                                    {savingLoading ? 'Salvando...' : 'Salvar Limites'}
                                </button>
                              </div>
                          </div>
                        )}
                    </>
                )}
                <div className="mt-4 min-h-[24px] text-center">
                    {error && <p className={`${messageErrorClass} p-3 rounded-lg`}>{error}</p>}
                    {message && <p className={`${messageSuccessClass} p-3 rounded-lg`}>{message}</p>}
                </div>
            </div>
        </div>
    );
};
