import { defineConfig } from 'vite';
import { build as esbuild } from 'esbuild';
import { readFileSync } from 'fs';
import path from 'path';

function bookmarkletPlugin() {
  return {
    name: 'pinment-bookmarklet',
    async transformIndexHtml(html) {
      const result = await esbuild({
        entryPoints: [path.resolve(__dirname, 'src/bookmarklet/index.js')],
        bundle: true,
        minify: true,
        format: 'iife',
        write: false,
        target: ['es2020'],
      });
      const code = result.outputFiles[0].text.trim();
      const uri = `javascript:void%20${encodeURIComponent(`(function(){${code}})()`)}`;
      return html.replace('href="javascript:void(0);"', `href="${uri}"`);
    },
  };
}

export default defineConfig({
  plugins: [bookmarkletPlugin()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
