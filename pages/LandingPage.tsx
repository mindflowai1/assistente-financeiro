import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-5 px-2 focus:outline-none"
            >
                <span className="text-lg font-medium text-gray-200">{question}</span>
                <svg
                    className={`w-6 h-6 text-green-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="p-4 pt-0 text-gray-400">
                    {children}
                </div>
            </div>
        </div>
    );
};

const features = [
  {
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>,
    title: 'Áudio Inteligente',
    description: 'Na correria? Mande um áudio. Nossa IA transcreve, identifica o gasto, o valor e registra tudo para você.',
    exampleText: 'Diga "paguei 50 reais no almoço" e veja a mágica acontecer. Praticidade que fala, né?',
    mockupImage: 'https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/audio-giff.gif?alt=media&token=003f829b-41a7-43fb-b7ff-c82da27f733f',
  },
  {
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
    title: 'Leitor de Imagens',
    description: 'Fotografe suas notas fiscais ou comprovantes. Extraímos automaticamente a descrição e o valor.',
    exampleText: 'Chega de guardar papel! Uma foto da sua nota do supermercado é o suficiente para registrar a despesa.',
    mockupImage: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMm1scXNxdHA5MjJidm55MTZnOWQ4MXBla2kyMjBjYWxlM2ZyanhiciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f3P4jhIhObWEDgpuXr/giphy.gif',
  },
  {
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>,
    title: 'Consulta em Tempo Real',
    description: 'Pergunte sobre seus gastos a qualquer momento e receba respostas instantâneas no seu WhatsApp.',
    exampleText: 'Na dúvida se pode gastar? Pergunte "Qual meu saldo?" e tenha a resposta na hora.',
    mockupImage: 'https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/limites-giff.gif?alt=media&token=77ab47d4-d5e4-4dbb-9444-d034bf800394',
  },
  {
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
    title: 'Registro Instantâneo',
    description: 'Seus gastos aparecem no painel no momento em que você envia a mensagem.',
    exampleText: 'Enviou, registrou. Sem atrasos, sem esperas. Suas finanças atualizadas em tempo real, prontas para consultar.',
    mockupImage: 'https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/dashboard-giff.gif?alt=media&token=f6ababde-6d1a-48b1-b41e-26e99d9de9d5',
  }
];

export const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [gifsLoaded, setGifsLoaded] = useState<Set<number>>(new Set());
  const [shouldLoadGifs, setShouldLoadGifs] = useState(false);
  const featureSectionRef = React.useRef<HTMLElement>(null);
  const [showPreCheckout, setShowPreCheckout] = useState(false);
  const [preName, setPreName] = useState("");
  const [preEmail, setPreEmail] = useState("");
  const [prePhone, setPrePhone] = useState("");
  const [submittingPre, setSubmittingPre] = useState(false);

  const checkoutUrl = "https://payfast.greenn.com.br/140026";
  const handleOpenPreCheckout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowPreCheckout(true);
  };
  const submitPreCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizePhone = (v: string) => v.replace(/\D+/g, '');
    const params = new URLSearchParams({
      'name-field': preName || '',
      'email-field': preEmail || '',
      'cellphone-field': normalizePhone(prePhone || ''),
    });
    const dest = `${checkoutUrl}?${params.toString()}`;
    if (!preEmail || !prePhone) {
      window.location.href = dest;
      return;
    }
    setSubmittingPre(true);
    try {
      const t0 = performance.now();
      const resp = await fetch('/api/checkout-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: preEmail, name: preName, phone: prePhone, source: 'landing', plan: 'plano-completo' })
      });
      const elapsed = Math.round(performance.now() - t0);
      let data: any = null;
      try { data = await resp.json(); } catch {}
      console.log('checkout-start result', { status: resp.status, ok: resp.ok, elapsedMs: elapsed, data });
    } catch (err) {
      // no-op
    } finally {
      window.location.href = dest;
    }
  };

  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 200); // Duração da animação de fechamento
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = window.innerWidth < 768 ? 128 : 160;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      handleCloseMenu(); // Close mobile menu with animation
    }
  };

  const handleNextFeature = () => {
    setActiveFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
  };

  const handlePrevFeature = () => {
    setActiveFeatureIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadGifs(true);
            // Pré-carregar apenas o GIF ativo
            const img = new Image();
            img.src = features[activeFeatureIndex].mockupImage;
            setGifsLoaded(new Set([activeFeatureIndex]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '200px' } // Trigger 200px antes de entrar na viewport
    );

    if (featureSectionRef.current) {
      observer.observe(featureSectionRef.current);
    }

    return () => observer.disconnect();
  }, [activeFeatureIndex]);

  useEffect(() => {
    if (shouldLoadGifs && !gifsLoaded.has(activeFeatureIndex)) {
      const img = new Image();
      img.src = features[activeFeatureIndex].mockupImage;
      setGifsLoaded(prev => new Set([...prev, activeFeatureIndex]));
    }
  }, [activeFeatureIndex, shouldLoadGifs, gifsLoaded]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 transition-colors duration-300">
      <header className="bg-gray-900/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-24 md:h-40">
            <div className="flex-shrink-0">
              <Link to="/">
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/seu%20assistente%20financeiro%20sem%20fundo.png?alt=media&token=01d3c41a-a247-43fb-8823-452e9161a37d" 
                  alt="Seu Assistente Financeiro" 
                  className="h-36 md:h-40 w-auto"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width="200"
                  height="200"
                />
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
                <nav className="flex space-x-8">
                  <a href="#inicio" onClick={(e) => handleNavClick(e, 'inicio')} className="font-medium text-gray-400 hover:text-green-500 transition-colors duration-200">Início</a>
                  <a href="#funcionalidades" onClick={(e) => handleNavClick(e, 'funcionalidades')} className="font-medium text-gray-400 hover:text-green-500 transition-colors duration-200">Funcionalidades</a>
                  <a href="#recursos" onClick={(e) => handleNavClick(e, 'recursos')} className="font-medium text-gray-400 hover:text-green-500 transition-colors duration-200">Recursos</a>
                  <a href="#como-usar" onClick={(e) => handleNavClick(e, 'como-usar')} className="font-medium text-gray-400 hover:text-green-500 transition-colors duration-200">Como Usar</a>
                  <a href="#planos" onClick={(e) => handleNavClick(e, 'planos')} className="font-medium text-gray-400 hover:text-green-500 transition-colors duration-200">Plano</a>
                  <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="font-medium text-gray-400 hover:text-green-500 transition-colors duration-200">Dúvidas</a>
                </nav>
                <div className="flex items-center gap-4">
                  <Link
                      to="/login"
                      className="py-2 px-5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out"
                  >
                      Acessar Plataforma
                  </Link>
                </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => isMenuOpen ? handleCloseMenu() : setIsMenuOpen(true)}
                type="button"
                className="ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 btn-menu-pulse transition-all duration-200"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Abrir menu principal</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {isMenuOpen && (
          <div
            className={`md:hidden bg-gray-900/95 ${isClosing ? 'animate-mobile-menu-out' : 'animate-mobile-menu-in'}`}
            id="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#inicio"
                onClick={(e) => handleNavClick(e, 'inicio')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:translate-x-1"
                style={{ animationDelay: '0.05s' }}
              >
                Início
              </a>
              <a
                href="#funcionalidades"
                onClick={(e) => handleNavClick(e, 'funcionalidades')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:translate-x-1"
                style={{ animationDelay: '0.1s' }}
              >
                Funcionalidades
              </a>
              <a
                href="#recursos"
                onClick={(e) => handleNavClick(e, 'recursos')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:translate-x-1"
                style={{ animationDelay: '0.15s' }}
              >
                Recursos
              </a>
              <a
                href="#como-usar"
                onClick={(e) => handleNavClick(e, 'como-usar')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:translate-x-1"
                style={{ animationDelay: '0.2s' }}
              >
                Como Usar
              </a>
              <a
                href="#planos"
                onClick={(e) => handleNavClick(e, 'planos')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:translate-x-1"
                style={{ animationDelay: '0.25s' }}
              >
                Planos
              </a>
              <a
                href="#faq"
                onClick={(e) => handleNavClick(e, 'faq')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:translate-x-1"
                style={{ animationDelay: '0.3s' }}
              >
                Dúvidas
              </a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="px-5">
                    <Link
                        to="/login"
                        onClick={handleCloseMenu}
                        className="block text-center w-full py-2 px-5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105"
                    >
                        Acessar Plataforma
                    </Link>
                </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-0">
        {showPreCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowPreCheckout(false)}></div>
            <div className="relative w-full max-w-md mx-auto bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-1 text-center">Comece sua inscrição aqui</h3>
              <p className="text-sm text-gray-400 mb-6 text-center">Preencha seus dados para avançar</p>
              <form onSubmit={submitPreCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nome</label>
                  <input value={preName} onChange={(e) => setPreName(e.target.value)}
                         type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Seu nome" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">E-mail</label>
                  <input value={preEmail} onChange={(e) => setPreEmail(e.target.value)}
                         type="email" required className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="voce@email.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">WhatsApp</label>
                  <input value={prePhone} onChange={(e) => setPrePhone(e.target.value)}
                         type="tel" required className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="(11) 99999-9999" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setShowPreCheckout(false)}
                          className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700 transition-colors">Cancelar</button>
                  <button type="submit" disabled={submittingPre}
                          className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-60">
                    {submittingPre ? 'Enviando...' : 'Continuar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section id="inicio" className="pt-32 md:pt-48 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                  A revolução da sua vida financeira começa no <span className="text-green-500">WhatsApp</span>.
                </h1>
                <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto md:mx-0">
                   Use a praticidade do seu app de mensagens favorito para registrar gastos através do Seu Assistente Financeiro. Acompanhe tudo em painéis simples e personalizados.
                </p>
                <a
                    href="#planos"
                    onClick={(e) => handleNavClick(e, 'planos')}
                    className="hidden md:inline-block py-3 px-8 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out text-lg"
                >
                    Comece agora
                </a>

                {/* Mobile Mockup - Visible on small screens */}
                <div className="block md:hidden mt-12">
                    <div className="relative mx-auto border-gray-700 bg-gray-800 border-[8px] rounded-[2.5rem] h-[450px] w-[225px] shadow-xl">
                        <div className="absolute top-0 w-[100px] h-5 bg-gray-800 rounded-b-lg left-1/2 -translate-x-1/2 z-10"></div>
                        <div className="h-[34px] w-[2px] bg-gray-700 absolute -left-[10px] top-[90px] rounded-l-lg"></div>
                        <div className="h-[34px] w-[2px] bg-gray-700 absolute -left-[10px] top-[130px] rounded-l-lg"></div>
                        <div className="h-[48px] w-[2px] bg-gray-700 absolute -right-[10px] top-[105px] rounded-r-lg"></div>

                        <div className="w-full h-full overflow-hidden rounded-[2rem] bg-gray-900 flex flex-col pt-6">
                            <div className="bg-gray-800/80 backdrop-blur-sm p-1.5 flex items-center gap-2 flex-shrink-0">
                            <img 
                                src="https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/logo%20assistente%20wpp.png?alt=media&token=af5e05b2-25c9-4641-87b9-fc8961a6a251" 
                                alt="Foto de perfil do assistente"
                                className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                                loading="eager"
                            />
                                <div>
                                    <p className="text-xs font-semibold text-gray-200">Seu Assistente Financeiro</p>
                                    <p className="text-[10px] text-green-500">online</p>
                                </div>
                            </div>
                            <div className="p-2 flex-grow overflow-y-auto flex flex-col justify-end">
                                <div className="w-full space-y-2">
                                    {/* Message 1 - User */}
                                    <div className="flex justify-end">
                                        <div className="bg-green-600 text-white rounded-l-lg rounded-br-lg p-1.5 max-w-[80%]">
                                            <p className="text-xs">Oi! Gastei R$ 54,90 no supermercado.</p>
                                        </div>
                                    </div>
                                    {/* Message 2 - Bot */}
                                    <div className="flex justify-start">
                                        <div className="bg-gray-700 rounded-r-lg rounded-bl-lg p-1.5 max-w-[80%]">
                                            <p className="text-xs text-gray-200">Registrado! R$54,90 na categoria 'Alimentação'. 👍</p>
                                        </div>
                                    </div>
                                    {/* Message 3 - User (Audio) */}
                                    <div className="flex justify-end">
                                        <div className="bg-green-600 rounded-l-lg rounded-br-lg p-1.5 max-w-[80%] w-36">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                                                <div className="flex-grow h-0.5 bg-green-400/50 rounded-full flex items-center">
                                                    <div className="w-2/3 h-0.5 bg-white rounded-full"></div>
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                                <span className="text-xs font-mono text-white">0:05</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Message 4 - Bot */}
                                    <div className="flex justify-start">
                                        <div className="bg-gray-700 rounded-r-lg rounded-bl-lg p-1.5 max-w-[80%]">
                                            <p className="text-xs text-gray-200">Entendido. Gasto de R$35,00 com 'Transporte' adicionado. Precisa de mais alguma coisa?</p>
                                        </div>
                                    </div>
                                     {/* Message 5 - User */}
                                    <div className="flex justify-end">
                                        <div className="bg-green-600 text-white rounded-l-lg rounded-br-lg p-1.5 max-w-[80%]">
                                            <p className="text-xs">Me mostra um resumo dos meus gastos?</p>
                                        </div>
                                    </div>
                                    {/* Message 6 - Bot (List) */}
                                    <div className="flex justify-start">
                                        <div className="bg-gray-700 rounded-r-lg rounded-bl-lg p-1.5 max-w-[80%] space-y-1">
                                            <p className="text-xs text-gray-200">Claro! Aqui está o resumo:</p>
                                            <div className="text-[10px] space-y-1 font-mono bg-gray-800/50 p-1.5 rounded-md">
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Supermercado:</span>
                                                    <span>R$ 54,90</span>
                                                </div>
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Transporte:</span>
                                                    <span>R$ 35,00</span>
                                                </div>
                                                <div className="border-t border-gray-600 my-1"></div>
                                                <div className="flex justify-between font-bold text-gray-100">
                                                    <span>TOTAL:</span>
                                                    <span>R$ 89,90</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800/80 p-1.5 flex items-center gap-1.5 flex-shrink-0">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                                <div className="flex-grow h-6 bg-gray-700 rounded-full text-xs text-gray-500 px-2 flex items-center">Digite...</div>
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <a
                    href="#planos"
                    onClick={(e) => handleNavClick(e, 'planos')}
                    className="inline-block md:hidden mt-8 py-3 px-8 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out text-lg"
                >
                    Comece agora
                </a>

                <div className="mt-12 space-y-6 text-left">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-gray-800 rounded-full p-2">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-200">Praticidade Total</h3>
                            <p className="text-gray-400">Envie uma mensagem, seja por texto ou áudio, e registre um gasto. Simples assim, direto do seu celular no WhatsApp.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-gray-800 rounded-full p-2">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-200">Personalizado</h3>
                            <p className="text-gray-400">Estabeleça limite de gastos de acordo com as categorias mais importantes e seja avisado quando estiver chegando no limite do mês.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-gray-800 rounded-full p-2">
                           <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-200">Painéis Visuais</h3>
                            <p className="text-gray-400">Gráficos e relatórios para uma visão clara e completa de onde seu dinheiro está indo.</p>
                        </div>
                    </div>
                </div>
              </div>
              <div className="hidden md:block">
                 {/* iPhone Mockup Frame */}
                 <div className="relative mx-auto border-gray-700 bg-gray-800 border-[8px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                    {/* Notch */}
                    <div className="absolute top-0 w-[140px] h-7 bg-gray-800 rounded-b-xl left-1/2 -translate-x-1/2 z-10"></div>
                    {/* Side buttons */}
                    <div className="h-[46px] w-[3px] bg-gray-700 absolute -left-[11px] top-[124px] rounded-l-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-700 absolute -left-[11px] top-[178px] rounded-l-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-700 absolute -right-[11px] top-[142px] rounded-r-lg"></div>

                    {/* Screen Content */}
                    <div className="w-full h-full overflow-hidden rounded-[2rem] bg-gray-900 flex flex-col pt-8">
                        {/* Chat Header */}
                        <div className="bg-gray-800/80 backdrop-blur-sm p-2 flex items-center gap-3 flex-shrink-0">
                            <img 
                                src="https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/logo%20assistente%20wpp.png?alt=media&token=af5e05b2-25c9-4641-87b9-fc8961a6a251" 
                                alt="Foto de perfil do assistente"
                                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                                loading="eager"
                            />
                            <div>
                                <p className="text-sm font-semibold text-gray-200">Seu Assistente Financeiro</p>
                                <p className="text-xs text-green-500">online</p>
                            </div>
                        </div>
                        {/* Chat Body */}
                        <div className="p-3 flex-grow overflow-y-auto flex flex-col justify-end">
                            <div className="w-full space-y-3">
                                {/* Message 1 - User */}
                                <div className="flex justify-end">
                                    <div className="bg-green-600 text-white rounded-l-lg rounded-br-lg p-2 max-w-[80%]">
                                        <p className="text-sm">Oi! Gastei R$ 54,90 no supermercado.</p>
                                    </div>
                                </div>
                                {/* Message 2 - Bot */}
                                <div className="flex justify-start">
                                    <div className="bg-gray-700 rounded-r-lg rounded-bl-lg p-2 max-w-[80%]">
                                        <p className="text-sm text-gray-200">Registrado! R$54,90 na categoria 'Alimentação'. 👍</p>
                                    </div>
                                </div>
                                {/* Message 3 - User (Audio) */}
                                <div className="flex justify-end">
                                    <div className="bg-green-600 rounded-l-lg rounded-br-lg p-2 max-w-[80%] w-48">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                                            <div className="flex-grow h-1 bg-green-400/50 rounded-full flex items-center">
                                                <div className="w-2/3 h-0.5 bg-white rounded-full"></div>
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                            <span className="text-xs font-mono text-white">0:05</span>
                                        </div>
                                    </div>
                                </div>
                                 {/* Message 4 - Bot */}
                                <div className="flex justify-start">
                                    <div className="bg-gray-700 rounded-r-lg rounded-bl-lg p-2 max-w-[80%]">
                                        <p className="text-sm text-gray-200">Entendido. Gasto de R$35,00 com 'Transporte' adicionado. Precisa de mais alguma coisa?</p>
                                    </div>
                                </div>
                                 {/* Message 5 - User */}
                                <div className="flex justify-end">
                                    <div className="bg-green-600 text-white rounded-l-lg rounded-br-lg p-2 max-w-[80%]">
                                        <p className="text-sm">Me mostra um resumo dos meus gastos?</p>
                                    </div>
                                </div>
                                {/* Message 6 - Bot (List) */}
                                <div className="flex justify-start">
                                    <div className="bg-gray-700 rounded-r-lg rounded-bl-lg p-2 max-w-[80%] space-y-2">
                                        <p className="text-sm text-gray-200">Claro! Aqui está o resumo:</p>
                                        <div className="text-xs space-y-1.5 font-mono bg-gray-800/50 p-2 rounded-md">
                                            <div className="flex justify-between text-gray-300">
                                                <span>Supermercado:</span>
                                                <span>R$ 54,90</span>
                                            </div>
                                            <div className="flex justify-between text-gray-300">
                                                <span>Transporte:</span>
                                                <span>R$ 35,00</span>
                                            </div>
                                            <div className="border-t border-gray-600 my-1"></div>
                                            <div className="flex justify-between font-bold text-gray-100">
                                                <span>TOTAL:</span>
                                                <span>R$ 89,90</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Chat Footer */}
                        <div className="bg-gray-800/80 p-2 flex items-center gap-2 flex-shrink-0">
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                            <div className="flex-grow h-8 bg-gray-700 rounded-full text-sm text-gray-500 px-3 flex items-center">Digite...</div>
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section id="funcionalidades" ref={featureSectionRef} className="pt-20 pb-10 md:pb-20 bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                        Funcionalidades do Seu Assistente Financeiro
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Envie áudios, imagens ou texto. Nossa IA cuida do resto para você.
                    </p>
                </div>
                
                {/* Mobile Slider View */}
                <div className="md:hidden">
                    <div className="bg-gray-800 text-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="bg-gray-900 p-4 rounded-t-3xl">
                             <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-[2.5rem] h-[550px] w-[270px] shadow-lg">
                                <div className="absolute top-0 w-[130px] h-6 bg-gray-800 rounded-b-xl left-1/2 -translate-x-1/2 z-10"></div>
                                <div className="w-full h-full overflow-hidden rounded-[2rem] bg-black">
                                    {gifsLoaded.has(activeFeatureIndex) ? (
                                        <img 
                                            src={features[activeFeatureIndex].mockupImage} 
                                            alt={features[activeFeatureIndex].title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                        <div className="p-6 space-y-4 text-center">
                            <div className="flex justify-center items-center gap-3">
                                <span className="text-green-500">{features[activeFeatureIndex].icon}</span>
                                <h3 className="text-2xl font-bold text-white">{features[activeFeatureIndex].title}</h3>
                            </div>
                            <p className="text-gray-400">{features[activeFeatureIndex].description}</p>
                            <div className="bg-gray-700 p-4 rounded-lg text-gray-300 text-sm">
                                {features[activeFeatureIndex].exampleText}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button 
                            onClick={handlePrevFeature}
                            className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center shadow-lg transform active:scale-95 transition-transform"
                            aria-label="Anterior"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button 
                            onClick={handleNextFeature}
                            className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center shadow-lg transform active:scale-95 transition-transform"
                            aria-label="Próximo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Desktop Grid View */}
                <div className="hidden md:grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Feature Cards */}
                    <div className="space-y-4">
                        {features.map((feature, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveFeatureIndex(index)}
                                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 transform ${activeFeatureIndex === index ? 'bg-green-600 text-white shadow-2xl -translate-y-1' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 rounded-lg p-3 ${activeFeatureIndex === index ? 'bg-green-700' : 'bg-gray-700'}`}>
                                        <div className={`w-6 h-6 ${activeFeatureIndex === index ? 'text-white' : 'text-green-500'}`}>
                                          {feature.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${activeFeatureIndex === index ? 'text-white' : 'text-gray-200'}`}>{feature.title}</h3>
                                        <p className={`mt-1 text-sm ${activeFeatureIndex === index ? 'text-green-200' : 'text-gray-400'}`}>{feature.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Right Column: Mockup */}
                    <div className="flex flex-col items-center">
                         <div className="bg-gray-700 p-2 rounded-[3.5rem] shadow-2xl">
                             <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-[2.5rem] h-[550px] w-[270px]">
                                <div className="absolute top-0 w-[130px] h-6 bg-gray-800 rounded-b-xl left-1/2 -translate-x-1/2 z-10"></div>
                                <div className="w-full h-full overflow-hidden rounded-[2rem] bg-black">
                                    {gifsLoaded.has(activeFeatureIndex) ? (
                                        <img 
                                            src={features[activeFeatureIndex].mockupImage} 
                                            alt={features[activeFeatureIndex].title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                                        </div>
                                    )}
                                </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="recursos" className="pb-20 pt-10 md:pt-20 bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                     <div className="hidden md:block">
                        <div className="relative w-full max-w-sm mx-auto bg-gray-800 rounded-3xl p-4 border border-gray-700 shadow-2xl shadow-green-500/10">
                            <div className="bg-gray-900 rounded-2xl p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-200">Dashboard</h3>
                                    <div className="flex space-x-1">
                                        <span className="w-3 h-3 bg-gray-700 rounded-full"></span>
                                        <span className="w-3 h-3 bg-gray-700 rounded-full"></span>
                                        <span className="w-3 h-3 bg-gray-700 rounded-full"></span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="bg-gray-800/50 p-2 rounded">
                                        <p className="text-gray-400">Entradas</p>
                                        <div className="h-2 w-10 bg-green-500 rounded-full mt-1 mx-auto"></div>
                                    </div>
                                    <div className="bg-gray-800/50 p-2 rounded">
                                        <p className="text-gray-400">Saídas</p>
                                        <div className="h-2 w-10 bg-red-500 rounded-full mt-1 mx-auto"></div>
                                    </div>
                                    <div className="bg-gray-800/50 p-2 rounded">
                                        <p className="text-gray-400">Saldo</p>
                                        <div className="h-2 w-10 bg-gray-500 rounded-full mt-1 mx-auto"></div>
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-lg">
                                    <p className="text-sm font-semibold text-center mb-2 text-gray-200">Gastos por Categoria</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="relative w-24 h-24">
                                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" className="text-gray-700" strokeWidth="4"></circle>
                                                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#818cf8" strokeWidth="4" strokeDasharray="60, 100"></circle>
                                                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#34d399" strokeWidth="4" strokeDasharray="30, 100" strokeDashoffset="-60"></circle>
                                                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#fbbF24" strokeWidth="4" strokeDasharray="10, 100" strokeDashoffset="-90"></circle>
                                            </svg>
                                        </div>
                                        <div className="text-xs space-y-1.5 text-gray-400">
                                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#818cf8]"></div><span>Alimentação</span></div>
                                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#34d399]"></div><span>Transporte</span></div>
                                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#fbbF24]"></div><span>Lazer</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-lg">
                                    <p className="text-sm font-semibold text-center mb-2 text-gray-200">Evolução do Saldo</p>
                                    <svg viewBox="0 0 100 40" className="w-full h-auto">
                                        <path d="M 0 30 Q 25 10, 50 20 T 100 5" stroke="#4ade80" fill="none" strokeWidth="2" />
                                    </svg>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                            Entenda suas finanças com um olhar. <span className="text-green-500">Gráficos que falam por você.</span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-8">
                            Esqueça planilhas e apps confusos. Os dados que você registra de forma prática no WhatsApp se transformam em gráficos e relatórios visuais em nossos paineis. Acompanhe a evolução do seu saldo, identifique suas maiores fontes de despesa e tome decisões mais inteligentes com uma visão clara e completa das suas finanças.

                        </p>
                        
                        <div className="md:hidden mb-12">
                            <div className="relative w-full max-w-sm mx-auto bg-gray-800 rounded-3xl p-4 border border-gray-700 shadow-2xl shadow-green-500/10">
                                <div className="bg-gray-900 rounded-2xl p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-200">Dashboard</h3>
                                        <div className="flex space-x-1">
                                            <span className="w-3 h-3 bg-gray-700 rounded-full"></span>
                                            <span className="w-3 h-3 bg-gray-700 rounded-full"></span>
                                            <span className="w-3 h-3 bg-gray-700 rounded-full"></span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-gray-800/50 p-2 rounded">
                                            <p className="text-gray-400">Entradas</p>
                                            <div className="h-2 w-10 bg-green-500 rounded-full mt-1 mx-auto"></div>
                                        </div>
                                        <div className="bg-gray-800/50 p-2 rounded">
                                            <p className="text-gray-400">Saídas</p>
                                            <div className="h-2 w-10 bg-red-500 rounded-full mt-1 mx-auto"></div>
                                        </div>
                                        <div className="bg-gray-800/50 p-2 rounded">
                                            <p className="text-gray-400">Saldo</p>
                                            <div className="h-2 w-10 bg-gray-500 rounded-full mt-1 mx-auto"></div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 p-3 rounded-lg">
                                        <p className="text-sm font-semibold text-center mb-2 text-gray-200">Gastos por Categoria</p>
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="relative w-24 h-24">
                                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" className="text-gray-700" strokeWidth="4"></circle>
                                                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#818cf8" strokeWidth="4" strokeDasharray="60, 100"></circle>
                                                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#34d399" strokeWidth="4" strokeDasharray="30, 100" strokeDashoffset="-60"></circle>
                                                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#fbbF24" strokeWidth="4" strokeDasharray="10, 100" strokeDashoffset="-90"></circle>
                                                </svg>
                                            </div>
                                            <div className="text-xs space-y-1.5 text-gray-400">
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#818cf8]"></div><span>Alimentação</span></div>
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#34d399]"></div><span>Transporte</span></div>
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#fbbF24]"></div><span>Lazer</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 p-3 rounded-lg">
                                        <p className="text-sm font-semibold text-center mb-2 text-gray-200">Evolução do Saldo</p>
                                        <svg viewBox="0 0 100 40" className="w-full h-auto">
                                            <path d="M 0 30 Q 25 10, 50 20 T 100 5" stroke="#4ade80" fill="none" strokeWidth="2" />
                                        </svg>
                                    </div>
                                </div>
                             </div>
                        </div>

                        <ul className="space-y-5 text-left">
                            <li className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-300"><span className="font-semibold text-white">Visão Clara dos Gastos:</span> Veja exatamente para onde vai seu dinheiro com gráficos de pizza interativos e fáceis de entender.</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-300"><span className="font-semibold text-white">Evolução do Saldo:</span> Acompanhe o fluxo do seu dinheiro dia a dia e identifique tendências de gastos e economias.</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-300"><span className="font-semibold text-white">Relatórios Completos:</span> Filtre suas transações por data ou categoria para uma análise detalhada e tome o controle total.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section id="como-usar" className="py-20 bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-7xl">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                    Comece a usar em 4 passos simples
                </h2>
                <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                    Transformar sua organização financeira nunca foi tão fácil. Siga os passos abaixo e veja a mágica acontecer.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Step 1 */}
                    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                         <div className="mb-4">
                            <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-200 mb-2">1. Assine o Plano</h3>
                        <p className="text-gray-400">Assine nosso plano e informe seu WhatsApp. A comunicação com seu assistente é feita por lá, com total segurança e privacidade.</p>
                    </div>
                    {/* Step 2 */}
                    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                        <div className="mb-4">
                           <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-200 mb-2">2. Adicione o Seu Assitente Financeiro</h3>
                        <p className="text-gray-400">Com a assinatura confirmada, você recebe uma mensagem de boas-vindas no WhatsApp com suas credenciais de acesso e as primeiras instruções.</p>
                    </div>
                    {/* Step 3 */}
                    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                         <div className="mb-4">
                            <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-200 mb-2">3. Registre Gastos por Mensagem</h3>
                        <p className="text-gray-400">É só salvar o contato e começar a usar. Mande um áudio, foto ou texto do seu gasto e nossa IA faz a categorização automática.</p>
                    </div>
                    {/* Step 4 */}
                    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                        <div className="mb-4">
                            <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path d="M13 21.945A9.001 9.001 0 102.055 11H13v10.945z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-200 mb-2">4. Acompanhe Tudo no Painel</h3>
                        <p className="text-gray-400">Use seus dados de acesso para entrar no dashboard. Analise gráficos, acompanhe seu saldo e tome as melhores decisões para suas finanças.</p>
                    </div>
                </div>
            </div>
        </section>
        
        <section id="planos" className="py-20 bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                            Um plano simples para <span className="text-green-500">transformar</span> sua vida financeira.
                        </h2>
                        <p className="text-lg text-gray-400 mb-6">
                            Sem complicações, sem taxas escondidas. Acesso total a todos os recursos para você ter o controle total do seu dinheiro, por um preço que cabe no seu bolso.
                        </p>
                        <ul className="space-y-4 text-left mb-8 text-gray-300">
                            <li className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Registros ilimitados via WhatsApp</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Análise de gastos com Inteligência Artificial</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Dashboard completo com gráficos detalhados</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Alertas inteligentes sob medida</span>
                            </li>
                        </ul>
                    </div>
                     <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-2xl p-8 border border-green-500/20 shadow-2xl shadow-green-500/10 text-center">
                       <h3 className="text-2xl font-bold text-white mb-2">Plano Completo</h3>
                       <p className="text-gray-400 mb-6">Todos os recursos inclusos.</p>
                       <p className="text-5xl font-extrabold text-white mb-2">R$29,90<span className="text-lg font-medium text-gray-400">/mês</span></p>
                       <div className="border-t border-gray-700 my-6"></div>
                       <ul className="space-y-3 text-left text-gray-400 mb-8">
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Registros com IA</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Definição de Limites</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Dashboard completo</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Suporte prioritário</span>
                            </li>
                       </ul>
                        <a
                            href="https://payfast.greenn.com.br/140026"
                            onClick={handleOpenPreCheckout}
                            className="block w-full py-3 px-5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out"
                        >
                            Assinar Agora
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <section id="faq" className="py-20 bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-7xl">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-6">
                    Veja como estamos mudando a vida financeira das pessoas
                </h2>
                
                <div className="grid md:grid-cols-3 gap-8 text-left my-12">
                    {/* Testimonial 1 */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            ))}
                        </div>
                        <p className="text-gray-400 mb-4">"Finalmente um jeito de controlar meus gastos que não dá preguiça! Mando um áudio e pronto. Mudou meu dia a dia."</p>
                        <p className="font-bold text-white">Maria S.</p>
                    </div>
                    {/* Testimonial 2 */}
                     <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            ))}
                        </div>
                        <p className="text-gray-400 mb-4">"O dashboard é incrível. Pela primeira vez, eu entendi de verdade para onde meu dinheiro estava indo. As categorias automáticas são mágicas."</p>
                        <p className="font-bold text-white">João P.</p>
                    </div>
                    {/* Testimonial 3 */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            ))}
                        </div>
                        <p className="text-gray-400 mb-4">"Consegui economizar 15% no primeiro mês só por ter mais consciência dos meus gastos. Recomendo demais!"</p>
                        <p className="font-bold text-white">Ana C.</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mt-20 text-left">
                     <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-8 text-center">
                        Ainda tem dúvidas? <span className="text-green-500">A gente responde.</span>
                    </h2>
                    <FaqItem question="Meus dados financeiros estão seguros?">
                        <p>Absolutamente. A segurança é nossa prioridade máxima. Todas as suas informações são criptografadas de ponta a ponta e armazenadas em servidores seguros. A conversa no WhatsApp é apenas o canal de entrada; os dados são processados e guardados em nosso sistema, seguindo os mais altos padrões de segurança.</p>
                    </FaqItem>
                    <FaqItem question="Como funciona a conexão com o WhatsApp?">
                        <p>É muito simples. Após criar sua conta, você receberá um número exclusivo do nosso assistente. Basta adicioná-lo aos seus contatos e começar a conversar. Não pedimos acesso à sua conta do WhatsApp nem às suas outras conversas.</p>
                    </FaqItem>
                    <FaqItem question="A Inteligência Artificial entende tudo?">
                        <p>Nossa IA é treinada para entender uma vasta gama de descrições de gastos, inclusive gírias e áudios. Se por acaso ela não entender algo, ela pedirá para você esclarecer, garantindo que nenhum registro seja feito incorretamente. Ela aprende e melhora a cada dia!</p>
                    </FaqItem>
                    <FaqItem question="Posso cancelar quando quiser?">
                        <p>Sim. Nosso plano é mensal e sem fidelidade. Você pode cancelar sua assinatura a qualquer momento, sem burocracia e sem taxas de cancelamento, diretamente na sua página de assinatura.</p>
                    </FaqItem>
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400 max-w-7xl">
            <Link to="/" className="inline-block">
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/online-media-2df7b.firebasestorage.app/o/seu%20assistente%20financeiro%20sem%20fundo.png?alt=media&token=01d3c41a-a247-43fb-8823-452e9161a37d" 
                  alt="Seu Assistente Financeiro" 
                  className="h-40 w-auto mx-auto"
                  loading="lazy"
                />
            </Link>
            <p className="mt-2 text-sm max-w-md mx-auto">
                A maneira mais inteligente de gerenciar suas finanças, diretamente do seu WhatsApp.
            </p>
            <div className="mt-6 flex justify-center space-x-6">
              <a href="#" className="hover:text-white transition-colors text-sm">Termos de Serviço</a>
              <a href="#" className="hover:text-white transition-colors text-sm">Política de Privacidade</a>
            </div>
            <p className="mt-6 text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Seu Assistente Financeiro. Todos os direitos reservados.
            </p>
        </div>
      </footer>
    </div>
  );
};