// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages deploy:
// - User/org page (usuario.github.io) or custom domain → leave BASE_PATH unset (serves at "/").
// - Project page (usuario.github.io/repositorio) → the workflow sets BASE_PATH="/repositorio".
// The <base> tag in Layout.astro applies this to every asset path automatically.
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  // TODO: troque para a URL final do seu site (usado em sitemap/SEO/canonical).
  site: 'https://SEU-USUARIO.github.io',
  base,
  vite: {
    plugins: [tailwindcss()],
  },
});
