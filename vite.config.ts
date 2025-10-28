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
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
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
