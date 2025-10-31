import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

type SubscriptionStatus = 'Ativa' | 'Inativa' | 'Pendente';

const statusConfig: { [key in SubscriptionStatus]: { color: string; message: string } } = {
  Ativa: {
    color: 'text-green-500',
    message: 'Obrigado por ser um assinante! Você tem acesso a todos os recursos premium.',
  },
  Inativa: {
    color: 'text-red-500',
    message: 'Sua assinatura não está ativa. Assine agora para ter acesso a todos os recursos exclusivos e potenciar sua gestão financeira.',
  },
  Pendente: {
    color: 'text-yellow-500',
    message: 'Sua assinatura está com o pagamento pendente. Aguarde a confirmação ou entre em contato com o suporte se houver algum problema.',
  },
};

// Helper to format the date robustly, preventing crashes.
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) {
        return 'N/A';
    }
    // Attempt to create a date and check if it's valid.
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date received from API:', dateString);
        return 'Data inválida';
    }

    // Adding timeZone to avoid off-by-one day errors depending on browser timezone
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
    });
};


export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<string | null>(null); // State for the subscription period date
  const [loadingStatus, setLoadingStatus] = useState(true); // Start loading immediately
  const [error, setError] = useState<string | null>(null);

  const checkoutUrl = useMemo(() => {
    const baseUrl = 'https://payfast.greenn.com.br/140026';
    const params = new URLSearchParams();
    
    // Prioridade 1: Dados salvos no localStorage (do formulário de pré-checkout)
    try {
      const savedData = localStorage.getItem('greennCheckoutData');
      if (savedData) {
        const checkoutData = JSON.parse(savedData);
        // Usar dados salvos apenas se foram salvos recentemente (últimas 24 horas)
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        if (checkoutData.timestamp && (Date.now() - checkoutData.timestamp) < maxAge) {
          if (checkoutData.name) params.append('fn', checkoutData.name);
          if (checkoutData.email) params.append('em', checkoutData.email);
          if (checkoutData.phone) params.append('ph', checkoutData.phone);
        }
      }
    } catch (e) {
      console.warn('Erro ao ler dados do localStorage:', e);
    }
    
    // Prioridade 2: Dados do usuário logado (se não houver dados salvos ou como fallback)
    if (params.toString() === '' && user) {
      if (user.user_metadata?.full_name) {
        params.append('fn', user.user_metadata.full_name);
      }
      if (user.email) {
        params.append('em', user.email);
      }
      if (user.user_metadata?.phone) {
        params.append('ph', user.user_metadata.phone);
      }
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [user]);

  const handleFetchStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    setStatus(null);
    setSubscriptionPeriod(null); // Reset subscription period on each fetch

    if (!user?.id) {
      setError("Não foi possível obter a identificação do usuário. Tente fazer login novamente.");
      setLoadingStatus(false);
      return;
    }

    const webhookUrl = `https://n8n-n8n-start.kof6cn.easypanel.host/webhook/025e3469-c4cc-4963-ae2f-4fb16ac999e8?user_id=${user.id}`;
    
    try {
      const response = await fetch(webhookUrl);
      if (!response.ok) {
        throw new Error('Falha ao buscar o status da assinatura.');
      }
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const subscriptionData = data[0];
        const apiStatus = subscriptionData.subscription_status;
        
        // Store the subscription_period date if it exists
        if (subscriptionData.subscription_period) {
            setSubscriptionPeriod(subscriptionData.subscription_period);
        }

        switch (apiStatus) {
            case 'paid':
                setStatus('Ativa');
                break;
            case 'pending':
                setStatus('Pendente');
                break;
            default:
                setStatus('Inativa');
                break;
        }
      } else {
        setStatus('Inativa');
        console.warn("Formato de resposta inesperado do webhook de status:", data);
      }
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro ao verificar o status.');
      setStatus('Inativa');
    } finally {
      setLoadingStatus(false);
    }
  };
  
  useEffect(() => {
    // Automatically fetch status when the page loads
    handleFetchStatus();
  }, []);

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const statusSectionClass = theme === 'dark' ? 'bg-gray-700/[0.7]' : 'bg-gray-100';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textPrimaryClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const messageErrorClass = theme === 'dark' ? 'text-red-400 bg-red-500/10' : 'text-red-500 bg-red-100';
  const validityInfoClass = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200';

  return (
    <div className={`w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-lg border space-y-8 transition-colors duration-300 ${cardClass}`}>
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-green-600">
              Minha Assinatura
            </h1>
        </div>

        <div className={`${statusSectionClass} p-8 rounded-lg text-center space-y-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimaryClass}`}>Status da Assinatura</h2>

          {loadingStatus ? (
            <div className="flex flex-col items-center justify-center py-6 gap-4">
                <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className={textMutedClass}>Verificando status...</p>
            </div>
          ) : status ? (
            <>
              <div>
                <p className="text-4xl font-bold">
                  <span className={statusConfig[status].color}>
                    {status}
                  </span>
                </p>
                <p className={`max-w-md mx-auto mt-4 ${textMutedClass}`}>
                  {statusConfig[status].message}
                </p>
              </div>
              
              {/* Display validity date only if status is 'Ativa' and date is available */}
              {status === 'Ativa' && subscriptionPeriod && (
                <div className={`mt-4 p-3 rounded-lg inline-block ${validityInfoClass}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sua assinatura é válida até: <span className={`font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatDate(subscriptionPeriod)}</span>
                    </p>
                </div>
              )}

              {['Inativa', 'Pendente'].includes(status) && (
                <div className="pt-4">
                  <a 
                    href={checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block py-3 px-8 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out text-lg"
                  >
                    Assinar Agora
                  </a>
                </div>
              )}
            </>
          ) : null }
          
          <div className="min-h-[24px]">
            {error && <p className={`${messageErrorClass} p-3 rounded-lg`}>{error}</p>}
          </div>
        </div>
    </div>
  );
};
