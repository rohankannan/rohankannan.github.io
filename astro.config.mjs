// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://rohankannan.com',
  integrations: [sitemap()],
  markdown: {
    // Shiki's default github-dark theme would drop a dark panel onto the cream
    // page; css-variables delegates code colors to global.css (--astro-code-*).
    shikiConfig: { theme: 'css-variables' },
  },
});
