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
  redirects: {
    // The universal length converter moved onto the category page itself instead of
    // living at its own URL -- keep this in case anything already linked the old one.
    '/ru/length-converter': '/ru/tools/length',
    '/en/length-converter': '/en/tools/length',
  },
});
