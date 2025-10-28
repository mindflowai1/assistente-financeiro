import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface TransactionRecord {
  id: string;
  descricao: string;
  tipo: 'Entrada' | 'Saída';
  categoria: string;
  data: string;
  valor: number;
}

interface DailyBalance {
  data: string;
  saldo: number;
}

interface SpendingData {
    name: string;
    value: number;
    color: string;
}

const CATEGORIES = ['Alimentação', 'Lazer', 'Impostos', 'Saúde', 'Transporte', 'Moradia', 'Educação', 'Outros'];

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    if (!dateString) {
        return 'N/A';
    }
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    const date = new Date(isDateOnly ? `${dateString}T00:00:00` : dateString);
    
    if (isNaN(date.getTime())) {
        return 'Data Inválida';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
    };
    return date.toLocaleDateString('pt-BR', { ...defaultOptions, ...options });
};


// Chart Component
const DailyBalanceChart: React.FC<{ data: DailyBalance[] }> = ({ data }) => {
    const { theme } = useTheme();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const svgRef = React.useRef<SVGSVGElement>(null);

    const SVG_WIDTH = 600;
    const SVG_HEIGHT = 300;
    const MARGIN = { top: 20, right: 20, bottom: 40, left: 60 };
    const CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
    const CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

    if (!data || data.length === 0) {
        return <p className={theme === 'dark' ? 'text-gray-400 text-center' : 'text-gray-500 text-center'}>Não há dados de saldo para exibir.</p>;
    }

    const maxBalance = Math.max(...data.map(d => d.saldo), 0);
    const minBalance = Math.min(...data.map(d => d.saldo), 0);

    const yMax = Math.max(Math.abs(maxBalance), Math.abs(minBalance)) * 1.1 || 10;
    const yMin = -yMax;

    const yScale = (value: number) => {
        return CHART_HEIGHT - ((value - yMin) / (yMax - yMin)) * CHART_HEIGHT;
    };
    
    const xScale = (index: number) => (index / (data.length > 1 ? data.length - 1 : 1)) * CHART_WIDTH;
    const zeroLineY = yScale(0);

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d.saldo)}`).join(' ');
    const areaPath = data.length > 1 ? linePath + ` L${xScale(data.length - 1)},${zeroLineY} L${xScale(0)},${zeroLineY} Z` : `M${xScale(0)},${yScale(data[0].saldo)} L${xScale(0)},${zeroLineY} Z`;
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - MARGIN.left;
        const index = Math.round((x / CHART_WIDTH) * (data.length - 1));
        
        if (index >= 0 && index < data.length) {
            setActiveIndex(index);
        }
    };

    const handleMouseLeave = () => {
        setActiveIndex(null);
    };

    const axisLabelClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const gridLineClass = theme === 'dark' ? 'text-gray-700' : 'text-gray-200';
    const zeroLineClass = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
    const tooltipBgClass = theme === 'dark' ? 'bg-gray-800/80 border-gray-600' : 'bg-white/80 border-gray-200';
    const tooltipTextClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const tooltipDateClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className="relative flex justify-center">
            <svg ref={svgRef} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-2xl" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                 <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                    {/* Y Axis Grid and Labels */}
                    {[yMax, yMax / 2, yMin / 2, yMin].map(tick => (
                        <line key={tick} x1="0" y1={yScale(tick)} x2={CHART_WIDTH} y2={yScale(tick)} className={`stroke-current ${gridLineClass}`} strokeDasharray="2" />
                    ))}
                    {[yMax, yMax / 2, 0, yMin / 2, yMin].map(tick => (
                        <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                            <text x="-10" y="5" textAnchor="end" className={`fill-current ${axisLabelClass}`} fontSize="10">
                                {formatCurrency(tick).replace('R$', '').trim()}
                            </text>
                        </g>
                    ))}
                    <line x1="0" y1={zeroLineY} x2={CHART_WIDTH} y2={zeroLineY} className={`stroke-current ${zeroLineClass}`} />
                    
                    {/* X Axis Labels */}
                    {data.map((balance, index) => {
                        const showLabel = data.length <= 10 || (index % Math.floor(data.length / 5) === 0) || index === data.length - 1;
                        if (!showLabel) return null;
                        return (
                            <text
                                key={balance.data}
                                x={xScale(index)}
                                y={CHART_HEIGHT + 20}
                                textAnchor="middle"
                                className={`fill-current ${axisLabelClass}`}
                                fontSize="10"
                            >
                                {formatDate(balance.data)}
                            </text>
                        );
                    })}

                    {/* Gradient Area and Line */}
                    <path d={areaPath} fill="url(#areaGradient)" />
                    <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="2.5" filter="url(#glow)" />
                    
                    {/* Active Point Indicator */}
                    {activeIndex !== null && data[activeIndex] && (
                        <g>
                            <line x1={xScale(activeIndex)} y1="0" x2={xScale(activeIndex)} y2={CHART_HEIGHT} stroke="#4ade80" strokeDasharray="3,3" />
                            <circle cx={xScale(activeIndex)} cy={yScale(data[activeIndex].saldo)} r="6" className={theme === 'dark' ? 'fill-gray-800' : 'fill-white'} stroke="#4ade80" strokeWidth="2" />
                        </g>
                    )}
                </g>
            </svg>
            {/* Tooltip */}
            {activeIndex !== null && data[activeIndex] && (
                <div
                    className={`absolute p-2 text-xs backdrop-blur-sm rounded-md shadow-lg pointer-events-none transition-transform duration-100 border ${tooltipBgClass}`}
                    style={{
                        left: MARGIN.left + xScale(activeIndex),
                        top: MARGIN.top + yScale(data[activeIndex].saldo),
                        transform: `translate(-50%, -120%)`,
                        minWidth: '120px'
                    }}
                >
                    <div className={`text-center ${tooltipDateClass}`}>{formatDate(data[activeIndex].data, { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                    <div className={`text-center font-bold text-lg ${tooltipTextClass}`}>{formatCurrency(data[activeIndex].saldo)}</div>
                </div>
            )}
        </div>
    );
};

const SpendingDonutChart: React.FC<{ data: SpendingData[]; total: number }> = ({ data, total }) => {
    const { theme } = useTheme();
    const SIZE = 200;
    const STROKE_WIDTH = 25;
    const radius = (SIZE - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;

    return (
        <div className="flex flex-col xl:flex-row items-center justify-center gap-6 p-4">
            <div className="relative w-[200px] h-[200px]">
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="transform -rotate-90">
                    {data.map((slice, index) => {
                        const percent = total > 0 ? (slice.value / total) * 100 : 0;
                        const dashOffset = circumference * (1 - percent / 100);
                        const rotation = (cumulativePercent / 100) * 360;
                        cumulativePercent += percent;
                        
                        return (
                            <circle
                                key={index}
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={radius}
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth={STROKE_WIDTH}
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500 text-xs'}>Total Gasto</span>
                    <span className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(total)}</span>
                </div>
            </div>
            <div className="w-full max-w-xs xl:max-w-none xl:w-auto self-center">
              <ul className="space-y-2 text-sm">
                  {data.map((slice) => (
                      <li key={slice.name} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: slice.color }}></span>
                              <span className={theme === 'dark' ? 'text-gray-300 truncate' : 'text-gray-700 truncate'} title={slice.name}>{slice.name}</span>
                          </div>
                          <span className={`ml-auto font-mono flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0.0'}%</span>
                      </li>
                  ))}
              </ul>
            </div>
        </div>
    );
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOutcome, setTotalOutcome] = useState(0);
  const [balance, setBalance] = useState(0);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // FIX: Explicitly cast `r.valor` to a number to prevent potential type issues
  // where it might be treated as a string, leading to concatenation instead of addition.
  useEffect(() => {
    // FIX: Explicitly typing the accumulator `sum` as a number resolves the type error.
    // `r.valor` is already a number from the TransactionRecord interface and data sanitization.
    const income = records
      .filter((r) => r.tipo === 'Entrada')
      .reduce((sum: number, r) => sum + r.valor, 0);

    const outcome = records
      .filter((r) => r.tipo === 'Saída')
      .reduce((sum: number, r) => sum + r.valor, 0);
    
    setTotalIncome(income);
    setTotalOutcome(outcome);
    setBalance(income - outcome);
  }, [records]);

  const spendingData = useMemo(() => {
    if (!records || totalOutcome === 0) return [];

    const spendingByCategory = records
        .filter(r => r.tipo === 'Saída')
        .reduce((acc: Record<string, number>, record) => {
            const category = record.categoria || 'Outros';
            // FIX: Ensure record.valor is treated as a number during addition to prevent string concatenation.
            acc[category] = (acc[category] || 0) + record.valor;
            return acc;
        }, {} as Record<string, number>);

    const COLORS = ['#818cf8', '#34d399', '#fbbF24', '#fb7185', '#a78bfa', '#2dd4bf', '#38bdf8', '#22d3ee'];

    return Object.entries(spendingByCategory)
        .map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);
  }, [records, totalOutcome]);

  const handleSelectRecord = (id: string) => {
    setSelectedRecords(prev =>
      prev.includes(id)
        ? prev.filter(recordId => recordId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(r => r.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRecords.length === 0) return;
    setIsDeleting(true);
    setError(null);
    const webhookUrl = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/cac5d2ea-fc98-490c-94ae-7a354e871c44';
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRecords }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro na resposta do servidor.' }));
        throw new Error(errorData.message || 'Falha ao excluir as transações. Tente novamente.');
      }
      setRecords(prevRecords => prevRecords.filter(record => !selectedRecords.includes(record.id)));
      setIsSelectionMode(false);
      setSelectedRecords([]);
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro ao tentar excluir as transações.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGetRecords = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    setRecords([]);
    setDailyBalances([]);
    setIsSelectionMode(false);
    setSelectedRecords([]);

    if (!user?.id) {
      setError('Não foi possível obter a identificação do usuário. Tente fazer login novamente.');
      setLoading(false);
      return;
    }
    if (!startDate || !endDate) {
      setError('Por favor, selecione as datas inicial e final.');
      setLoading(false);
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
        setError('A data final não pode ser anterior à data inicial.');
        setLoading(false);
        return;
    }

    const formattedStartDate = `${startDate}T00:00:00.000000-03:00`;
    const formattedEndDate = `${endDate}T23:59:59.999000-03:00`;
    const baseUrl = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/c45f6c27-0314-494f-aaa6-2990f3ee14aa';
    const params = new URLSearchParams({ startDate: formattedStartDate, endDate: formattedEndDate, userId: user.id });
    if (selectedCategory) {
        params.append('category', selectedCategory);
    }
    const webhookUrl = `${baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(webhookUrl, { method: 'GET' });
      if (!response.ok) throw new Error(`Falha na requisição: ${response.statusText}`);
      const data = await response.json();
      const combinedData = Array.isArray(data) ? data.reduce((acc, curr) => ({ ...acc, ...curr }), {}) : data;
      const transactions = combinedData.transacoes;
      const balances = combinedData.saldos_diarios;

      if (Array.isArray(transactions)) {
        const sanitizedTransactions = transactions.map(tx => ({ ...tx, valor: Number(tx.valor) || 0 }));
        sanitizedTransactions.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        setRecords(sanitizedTransactions);
        setMessage(transactions.length === 0 && (!balances || balances.length === 0) ? 'Nenhum registro encontrado para o período selecionado.' : null);
      } else { setRecords([]); }
      
      if (Array.isArray(balances)) {
        // Sanitize balance data to ensure 'saldo' is a valid number, preventing chart crashes.
        const sanitizedBalances = balances
            .map(b => ({ ...b, saldo: Number(b.saldo) }))
            .filter(b => b && typeof b.saldo === 'number' && !isNaN(b.saldo));
        setDailyBalances(sanitizedBalances);
      } else {
        setDailyBalances([]);
      }

      if (!Array.isArray(transactions) && !Array.isArray(balances)) {
         setMessage('Formato de resposta do webhook inesperado.');
      }
    } catch (e: any) {
      setError('Não foi possível obter os registros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const filterSectionClass = theme === 'dark' ? 'bg-gray-700/[0.5]' : 'bg-gray-100';
  const inputClass = theme === 'dark'
    ? 'bg-gray-600 border-gray-500 text-gray-100 focus:border-green-500 focus:ring-green-500/50'
    : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500';
  const summaryCardClass = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const summaryTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const transactionCardClass = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const transactionItemClass = theme === 'dark' ? 'bg-gray-900/50 hover:bg-gray-700' : 'bg-gray-100/50 hover:bg-gray-200';
  const transactionItemTextClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const transactionItemSubtextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const selectionBarClass = theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-600' : 'bg-gray-100/50 hover:bg-gray-200';
  const selectedItemClass = theme === 'dark' ? 'border-green-500 bg-green-500/10' : 'border-green-500 bg-green-500/10';

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border transition-colors duration-300 ${cardClass}`}>
        <div className="space-y-6">
            <p className={`text-lg mb-6 ${textMutedClass}`}>
                Bem-vindo(a) ao seu dashboard, {user?.user_metadata?.full_name || 'Usuário'}!
            </p>
            <div className={`p-8 rounded-lg ${filterSectionClass}`}>
                <h2 className="text-xl font-semibold mb-6 text-center">Filtrar Transações</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
                    <div>
                        <label htmlFor="startDate" className={`block text-sm font-medium mb-2 text-left ${summaryTextClass}`}>Data Inicial</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${inputClass}`}
                            aria-label="Data Inicial"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className={`block text-sm font-medium mb-2 text-left ${summaryTextClass}`}>Data Final</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${inputClass}`}
                            aria-label="Data Final"
                        />
                    </div>
                    <div>
                         <label htmlFor="category" className={`block text-sm font-medium mb-2 text-left ${summaryTextClass}`}>Categoria</label>
                         <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition appearance-none ${inputClass}`}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem',
                            }}
                            aria-label="Categoria"
                         >
                            <option value="">Todas as Categorias</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         </select>
                    </div>
                </div>

                 <button
                    onClick={handleGetRecords}
                    disabled={loading}
                    className="w-full max-w-sm mx-auto py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {loading ? 'Buscando...' : 'Obter Registros'}
                </button>
                <div className="mt-4 min-h-[24px] text-center">
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </div>
            
            {records.length > 0 || dailyBalances.length > 0 ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className={`p-6 rounded-lg text-center shadow ${summaryCardClass}`}>
                        <h3 className={`text-md font-semibold mb-2 ${summaryTextClass}`}>Total de Entradas</h3>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className={`p-6 rounded-lg text-center shadow ${summaryCardClass}`}>
                        <h3 className={`text-md font-semibold mb-2 ${summaryTextClass}`}>Total de Saídas</h3>
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(totalOutcome)}</p>
                    </div>
                    <div className={`p-6 rounded-lg text-center shadow ${summaryCardClass}`}>
                        <h3 className={`text-md font-semibold mb-2 ${summaryTextClass}`}>Saldo</h3>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(balance)}</p>
                    </div>
                </div>
                
                {records.length > 0 && (
                  <div className={`p-6 rounded-lg shadow ${transactionCardClass}`}>
                      <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">Registros de Transações</h2>
                          {!isSelectionMode ? (
                              <button onClick={() => setIsSelectionMode(true)} className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-all duration-300">Excluir Transações</button>
                          ) : (
                              <div className="flex items-center gap-4">
                                <button onClick={handleDeleteSelected} disabled={selectedRecords.length === 0 || isDeleting} className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-all duration-300 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center">
                                    {isDeleting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                    {isDeleting ? 'Excluindo...' : `Excluir Selecionadas (${selectedRecords.length})`}
                                </button>
                                <button onClick={() => { setIsSelectionMode(false); setSelectedRecords([]); }} className="py-2 px-4 bg-gray-500 hover:bg-gray-600 rounded-lg font-semibold text-white transition-all duration-300">Cancelar</button>
                              </div>
                          )}
                      </div>
                      {isSelectionMode && (
                          <div onClick={handleSelectAll} className={`flex items-center p-4 mb-4 rounded-lg cursor-pointer transition-colors ${selectionBarClass}`}>
                              <div className={`h-5 w-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${selectedRecords.length === records.length && records.length > 0 ? 'bg-green-600 border-green-500' : `${theme === 'dark' ? 'bg-gray-600 border-gray-400' : 'bg-gray-200 border-gray-400'}`}`} aria-hidden="true">
                                {selectedRecords.length === records.length && records.length > 0 && <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className={`ml-3 font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Selecionar Todas</span>
                          </div>
                      )}
                      <div className="space-y-4">
                          {records.map((record) => (
                              <div key={record.id} onClick={() => isSelectionMode && handleSelectRecord(record.id)} className={`flex items-center justify-between p-4 rounded-lg transition-all border-2 ${isSelectionMode ? 'cursor-pointer' : ''} ${transactionItemClass} ${selectedRecords.includes(record.id) ? selectedItemClass : 'border-transparent'}`}>
                                  <div className="flex items-center gap-4">
                                      {isSelectionMode && (
                                          <div className={`h-5 w-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${selectedRecords.includes(record.id) ? 'bg-green-600 border-green-500' : `${theme === 'dark' ? 'bg-gray-600 border-gray-400' : 'bg-gray-200 border-gray-400'}`}`} aria-hidden="true">
                                              {selectedRecords.includes(record.id) && <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                          </div>
                                      )}
                                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${record.tipo === 'Entrada' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                          {record.tipo === 'Entrada' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7l-7 7-7-7" /></svg>}
                                      </div>
                                      <div>
                                          <p className={`font-semibold ${transactionItemTextClass}`}>{record.descricao}</p>
                                          <p className={`text-sm ${transactionItemSubtextClass}`}>{record.categoria}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className={`font-bold text-lg ${record.tipo === 'Entrada' ? 'text-green-500' : 'text-red-500'}`}>{record.tipo === 'Saída' && '- '}{formatCurrency(record.valor)}</p>
                                      <p className={`text-sm ${transactionItemSubtextClass}`}>{formatDate(record.data, {day: '2-digit', month: '2-digit', year: 'numeric'})}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                    {spendingData.length > 0 && (
                        <div className={`p-6 rounded-lg shadow ${transactionCardClass}`}>
                            <h2 className="text-xl font-semibold mb-4 text-center">Veja Seus Gastos no Período</h2>
                            <SpendingDonutChart data={spendingData} total={totalOutcome} />
                        </div>
                    )}
                    
                    {dailyBalances.length > 0 && (
                        <div className={`p-6 rounded-lg shadow ${transactionCardClass} ${spendingData.length === 0 ? 'xl:col-span-2' : ''}`}>
                            <h2 className="text-xl font-semibold mb-4 text-center">Evolução do Saldo</h2>
                            <DailyBalanceChart data={dailyBalances} />
                        </div>
                    )}
                </div>
            </>
            ) : (
                <div className="text-center py-10">
                    {message && !error && <p className={`${textMutedClass}`}>{message}</p>}
                </div>
            )}
        </div>
    </div>
  );
};
