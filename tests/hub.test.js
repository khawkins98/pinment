import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderViewer, parseHashData, renderError, init } from '../js/app.js';
import { createState, compress } from '../src/state.js';

// Helper to create v2-format pins
function v2Pin(overrides = {}) {
  return { id: 1, s: '#main>p', ox: 0.5, oy: 0.3, fx: 720, fy: 200, author: 'FL', text: 'Test', ...overrides };
}

beforeEach(() => {
  document.body.innerHTML = `
    <div id="app">
      <section id="install">
        <ol class="steps">
          <li class="step step-featured"><div class="step-content">Bookmarklet</div></li>
          <li class="step"><div class="step-content">Navigate</div></li>
          <li class="step"><div class="step-content">Drop pins</div></li>
          <li class="step"><div class="step-content">Share</div></li>
        </ol>
      </section>
      <section id="viewer" hidden>
        <div id="review-meta"></div>
        <div id="review-pins" role="list"></div>
      </section>
    </div>
  `;
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('parseHashData', () => {
  it('returns null when hash is empty', () => {
    expect(parseHashData('')).toBeNull();
  });

  it('returns null when hash has no data= prefix', () => {
    expect(parseHashData('#other=thing')).toBeNull();
  });

  it('parses valid compressed data from hash', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'Test comment' }),
    ]);
    const hash = `#data=${compress(state)}`;
    const result = parseHashData(hash);
    expect(result).toEqual(state);
  });

  it('returns null for corrupted data', () => {
    expect(parseHashData('#data=corrupted-garbage')).toBeNull();
  });

  it('rejects v1 data', () => {
    const v1State = { v: 1, url: 'https://example.com', viewport: 1440, pins: [
      { id: 1, x: 0.5, y: 200, author: 'FL', text: 'Test' },
    ]};
    const hash = `#data=${compress(v1State)}`;
    const result = parseHashData(hash);
    expect(result).toBeNull();
  });
});

