import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('🔒 [ProtectedRoute] Estado atual:', { 
    loading, 
    hasUser: !!user,
    userId: user?.id 
  });

  if (loading) {
    console.log('⏳ [ProtectedRoute] Aguardando autenticação...');
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (user) {
    console.log('✅ [ProtectedRoute] Usuário autenticado, permitindo acesso');
    return <Outlet />;
  } else {
    console.log('🚫 [ProtectedRoute] Usuário não autenticado, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }
};