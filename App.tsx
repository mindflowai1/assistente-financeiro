import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';

// Lazy loading das páginas para melhor performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const LoginPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(module => ({ default: module.AccountPage })));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage').then(module => ({ default: module.SubscriptionPage })));
const LimitsPage = lazy(() => import('./pages/LimitsPage').then(module => ({ default: module.LimitsPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));

// Loading component otimizado
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      <p className="text-gray-400 text-sm">Carregando...</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        
        {/* Rotas protegidas agora usam o AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/limits" element={<LimitsPage />} />
          </Route>
          {/* A página de redefinição de senha fica fora do layout principal */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
