import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const isElectron = process.env.ELECTRON === 'true'

  return {
    plugins: [react()],
    base: isElectron ? './' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Electronビルド時の最適化
      rollupOptions: isElectron
        ? {
            external: ['electron'],
          }
        : {},
    },
    server: {
      port: 5173,
      strictPort: true, // ポートが使用中の場合はエラーにする
      // Electron開発時のHMR設定
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },
    // Electron開発時の設定
    optimizeDeps: {
      exclude: isElectron ? ['electron'] : [],
    },
  }
})
