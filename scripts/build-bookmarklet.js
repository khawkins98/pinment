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

  // The bookmarklet source already wraps itself in an IIFE, so just encode it
  const uri = `javascript:void%20${encodeURIComponent(code)}`;

  mkdirSync(path.resolve(ROOT, 'dist'), { recursive: true });
  writeFileSync(path.resolve(ROOT, 'dist/bookmarklet.txt'), uri);

  const sizeKB = (new TextEncoder().encode(uri).length / 1024).toFixed(1);
  console.log(`Bookmarklet built: dist/bookmarklet.txt (${sizeKB} KB)`);
}

buildBookmarklet().catch((err) => {
  console.error('Bookmarklet build failed:', err);
  process.exit(1);
});
