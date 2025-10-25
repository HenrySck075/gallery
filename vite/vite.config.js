import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../_site',
    rollupOptions: {
      input: {
        main: '../index.html',
        fluent: './fluent-setup.js',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  root: '.',
});
