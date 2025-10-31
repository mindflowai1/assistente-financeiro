import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
      <button
        onClick={toggleTheme}
        className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-green-600 focus:ring-green-500 focus:ring-offset-gray-800' : 'bg-gray-300 focus:ring-green-600 focus:ring-offset-white'
        }`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <span
          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          {/* Sun Icon */}
          <svg className={`h-4 w-4 text-yellow-500 transition-opacity duration-300 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 110-10 5 5 0 010 10z" />
          </svg>
          {/* Moon Icon */}
          <svg className={`h-4 w-4 text-indigo-500 absolute transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </span>
      </button>
    );
};

export const AppLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/account': 'Minha Conta',
    '/subscription': 'Minha Assinatura',
    '/limits': 'Meus Limites',
  };

  const currentPageTitle = pageTitles[location.pathname] || 'Página';

  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 150); // Duração da animação de fechamento
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    if (isLoggingOut) {
      console.log('⚠️ [AppLayout] Logout já em andamento, ignorando clique duplicado');
      return;
    }

    console.log('🚪 [AppLayout] Botão de logout clicado');
    setIsLoggingOut(true);
    handleCloseMenu();
    
    try {
      console.log('⏳ [AppLayout] Chamando função signOut...');
      await signOut();
      console.log('✅ [AppLayout] signOut completado, navegando para /');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ [AppLayout] Erro ao fazer logout:', error);
      setIsLoggingOut(false);
    }
  };

  const userInitials = user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
  
  const mainContainerClass = theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const menuDropdownClass = theme === 'dark' ? 'bg-gray-700 ring-gray-600' : 'bg-white ring-black';
  const menuItemClass = (path: string) => {
    const baseClass = theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100';
    const activeClass = theme === 'dark' ? 'bg-green-600/50 text-white' : 'bg-green-100 text-green-700';
    return `block w-full text-left px-4 py-2 text-sm rounded-md ${location.pathname === path ? activeClass : baseClass}`;
  };
  const desktopMenuItemClass = (path: string) => {
    const baseClass = theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black';
    const activeClass = 'text-green-500 font-semibold';
    return `py-2 px-3 rounded-lg font-medium transition-colors ${location.pathname === path ? activeClass : baseClass}`;
  };

  return (
    <div className={`min-h-screen ${mainContainerClass} transition-colors duration-300`}>
      <header className={`sticky top-0 z-10 border-b ${theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-sm`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
               <Link to="/dashboard">
                 <img 
                  src="https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/logo%20assistente%20fav%20ico.png?alt=media&token=1df1410a-edad-41d8-8811-f156150788f8"
                  alt="Logo"
                  className="h-10 w-10"
                 />
               </Link>
              <h1 className="text-xl font-bold text-green-600 hidden sm:block">{currentPageTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Menu */}
              <nav className="hidden md:flex items-center gap-2">
                <Link to="/dashboard" className={desktopMenuItemClass('/dashboard')}>Dashboard</Link>
                <Link to="/account" className={desktopMenuItemClass('/account')}>Minha Conta</Link>
                <Link to="/subscription" className={desktopMenuItemClass('/subscription')}>Assinatura</Link>
                <Link to="/limits" className={desktopMenuItemClass('/limits')}>Limites</Link>
              </nav>
              
              <div className="hidden md:block">
                 <ThemeSwitcher />
              </div>

              {/* Mobile Menu Trigger */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 btn-menu-pulse transition-transform duration-200 hover:scale-110"
                >
                  {userInitials}
                </button>
                {isMenuOpen && (
                  <div 
                    className={`origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg ring-1 ring-opacity-5 z-20 p-2 ${menuDropdownClass} ${isClosing ? 'animate-menu-out' : 'animate-menu-in'}`}
                  >
                    {/* Header do usuário com animação */}
                    <div className="px-2 py-3 animate-menu-item" style={{ animationDelay: '0.05s' }}>
                        <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{user?.user_metadata?.full_name || 'Usuário'}</p>
                        <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                    </div>
                    
                    {/* Theme switcher com animação */}
                    <div className="md:hidden flex items-center justify-between px-2 py-2 animate-menu-item" style={{ animationDelay: '0.1s' }}>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tema</span>
                        <ThemeSwitcher />
                    </div>
                    
                    <div className={`my-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} animate-menu-item`} style={{ animationDelay: '0.15s' }}></div>
                    
                    {/* Menu items com stagger animation */}
                    <nav className="space-y-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <Link 
                        to="/dashboard" 
                        onClick={handleCloseMenu} 
                        className={`${menuItemClass('/dashboard')} animate-menu-item menu-item-hover`}
                        style={{ animationDelay: '0.2s' }}
                        role="menuitem"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/account" 
                        onClick={handleCloseMenu} 
                        className={`${menuItemClass('/account')} animate-menu-item menu-item-hover`}
                        style={{ animationDelay: '0.25s' }}
                        role="menuitem"
                      >
                        Minha Conta
                      </Link>
                      <Link 
                        to="/subscription" 
                        onClick={handleCloseMenu} 
                        className={`${menuItemClass('/subscription')} animate-menu-item menu-item-hover`}
                        style={{ animationDelay: '0.3s' }}
                        role="menuitem"
                      >
                        Assinatura
                      </Link>
                      <Link 
                        to="/limits" 
                        onClick={handleCloseMenu} 
                        className={`${menuItemClass('/limits')} animate-menu-item menu-item-hover`}
                        style={{ animationDelay: '0.35s' }}
                        role="menuitem"
                      >
                        Limites
                      </Link>
                    </nav>
                    
                    <div className={`my-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} animate-menu-item`} style={{ animationDelay: '0.4s' }}></div>
                    
                    {/* Botão de logout com animação */}
                    <button 
                      onClick={handleSignOut} 
                      disabled={isLoggingOut}
                      className={`block w-full text-left px-4 py-2 text-sm rounded-md flex items-center animate-menu-item menu-item-hover ${theme === 'dark' ? 'text-red-400 hover:bg-red-500/20 disabled:text-red-300 disabled:cursor-not-allowed' : 'text-red-600 hover:bg-red-100 disabled:text-red-400 disabled:cursor-not-allowed'}`} 
                      style={{ animationDelay: '0.45s' }}
                      role="menuitem"
                    >
                      {isLoggingOut && (
                        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
};