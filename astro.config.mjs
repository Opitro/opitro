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
  // Root ("/") and the retired /length-converter URLs redirect via public/_redirects instead
  // of Astro's own `redirects` option -- that compiles to a slow client-side meta-refresh
  // page on static output, which the user saw as a flash of "Redirecting from..." text
  // before the real page loaded. _redirects is a real edge-level redirect on Cloudflare.
});
