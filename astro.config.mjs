// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://opitro.com',
  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [sitemap()],
});
