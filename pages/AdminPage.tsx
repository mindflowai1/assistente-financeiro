import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';

interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    name: string | null;
    phone: string | null;
    phone_2?: string | null;
    subscription_status: string | null;
    subscription_expires_at: string | null;
    plan: string | null;
    created_at: string;
}

export const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Profile>>({});
    const [saveLoading, setSaveLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
    const subTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const inputClass = theme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-green-500'
        : 'bg-white border-gray-300 text-gray-900 focus:border-green-500';

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            // First, check if user is actually an admin by trying to fetch all profiles
            // The RLS policy "Admins can view all profiles" will determine access
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Merge with email from auth.users (if possible, but usually not accessible directly via client)
            // Since profiles table might not have email, we might need to rely on what's there.
            // NOTE: The profiles table usually doesn't store plain emails unless synced. 
            // In this system, it seems emails might not be in the profiles table based on the schema seen earlier.
            // Wait, let's check the schema again... 'email' column exists in profiles schema check earlier:
            // [{"name":"email","data_type":"text","format":"text","options":["updatable"]}]
            // so we are good.

            setProfiles(data || []);
        } catch (e: any) {
            console.error('Error fetching profiles:', e);
            setError('Acesso negado ou erro ao buscar usuários. Verifique se você é administrador.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (profile: Profile) => {
        setEditingId(profile.id);
        setEditForm({
            phone: profile.phone,
            phone_2: profile.phone_2,
            subscription_status: profile.subscription_status,
            subscription_expires_at: profile.subscription_expires_at,
            plan: profile.plan
        });
    };

    const handleSave = async (id: string) => {
        setSaveLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update(editForm)
                .eq('id', id);

            if (error) throw error;

            setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...editForm } : p));
            setEditingId(null);
        } catch (e: any) {
            alert('Erro ao atualizar usuário: ' + e.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const filteredProfiles = profiles.filter(p => {
        const search = searchTerm.toLowerCase();
        return (
            (p.name?.toLowerCase() || '').includes(search) ||
            (p.full_name?.toLowerCase() || '').includes(search) ||
            (p.email?.toLowerCase() || '').includes(search) ||
            (p.phone?.toLowerCase() || '').includes(search)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-500">
                <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border ${cardClass}`}>
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-2xl font-bold ${textClass}`}>Painel Administrativo</h1>
                <div className="text-sm">Total: {profiles.length} usuários</div>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${inputClass}`}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={subTextClass}>
                            <th className="p-3 border-b border-gray-700">Nome / Email</th>
                            <th className="p-3 border-b border-gray-700">Telefone</th>
                            <th className="p-3 border-b border-gray-700">Telefone Secundário</th>
                            <th className="p-3 border-b border-gray-700">Status Assinatura</th>
                            <th className="p-3 border-b border-gray-700">Vencimento</th>
                            <th className="p-3 border-b border-gray-700">Plano</th>
                            <th className="p-3 border-b border-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProfiles.map(profile => (
                            <tr key={profile.id} className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <td className={`p-3 ${textClass}`}>
                                    <div className="font-semibold">{profile.name || profile.full_name || 'Sem nome'}</div>
                                    <div className={`text-sm ${subTextClass}`}>{profile.email || 'Sem email'}</div>
                                    <div className="text-xs text-gray-500">{profile.id}</div>
                                </td>

                                <td className="p-3">
                                    {editingId === profile.id ? (
                                        <input
                                            type="text"
                                            val={editForm.phone || ''}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className={`p-2 rounded w-full ${inputClass}`}
                                        />
                                    ) : (
                                        <span className={textClass}>{profile.phone || '-'}</span>
                                    )}
                                </td>

                                <td className="p-3">
                                    {editingId === profile.id ? (
                                        <input
                                            type="text"
                                            value={editForm.phone_2 || ''}
                                            onChange={(e) => setEditForm({ ...editForm, phone_2: e.target.value })}
                                            disabled={editForm.plan !== 'family'}
                                            placeholder={editForm.plan === 'family' ? 'Telefone Secundário' : 'Apenas Plano Família'}
                                            className={`p-2 rounded w-full ${inputClass} ${editForm.plan !== 'family' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    ) : (
                                        <span className={textClass}>{profile.phone_2 || '-'}</span>
                                    )}
                                </td>

                                <td className="p-3">
                                    {editingId === profile.id ? (
                                        <select
                                            value={editForm.subscription_status || ''}
                                            onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value })}
                                            className={`p-2 rounded w-full ${inputClass}`}
                                        >
                                            <option value="active">Active (Pago)</option>
                                            <option value="paid">Paid</option>
                                            <option value="pending">Pending</option>
                                            <option value="canceled">Canceled</option>
                                            <option value="expired">Expired</option>
                                            <option value="">Nenhum</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${['active', 'paid'].includes(profile.subscription_status || '')
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {profile.subscription_status || 'Inativo'}
                                        </span>
                                    )}
                                </td>

                                <td className="p-3">
                                    {editingId === profile.id ? (
                                        <input
                                            type="date"
                                            value={editForm.subscription_expires_at || ''}
                                            onChange={(e) => setEditForm({ ...editForm, subscription_expires_at: e.target.value })}
                                            className={`p-2 rounded w-full ${inputClass}`}
                                        />
                                    ) : (
                                        <span className={textClass}>
                                            {profile.subscription_expires_at
                                                ? new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                                                : '-'}
                                        </span>
                                    )}
                                </td>

                                <td className="p-3">
                                    {editingId === profile.id ? (
                                        <select
                                            value={editForm.plan || ''}
                                            onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                                            className={`p-2 rounded w-full ${inputClass}`}
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="family">Dupla</option>
                                            <option value="">Nenhum</option>
                                        </select>
                                    ) : (
                                        <span className={textClass}>{profile.plan || '-'}</span>
                                    )}
                                </td>

                                <td className="p-3">
                                    {editingId === profile.id ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSave(profile.id)}
                                                disabled={saveLoading}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                            >
                                                {saveLoading ? '...' : 'Salvar'}
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(profile)}
                                            className="px-3 py-1 text-blue-500 hover:text-blue-400 font-medium text-sm"
                                        >
                                            Editar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProfiles.length === 0 && (
                    <p className="text-center p-8 text-gray-500">Nenhum usuário encontrado.</p>
                )}
            </div>
        </div>
    );
};
