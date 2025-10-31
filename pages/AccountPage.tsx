import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export const AccountPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [phone, setPhone] = useState('');
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

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

  useEffect(() => {
    const loadPhone = async () => {
      if (!user?.id) return;
      setLoadingPhone(true);
      setPhoneMessage(null);
      setPhoneError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .maybeSingle();
        if (error) throw error;
        const initial = (data?.phone as string | null) ?? (userMetadata?.phone as string | null) ?? '';
        setPhone(initial);
      } catch (e: any) {
        setPhoneError('Não foi possível carregar o telefone.');
        setPhone((userMetadata?.phone as string | null) ?? '');
      } finally {
        setLoadingPhone(false);
      }
    };
    loadPhone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSavePhone = async () => {
    if (!user?.id) return;
    setSavingPhone(true);
    setPhoneMessage(null);
    setPhoneError(null);

    const trimmed = phone.trim();
    let digits = trimmed.replace(/\D/g, '');
    // Garantir código do país (55) na frente
    if (!digits.startsWith('55')) {
      digits = `55${digits}`;
    }
    // Se vier com 13 dígitos (9 extra de celular), remover o 5º dígito
    if (digits.length === 13 && digits[4] === '9') {
      digits = digits.slice(0, 4) + digits.slice(5);
    }
    // Validação final: exatamente 12 dígitos (55 + DDD(2) + número(8))
    if (digits.length !== 12) {
      setPhoneError('Telefone inválido. Use país + DDD + número (ex: 553199766846).');
      setSavingPhone(false);
      return;
    }

    try {
      // Atualiza e verifica se houve linha afetada
      const { data: updData, error: updError } = await supabase
        .from('profiles')
        .update({ phone: digits })
        .eq('id', user.id)
        .select('id');
      if (updError) throw updError;
      if (!updData || updData.length === 0) {
        // Se não existir registro, tenta inserir
        const { error: insError } = await supabase
          .from('profiles')
          .insert({ id: user.id, phone: digits });
        if (insError) throw insError;
      }
      setPhone(digits);
      setPhoneMessage('Telefone atualizado com sucesso.');
    } catch (e: any) {
      const code = e?.code as string | undefined;
      const message = (e?.message as string | undefined) || '';
      if (code === '23505' || /duplicate key value|unique/i.test(message)) {
        setPhoneError('Este telefone já está em uso por outro usuário.');
      } else if (/permission denied|rls|row level/i.test(message)) {
        setPhoneError('Permissão negada para salvar. Entre em contato com o suporte.');
      } else {
        setPhoneError('Falha ao salvar o telefone. Tente novamente.');
      }
    } finally {
      setSavingPhone(false);
    }
  };

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
                <p className={`text-md ${textMutedClass}`}>Telefone <span className="text-xs">(sem o 9 extra)</span>:</p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex.: 553199766846"
                      disabled={loadingPhone || savingPhone}
                      className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100 focus:border-green-500 focus:ring-green-500/50' : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500'}`}
                      aria-label="Telefone"
                    />
                  </div>
                  <div>
                    <button
                      onClick={handleSavePhone}
                      disabled={loadingPhone || savingPhone}
                      className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {savingPhone && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      )}
                      {savingPhone ? 'Salvando...' : 'Salvar Telefone'}
                    </button>
                  </div>
                </div>
                <div className="min-h-[24px] mt-2">
                  {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
                  {!phoneError && phoneMessage && <p className="text-green-500 text-sm">{phoneMessage}</p>}
                </div>
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
