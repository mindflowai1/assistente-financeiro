import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';

// Lazy loading das páginas para melhor performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LandingPageNoNav = lazy(() => import('./pages/LandingPageNoNav').then(module => ({ default: module.LandingPageNoNav })));
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
        <Route path="/trafego" element={<LandingPageNoNav />} />
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

const GlobalTracking: React.FC = () => {
  const initializedRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const ensureClarity = () => {
      if ((window as any).clarity) return;
      (function(c: any, l: Document, a: any, r: any, i: string, t?: HTMLScriptElement, y?: Element) {
        c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r) as HTMLScriptElement; t.async = true; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; (y!.parentNode as Node).insertBefore(t, y!);
      })(window as any, document, "clarity", "script", "tvtr3pe7ua");
    };

    const ensureFacebookPixel = () => {
      if ((window as any).fbq) {
        try {
          (window as any).fbq('init', '1513614419906000');
          (window as any).fbq('init', '1621531598314509');
        } catch {}
        return;
      }
      (function(f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: Element){
        if (f.fbq) return; n = f.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        t = b.createElement(e) as HTMLScriptElement; t.async = true; t.src = v; s = b.getElementsByTagName(e)[0]; (s!.parentNode as Node).insertBefore(t, s!);
      })((window as any), document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      try {
        (window as any).fbq('init', '1513614419906000');
        (window as any).fbq('init', '1621531598314509');
      } catch {}
    };

    const ensureTikTok = () => {
      if ((window as any).ttq) return;
      (function (w: any, d: Document, t: string) {
        w.TiktokAnalyticsObject = t;
        const ttq = w[t] = w[t] || [];
        ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
        ttq.setAndDefer = function(obj: any, method: string) { obj[method] = function() { obj.push([method].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function(id: string) { const e = ttq._i[id] || []; for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
        ttq.load = function(id: string, opts?: any) {
          const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {}; ttq._i[id] = []; ttq._i[id]._u = r;
          ttq._t = ttq._t || {}; ttq._t[id] = +new Date;
          ttq._o = ttq._o || {}; ttq._o[id] = opts || {};
          const n = d.createElement("script"); n.type = "text/javascript"; n.async = true; n.src = r + "?sdkid=" + id + "&lib=" + t;
          const s = d.getElementsByTagName("script")[0]; (s!.parentNode as Node).insertBefore(n, s!);
        };
      })((window as any), document, 'ttq');
      try { (window as any).ttq.load('D401QTJC77UACP40867G'); } catch {}
    };

    const onLoad = () => {
      ensureClarity();
      ensureFacebookPixel();
      ensureTikTok();
      try { (window as any).fbq && (window as any).fbq('track', 'PageView'); } catch {}
      try { (window as any).ttq && (window as any).ttq.page(); } catch {}
      try { (window as any).clarity && (window as any).clarity('event', 'PageView'); } catch {}
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    return () => {
      window.removeEventListener('load', onLoad as any);
    };
  }, []);

  useEffect(() => {
    try { (window as any).fbq && (window as any).fbq('track', 'PageView'); } catch {}
    try { (window as any).ttq && (window as any).ttq.page(); } catch {}
    try { (window as any).clarity && (window as any).clarity('event', 'route_change'); } catch {}
  }, [location.pathname, location.search, location.hash]);

  return null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <GlobalTracking />
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
