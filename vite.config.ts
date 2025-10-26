
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './attached_assets'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-popover'
            ],
            'form-vendor': ['react-hook-form', 'zod'],
            'date-vendor': ['react-day-picker'],
            'chart-vendor': ['recharts'],
            'utils': ['class-variance-authority', 'clsx', 'tailwind-merge']
          }
        }
      },
      chunkSizeWarningLimit: 600
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
    },
  });