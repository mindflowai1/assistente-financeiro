import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';

type SubscriptionStatus = 'Ativa' | 'Inativa' | 'Pendente';
type PlanType = 'Plano Individual' | 'Plano Dupla';

const statusConfig: { [key in SubscriptionStatus]: { color: string; bgColor: string; message: string } } = {
  Ativa: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    message: 'Obrigado por ser um assinante! Você tem acesso a todos os recursos premium.',
  },
  Inativa: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    message: 'Sua assinatura não está ativa. Assine agora para ter acesso a todos os recursos exclusivos e potenciar sua gestão financeira.',
  },
  Pendente: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
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
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanType>('Plano Individual');
  const [loadingStatus, setLoadingStatus] = useState(true);
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
      // Erro ao ler dados do localStorage - silencioso
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

  // Função para buscar dados da assinatura diretamente do Supabase
  const fetchSubscriptionDataFromDatabase = async () => {
    if (!user?.id) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires_at, plan')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Erro ao buscar dados do perfil:', profileError);
        return;
      }

      if (profileData) {
        // Mapear status do banco para o status da UI
        const dbStatus = profileData.subscription_status;
        if (dbStatus === 'paid') {
          setStatus('Ativa');
        } else if (dbStatus === 'pending') {
          setStatus('Pendente');
        } else {
          setStatus('Inativa');
        }

        // Definir data de expiração
        if (profileData.subscription_expires_at) {
          setSubscriptionPeriod(profileData.subscription_expires_at);
        }

        // Definir tipo de plano
        if (profileData.plan === 'family') {
          setPlanType('Plano Dupla');
        } else {
          setPlanType('Plano Individual');
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados da assinatura:', err);
    }
  };

  const handleFetchStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    setStatus(null);
    setSubscriptionPeriod(null);
    setPlanType('Plano Individual');

    if (!user?.id) {
      setError("Não foi possível obter a identificação do usuário. Tente fazer login novamente.");
      setLoadingStatus(false);
      return;
    }

    try {
      // Buscar dados diretamente do Supabase
      await fetchSubscriptionDataFromDatabase();
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
              
              {/* Display plan type and validity */}
              <div className="mt-6 space-y-3">
                <div className={`p-4 rounded-lg ${validityInfoClass}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tipo de Plano
                  </p>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    {planType}
                  </p>
                </div>
                
                {subscriptionPeriod && (
                  <div className={`p-4 rounded-lg ${validityInfoClass}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {status === 'Ativa' && 'Validade da Assinatura'}
                      {status === 'Pendente' && 'Data Prevista de Ativação'}
                      {status === 'Inativa' && 'Última Data de Expiração'}
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                      {formatDate(subscriptionPeriod)}
                    </p>
                  </div>
                )}
              </div>

              {['Inativa', 'Pendente'].includes(status) && (
                <div className="pt-6">
                  <a 
                    href={checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block py-3 px-8 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out text-lg shadow-lg hover:shadow-xl"
                  >
                    {status === 'Pendente' ? 'Verificar Pagamento' : 'Assinar Agora'}
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