describe('renderViewer', () => {
  it('shows the viewer section', () => {
    const state = createState('https://example.com/page', 1440, [
      v2Pin({ id: 1, text: 'Fix this' }),
    ]);
    renderViewer(state);
    const viewer = document.getElementById('viewer');
    expect(viewer.hidden).toBe(false);
  });

  it('displays the target page URL', () => {
    const state = createState('https://staging.example.com/about', 1440, []);
    renderViewer(state);
    const meta = document.getElementById('review-meta');
    expect(meta.textContent).toContain('https://staging.example.com/about');
  });

  it('displays the target URL as a clickable link', () => {
    const state = createState('https://example.com/page', 1440, []);
    renderViewer(state);
    const link = document.querySelector('#review-meta a');
    expect(link).not.toBeNull();
    expect(link.href).toBe('https://example.com/page');
  });

  it('displays viewport width when no env data', () => {
    const state = createState('https://example.com', 1440, []);
    renderViewer(state);
    const meta = document.getElementById('review-meta');
    expect(meta.textContent).toContain('1440');
  });

  it('displays env metadata when present', () => {
    const state = createState('https://example.com', 1440, [],
      { ua: 'C/130', vp: [1440, 900], dt: 'd' });
    renderViewer(state);
    const meta = document.getElementById('review-meta');
    expect(meta.textContent).toContain('C/130');
    expect(meta.textContent).toContain('1440');
    expect(meta.textContent).toContain('Desktop');
  });

  it('lists all pins with their details', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'Fix heading' }),
      v2Pin({ id: 2, author: 'KH', text: 'Add alt text' }),
    ]);
    renderViewer(state);
    const items = document.querySelectorAll('#review-pins [role="listitem"]');
    expect(items.length).toBe(2);
  });

  it('shows pin number, author, and comment', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, author: 'FL', text: 'Wrong heading' }),
    ]);
    renderViewer(state);
    const item = document.querySelector('#review-pins [role="listitem"]');
    expect(item.textContent).toContain('1');
    expect(item.textContent).toContain('FL');
    expect(item.textContent).toContain('Wrong heading');
  });

  it('shows selector info for element-anchored pins', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, s: '#main>h2', text: 'Fix this' }),
    ]);
    renderViewer(state);
    const coords = document.querySelector('.review-pin-coords');
    expect(coords.textContent).toContain('Anchored to');
    expect(coords.textContent).toContain('#main>h2');
  });

  it('shows pixel fallback info for pins without selector', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, s: null, ox: null, oy: null, fx: 720, fy: 200, text: 'Fallback pin' }),
    ]);
    renderViewer(state);
    const coords = document.querySelector('.review-pin-coords');
    expect(coords.textContent).toContain('pixel fallback');
    expect(coords.textContent).toContain('720');
  });

  it('collapses install to only the bookmarklet step when showing viewer', () => {
    const state = createState('https://example.com', 1440, []);
    renderViewer(state);
    const install = document.getElementById('install');
    expect(install.hidden).toBe(false);
    const featured = install.querySelector('.step-featured');
    expect(featured.hidden).toBe(false);
    const otherSteps = install.querySelectorAll('.step:not(.step-featured)');
    otherSteps.forEach(s => expect(s.hidden).toBe(true));
    expect(install.querySelector('.steps').classList.contains('steps-compact')).toBe(true);
  });

  it('moves the viewer above the install section', () => {
    const state = createState('https://example.com', 1440, []);
    renderViewer(state);
    const main = document.querySelector('#app main') || document.getElementById('app');
    const children = [...main.children];
    const viewerIdx = children.indexOf(document.getElementById('viewer'));
    const installIdx = children.indexOf(document.getElementById('install'));
    expect(viewerIdx).toBeLessThan(installIdx);
  });

  it('displays singular "annotation" for a single pin', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'Only one' }),
    ]);
    renderViewer(state);
    const meta = document.getElementById('review-meta');
    expect(meta.textContent).toContain('1 annotation');
    expect(meta.textContent).not.toContain('annotations');
  });

  it('displays plural "annotations" for multiple pins', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'First' }),
      v2Pin({ id: 2, text: 'Second' }),
    ]);
    renderViewer(state);
    const meta = document.getElementById('review-meta');
    expect(meta.textContent).toContain('2 annotations');
  });

  it('handles pins with empty author', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, author: '', text: 'No author pin' }),
    ]);
    renderViewer(state);
    const item = document.querySelector('#review-pins [role="listitem"]');
    expect(item.textContent).toContain('No author pin');
    const authorEl = item.querySelector('.review-pin-author');
    expect(authorEl.textContent).toBe('');
  });

  it('does not throw when DOM elements are missing', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const state = createState('https://example.com', 1440, []);
    expect(() => renderViewer(state)).not.toThrow();
  });

  it('shows category badge for pins with a category', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'Fix this', c: 'text' }),
    ]);
    renderViewer(state);
    const catBadge = document.querySelector('.review-pin-category');
    expect(catBadge).not.toBeNull();
    expect(catBadge.textContent).toBe('Text issue');
    expect(catBadge.classList.contains('review-pin-category-text')).toBe(true);
  });

  it('does not show category badge when no category', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'No category' }),
    ]);
    renderViewer(state);
    expect(document.querySelector('.review-pin-category')).toBeNull();
  });

  it('shows resolved badge for resolved pins', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'Done', resolved: true }),
    ]);
    renderViewer(state);
    const badge = document.querySelector('.review-pin-resolved-badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe('Resolved');
  });

  it('applies resolved class to resolved pin items', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'Done', resolved: true }),
    ]);
    renderViewer(state);
    const item = document.querySelector('.review-pin');
    expect(item.classList.contains('review-pin-resolved')).toBe(true);
  });

  it('does not show resolved badge for open pins', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'Open' }),
    ]);
    renderViewer(state);
    expect(document.querySelector('.review-pin-resolved-badge')).toBeNull();
  });

  it('renders export JSON button', () => {
    const state = createState('https://example.com', 1440, []);
    renderViewer(state);
    const buttons = document.querySelectorAll('.viewer-btn-secondary');
    const exportBtn = Array.from(buttons).find(b => b.textContent.includes('Export'));
    expect(exportBtn).not.toBeNull();
  });

  it('renders "Open target page" link pointing to state url', () => {
    const state = createState('https://staging.example.com/about', 1440, []);
    renderViewer(state);
    const link = document.querySelector('.viewer-btn-primary');
    expect(link).not.toBeNull();
    expect(link.href).toBe('https://staging.example.com/about');
    expect(link.target).toBe('_blank');
    expect(link.textContent).toContain('Open target page');
  });

  it('renders "Copy share URL" button', () => {
    const state = createState('https://example.com', 1440, []);
    renderViewer(state);
    const btn = document.querySelector('.viewer-btn-secondary');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toContain('Copy share URL');
  });
});

describe('renderError', () => {
  it('shows the viewer section with error message', () => {
    renderError('Something went wrong');
    const viewer = document.getElementById('viewer');
    expect(viewer.hidden).toBe(false);
    const errorEl = document.querySelector('.viewer-error');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toContain('Something went wrong');
  });

  it('collapses install to only the bookmarklet step', () => {
    renderError('Bad link');
    const install = document.getElementById('install');
    expect(install.hidden).toBe(false);
    const featured = install.querySelector('.step-featured');
    expect(featured.hidden).toBe(false);
    const otherSteps = install.querySelectorAll('.step:not(.step-featured)');
    otherSteps.forEach(s => expect(s.hidden).toBe(true));
  });

  it('clears any existing pins list', () => {
    const pinsList = document.getElementById('review-pins');
    pinsList.innerHTML = '<div>old content</div>';
    renderError('Error');
    expect(pinsList.innerHTML).toBe('');
  });
});

describe('init', () => {
  it('renders viewer when hash contains valid data', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ id: 1, text: 'Test' }),
    ]);
    Object.defineProperty(window, 'location', {
      value: { ...window.location, hash: `#data=${compress(state)}` },
      writable: true,
    });
    init();
    const viewer = document.getElementById('viewer');
    expect(viewer.hidden).toBe(false);
  });

  it('keeps install section visible when no hash data', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, hash: '' },
      writable: true,
    });
    init();
    const install = document.getElementById('install');
    expect(install.hidden).toBeFalsy();
  });

  it('shows error message when hash data is corrupted', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, hash: '#data=corrupted-garbage' },
      writable: true,
    });
    init();
    const errorEl = document.querySelector('.viewer-error');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toContain('corrupted');
  });
});
