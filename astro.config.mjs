import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  site: 'https://specialmindsaarhus.github.io',
  vite: {
    server: {
      proxy: {
        '/directus': {
          target: 'https://cms.spmi.dk',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/directus/, ''),
        },
      },
    },
  },
});