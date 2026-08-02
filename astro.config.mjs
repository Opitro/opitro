// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://opitro.com',
  // Must match wrangler.jsonc's assets.html_handling: "drop-trailing-slash" -- without this,
  // astro:i18n's getRelativeLocaleUrl() (used in Layout.astro) appends a trailing slash to
  // every generated URL, which the Cloudflare asset server then redirects away from,
  // reintroducing the exact canonical/served-URL mismatch bug fixed twice before this.
  trailingSlash: 'never',
  i18n: {
    locales: ['en', 'ru', 'es', 'uk'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [sitemap()],
  build: {
    // Our CSS is small (a couple KB) and Astro's default "auto" threshold was flip-flopping
    // between inlining it and extracting it to a separate file as the stylesheet grew across
    // this session -- the external version is a render-blocking request PageSpeed flagged
    // directly (110ms of avoidable delay). Forcing "always" removes that request entirely
    // and makes the output deterministic.
    inlineStylesheets: 'always',
  },
  // Root ("/") and the retired /length-converter URLs redirect via public/_redirects instead
  // of Astro's own `redirects` option -- that compiles to a slow client-side meta-refresh
  // page on static output, which the user saw as a flash of "Redirecting from..." text
  // before the real page loaded. _redirects is a real edge-level redirect on Cloudflare.
});
