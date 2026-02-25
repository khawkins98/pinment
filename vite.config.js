import { defineConfig } from 'vite';
import { build as esbuild } from 'esbuild';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Vite plugin that builds the Pinment bookmarklet as a separate JS file
 * and leaves the bookmarklet link as a placeholder for app.js to set
 * dynamically at page load (so the loader URL adapts to any host).
 */
function bookmarkletPlugin() {
  let bookmarkletCode = '';
  let isDev = false;

  return {
    name: 'pinment-bookmarklet',

    configResolved(config) {
      isDev = config.command === 'serve';
    },

    async buildStart() {
      const result = await esbuild({
        entryPoints: [path.resolve(__dirname, 'src/bookmarklet/index.js')],
        bundle: true,
        minify: true,
        format: 'iife',
        write: false,
        target: ['es2020'],
        define: { '__PINMENT_DEV__': JSON.stringify(isDev) },
      });
      bookmarkletCode = result.outputFiles[0].text.trim();
    },

    // Serve the bookmarklet JS during dev
    configureServer(server) {
      server.middlewares.use('/pinment/pinment-bookmarklet.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.end(bookmarkletCode);
      });
    },

    // Emit the bookmarklet JS as a static asset during build
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'pinment-bookmarklet.js',
        source: bookmarkletCode,
      });
    },
  };
}

export default defineConfig({
  base: '/pinment/',
  plugins: [bookmarkletPlugin()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
