import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',            // por defecto
    emptyOutDir: true,
    rollupOptions: {
      // Si quieres que todo JS/CSS quede en subcarpetas específicas:
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: "localhost",
    port: 5173,
    // Fuerza a Vite a generar URLs absolutas para el HMR client
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
    cors: true,
  },
  // Nunca pongas `base` aquí, o asegúrate que sea "/"
});
