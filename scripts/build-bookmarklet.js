/**
 * Build script for the Pinment bookmarklet
 *
 * Bundles src/bookmarklet/index.js and its dependencies into a single
 * minified IIFE, then wraps it as a javascript: URI.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function buildBookmarklet() {
  const result = await build({
    entryPoints: [path.resolve(ROOT, 'src/bookmarklet/index.js')],
    bundle: true,
    minify: true,
    format: 'iife',
    write: false,
    target: ['es2020'],
  });

  const code = result.outputFiles[0].text.trim();

  mkdirSync(path.resolve(ROOT, 'dist'), { recursive: true });

  // Write the full bundle as a standalone JS file (loaded dynamically)
  writeFileSync(path.resolve(ROOT, 'dist/pinment-bookmarklet.js'), code);
  const bundleSizeKB = (new TextEncoder().encode(code).length / 1024).toFixed(1);
  console.log(`Bookmarklet bundle: dist/pinment-bookmarklet.js (${bundleSizeKB} KB)`);

  // Write a loader template (the host site's app.js fills in the real URL)
  const loaderTemplate = `javascript:void (function(){var s=document.createElement('script');s.src='YOUR_BASE_URL/pinment-bookmarklet.js?v='+Date.now();document.head.appendChild(s)})()`;
  writeFileSync(path.resolve(ROOT, 'dist/bookmarklet-loader.txt'), loaderTemplate);
  console.log(`Loader template: dist/bookmarklet-loader.txt (${loaderTemplate.length} chars)`);
}

buildBookmarklet().catch((err) => {
  console.error('Bookmarklet build failed:', err);
  process.exit(1);
});
