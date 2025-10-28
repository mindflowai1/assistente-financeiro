import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const CATEGORIES = ['Alimentação', 'Lazer', 'Impostos', 'Saúde', 'Transporte', 'Moradia', 'Educação', 'Outros'];

export const LimitsPage: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();

    const [limits, setLimits] = useState<{ [key: string]: string }>({});
    const [savingLoading, setSavingLoading] = useState(false);
    const [consultLoading, setConsultLoading] = useState(true); // Start loading on mount
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleConsultLimits = async () => {
        setConsultLoading(true);
        setMessage(null);
        setError(null);
        setLimits({});

        if (!user) {
            setError("Usuário não autenticado.");
            setConsultLoading(false);
            return;
        }

        const webhookUrl = `https://n8n-n8n-start.kof6cn.easypanel.host/webhook/233136b9-9468-4d33-bb4e-6a4b16728e60?user_id=${user.id}`;

        try {
            const response = await fetch(webhookUrl);
            if (!response.ok) {
                throw new Error('Falha ao consultar os limites.');
            }
            const data = await response.json();
            const limitsData = Array.isArray(data) ? data[0]?.limites : data?.limites;

            if (Array.isArray(limitsData) && limitsData.length > 0) {
                const fetchedLimits = limitsData.reduce((acc, item) => {
                    if (item.categoria && typeof item.limite !== 'undefined') {
                        acc[item.categoria] = String(item.limite);
                    }
                    return acc;
                }, {} as { [key: string]: string });
                setLimits(fetchedLimits);
                setMessage('Limites carregados com sucesso!');
            } else {
                setMessage('Nenhum limite salvo foi encontrado. Você pode definir novos limites abaixo.');
            }
        } catch (e: any) {
            setError(e.message || 'Ocorreu um erro ao consultar os limites.');
        } finally {
            setConsultLoading(false);
        }
    };
    
    // Fetch limits on component mount
    useEffect(() => {
        handleConsultLimits();
    }, []);

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

    return (
        <div className={`w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-lg border space-y-8 transition-colors duration-300 ${cardClass}`}>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-green-600">Meus Limites</h1>
            </div>

            <div className={`${limitsSectionClass} p-6 rounded-lg`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-green-600">Defina seus Limites de Gastos</h2>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {CATEGORIES.map(category => (
                                <div key={category}>
                                    <label htmlFor={`limit-${category}`} className={`block text-sm font-medium mb-2 ${textMutedClass}`}>
                                        {category}
                                    </label>
                                    <div className="relative">
                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${textMutedClass}`}>
                                            R$
                                        </span>
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
                            className="w-full mt-8 py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {savingLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {savingLoading ? 'Salvando...' : 'Definir Limites'}
                        </button>
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
