import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // 支援多種環境變數名稱：API_KEY, VITE_API_KEY, GEMINI_API_KEY
  const apiKey = env.API_KEY || env.VITE_API_KEY || env.GEMINI_API_KEY || '';
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_API_KEY': JSON.stringify(apiKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
