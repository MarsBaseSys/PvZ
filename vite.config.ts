import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        englishDemo: new URL('./english-demo.html', import.meta.url).pathname,
      },
    },
  },
});
