import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'activecampaign-proxy',
        configureServer(server) {
          const AC_API_URL = env.AC_API_URL || 'https://escolanfs.api-us1.com';
          const AC_API_KEY = env.AC_API_KEY || '2de2eb2adaa89a824c694727b7e7f44a17d95bc1e478203a39e3d88bd1a74695b76cc9f7';
          const TARGET_LIST_NAME = env.AC_LIST_NAME || 'Seu Assistente Financeiro - Início de Finalização de Compra';

          let cachedListId: string | null = null;

          const readJsonBody = async (req: any) => new Promise<any>((resolve, reject) => {
            let data = '';
            req.on('data', (chunk: any) => { data += chunk; });
            req.on('end', () => {
              try { resolve(data ? JSON.parse(data) : {}); }
              catch (e) { reject(e); }
            });
            req.on('error', reject);
          });

          const acFetch = async (pathname: string, init?: RequestInit) => {
            const url = `${AC_API_URL.replace(/\/$/, '')}${pathname}`;
            const headers: any = {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Api-Token': AC_API_KEY,
            };
            const res = await fetch(url, { ...init, headers: { ...headers, ...(init?.headers || {}) } });
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`AC ${res.status} ${res.statusText}: ${text}`);
            }
            return res.json();
          };

          const getListIdByName = async (): Promise<string> => {
            if (cachedListId) return cachedListId;
            // Paginate first pages until we find the list (limit to 5 pages to avoid long loops)
            let offset = 0;
            const limit = 100;
            for (let i = 0; i < 5; i++) {
              const data: any = await acFetch(`/api/3/lists?limit=${limit}&offset=${offset}`);
              const lists = data?.lists || [];
              const found = lists.find((l: any) => (l?.name || '').trim() === TARGET_LIST_NAME.trim());
              if (found) { cachedListId = String(found.id); return cachedListId; }
              if (lists.length < limit) break;
              offset += limit;
            }
            throw new Error(`Lista não encontrada: ${TARGET_LIST_NAME}`);
          };

          const getContactByEmail = async (email: string) => {
            const data: any = await acFetch(`/api/3/contacts?email=${encodeURIComponent(email)}`);
            const contacts = data?.contacts || [];
            return contacts[0] || null;
          };

          const upsertContact = async (email: string, name?: string, phone?: string) => {
            const existing = await getContactByEmail(email);
            if (existing) {
              const id = existing.id;
              const body = { contact: { email, firstName: name || existing.firstName || '', phone: phone || existing.phone || '' } };
              await acFetch(`/api/3/contacts/${id}`, { method: 'PUT', body: JSON.stringify(body) });
              return id as string;
            }
            const body = { contact: { email, firstName: name || '', phone: phone || '' } };
            const created: any = await acFetch(`/api/3/contacts`, { method: 'POST', body: JSON.stringify(body) });
            return created?.contact?.id as string;
          };

          const subscribeToList = async (contactId: string, listId: string) => {
            const body = { contactList: { list: listId, contact: contactId, status: 1 } }; // 1 = subscribed
            await acFetch(`/api/3/contactLists`, { method: 'POST', body: JSON.stringify(body) });
          };

          server.middlewares.use('/api/checkout-start', async (req, res, next) => {
            if (req.method !== 'POST') return next();
            try {
              if (!AC_API_KEY) throw new Error('AC_API_KEY não configurada. Defina AC_API_KEY no .env');
              const body = await readJsonBody(req);
              const email = String(body?.email || '').trim();
              const name = String(body?.name || '').trim();
              const phone = String(body?.phone || '').trim();
              if (!email) throw new Error('Email é obrigatório');

              const listId = await getListIdByName();
              const contactId = await upsertContact(email, name, phone);
              if (contactId && listId) {
                await subscribeToList(contactId, listId);
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, contactId, listId }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err?.message || String(err) }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
      build: {
        // Otimizações de build mais agressivas
        target: 'es2020',
        minify: 'terser',
        modulePreload: {
          polyfill: false, // Desabilitar polyfill para modulepreload
        },
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            passes: 2, // Multiple passes para melhor compressão
            pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove funções específicas
          },
          mangle: {
            safari10: true, // Compatibilidade Safari
          },
          format: {
            comments: false, // Remove todos os comentários
          },
        },
        rollupOptions: {
          output: {
            // Code splitting mais granular
            manualChunks: (id) => {
              // React e dependências core
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'vendor-react';
              }
              // React Router separado
              if (id.includes('node_modules/react-router')) {
                return 'vendor-router';
              }
              // Supabase
              if (id.includes('node_modules/@supabase')) {
                return 'vendor-supabase';
              }
              // Outras dependências
              if (id.includes('node_modules')) {
                return 'vendor-other';
              }
            },
            // Otimizar nomes dos chunks
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
          },
        },
        // Otimização de chunks
        chunkSizeWarningLimit: 500,
        cssCodeSplit: true,
        sourcemap: false,
        // Reduzir tamanho do vendor chunk
        reportCompressedSize: false, // Acelera o build
      },
      // Otimizações adicionais
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
      },
      // CSS inline para critical path
      css: {
        // Optimizar CSS
        postcss: './postcss.config.js',
      },
    };
});
