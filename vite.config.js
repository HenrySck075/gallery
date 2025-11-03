import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '_site',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        "assets/fluent.js",
      ],
      input: {
        script: 'script.js',
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
