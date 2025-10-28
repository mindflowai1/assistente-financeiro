# 🚀 Seu Assistente Financeiro

Assistente financeiro inteligente com IA para gerenciar suas finanças direto do WhatsApp.

## ✨ Funcionalidades

- **Registro de Gastos via WhatsApp**: Áudio, texto ou imagem
- **IA para Categorização Automática**: Identifica gastos e valores automaticamente
- **Dashboard Completo**: Gráficos e relatórios visuais
- **Limites Personalizados**: Configure limites de gastos por categoria
- **Alertas Inteligentes**: Notificações quando ultrapassar limites

## 🚀 Otimizações de Performance

Este projeto foi otimizado para **Lighthouse Score 90+** com:

- ✅ **Tailwind CSS Local** - Redução de 99% no tamanho do CSS (de 3MB para 32KB)
- ✅ **Lazy Loading de Páginas** - Code splitting com React.lazy()
- ✅ **Intersection Observer** - GIFs carregam apenas quando visíveis
- ✅ **Analytics Otimizados** - Scripts carregam com delay de 2s
- ✅ **Build Otimizado** - Terser com múltiplas passadas
- ✅ **Bundle Principal** - Apenas 12.67KB gzip

### Métricas de Performance

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| FCP | 9.3s | 0.8-1.2s | -87% |
| LCP | 18.6s | 2.5-3.5s | -81% |
| Score | 56 | 85-95 | +52% |
| Bundle | 2.5MB | 135KB | -95% |

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite** - Build ultra rápido
- **Tailwind CSS 3** - CSS otimizado
- **Supabase** - Backend e autenticação
- **React Router** - Navegação
- **Intersection Observer** - Performance otimizada

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/mindflowai1/assistente-financeiro.git

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# Execute em desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## 📁 Estrutura do Projeto

```
assistente-financeiro/
├── components/          # Componentes React
│   ├── AppLayout.tsx    # Layout principal
│   └── ProtectedRoute.tsx
├── contexts/            # Contextos React
│   ├── AuthContext.tsx  # Autenticação
│   └── ThemeContext.tsx # Tema dark/light
├── pages/               # Páginas
│   ├── LandingPage.tsx  # Landing page
│   ├── DashboardPage.tsx
│   ├── AccountPage.tsx
│   └── ...
├── services/           # Serviços
│   └── supabase.ts     # Cliente Supabase
└── src/                 # Assets
    └── index.css       # Tailwind CSS
```

## 🎯 Deploy

### Google Cloud Build

```bash
# Deploy automático
gcloud builds submit --config cloudbuild.yaml
```

### Docker

```bash
# Build da imagem
docker build -t assistente-financeiro .

# Executar container
docker run -p 8080:80 assistente-financeiro
```

## 📊 Documentação

- [MELHORIAS_PERFORMANCE.md](MELHORIAS_PERFORMANCE.md) - Otimizações implementadas
- [OTIMIZACOES_LIGHTHOUSE.md](OTIMIZACOES_LIGHTHOUSE.md) - Detalhes de performance
- [IMPORTANTE_TESTE_LIGHTHOUSE.md](IMPORTANTE_TESTE_LIGHTHOUSE.md) - Como testar corretamente

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.

## 📝 Licença

Este projeto é privado.

## 👥 Equipe

Desenvolvido por MindFlow AI

---

**Link da aplicação:** https://seuassistentefinanceiro.com.br/
