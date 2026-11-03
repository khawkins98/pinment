import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

describe('Manifest V3 Browser Extension', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const manifestPath = path.resolve(root, 'extension/manifest.json');
  const bgPath = path.resolve(root, 'extension/background.js');

  it('contains valid manifest.json with MV3 structure', () => {
    expect(existsSync(manifestPath)).toBe(true);
    const content = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    expect(content.manifest_version).toBe(3);
    expect(content.name).toBe('Pinment');
    expect(content.permissions).toContain('activeTab');
    expect(content.permissions).toContain('scripting');
    expect(content.background.service_worker).toBe('background.js');
    expect(content.action.default_title).toBeDefined();
    expect(content.action.default_icon).toBeDefined();
    expect(content.icons).toBeDefined();
  });

  it('has all required icon sizes', () => {
    const iconSizes = ['16', '32', '48', '128'];
    for (const size of iconSizes) {
      const iconPath = path.resolve(root, `extension/icons/icon-${size}.png`);
      expect(existsSync(iconPath)).toBe(true);
      const stat = readFileSync(iconPath);
      expect(stat.length).toBeGreaterThan(100);
    }
  });

  it('has background.js handling extension click and tab script execution', () => {
    expect(existsSync(bgPath)).toBe(true);
    const bgCode = readFileSync(bgPath, 'utf-8');
    expect(bgCode).toContain('chrome.action.onClicked.addListener');
    expect(bgCode).toContain('chrome.scripting.executeScript');
    expect(bgCode).toContain('pinment-bookmarklet.js');
  });
});
