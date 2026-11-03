/**
 * Build script for Pinment Manifest V3 Browser Extension
 *
 * Assembles a ready-to-load unpacked browser extension in dist/extension/
 * containing manifest.json, background.js, icons, and the bundled bookmarklet.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXT_SRC = path.resolve(ROOT, 'extension');
const DIST_EXT = path.resolve(ROOT, 'dist/extension');
const BOOKMARKLET_DIST = path.resolve(ROOT, 'dist/pinment-bookmarklet.js');

async function buildExtension() {
  // 1. Ensure bookmarklet bundle exists
  if (!existsSync(BOOKMARKLET_DIST)) {
    console.log('Building bookmarklet bundle first...');
    execSync('node scripts/build-bookmarklet.js', { stdio: 'inherit', cwd: ROOT });
  }

  // 2. Prepare output directories
  mkdirSync(DIST_EXT, { recursive: true });
  mkdirSync(path.resolve(DIST_EXT, 'icons'), { recursive: true });

  // 3. Copy manifest.json (sync version with package.json)
  const pkg = JSON.parse(readFileSync(path.resolve(ROOT, 'package.json'), 'utf-8'));
  const manifest = JSON.parse(readFileSync(path.resolve(EXT_SRC, 'manifest.json'), 'utf-8'));
  manifest.version = pkg.version;
  writeFileSync(path.resolve(DIST_EXT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  // 4. Copy background.js
  cpSync(path.resolve(EXT_SRC, 'background.js'), path.resolve(DIST_EXT, 'background.js'));

  // 5. Copy bookmarklet bundle
  cpSync(BOOKMARKLET_DIST, path.resolve(DIST_EXT, 'pinment-bookmarklet.js'));

  // 6. Copy icons
  cpSync(path.resolve(EXT_SRC, 'icons'), path.resolve(DIST_EXT, 'icons'), { recursive: true });

  console.log(`Extension built successfully in dist/extension/ (ready for chrome://extensions load unpacked)`);
}

buildExtension().catch((err) => {
  console.error('Extension build failed:', err);
  process.exit(1);
});
