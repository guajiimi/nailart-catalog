import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/nail/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
