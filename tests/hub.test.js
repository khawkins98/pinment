import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderViewer, parseHashData, init } from '../js/app.js';
import { createState, compress } from '../src/state.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="app">
      <section id="install"></section>
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
      { id: 1, x: 0.5, y: 200, author: 'FL', text: 'Test comment' },
    ]);
    const hash = `#data=${compress(state)}`;
    const result = parseHashData(hash);
    expect(result).toEqual(state);
  });

  it('returns null for corrupted data', () => {
    expect(parseHashData('#data=corrupted-garbage')).toBeNull();
  });
});

describe('renderViewer', () => {
  it('shows the viewer section', () => {
    const state = createState('https://example.com/page', 1440, [
      { id: 1, x: 0.5, y: 200, author: 'FL', text: 'Fix this' },
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

  it('displays viewport width', () => {
    const state = createState('https://example.com', 1440, []);
    renderViewer(state);
    const meta = document.getElementById('review-meta');
    expect(meta.textContent).toContain('1440');
  });

  it('lists all pins with their details', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 200, author: 'FL', text: 'Fix heading' },
      { id: 2, x: 0.3, y: 400, author: 'KH', text: 'Add alt text' },
    ]);
    renderViewer(state);
    const items = document.querySelectorAll('#review-pins [role="listitem"]');
    expect(items.length).toBe(2);
  });

  it('shows pin number, author, comment, and coordinates', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.45, y: 832, author: 'FL', text: 'Wrong heading' },
    ]);
    renderViewer(state);
    const item = document.querySelector('#review-pins [role="listitem"]');
    expect(item.textContent).toContain('1');
    expect(item.textContent).toContain('FL');
    expect(item.textContent).toContain('Wrong heading');
  });

  it('hides the install section when showing viewer', () => {
    const state = createState('https://example.com', 1440, []);
    renderViewer(state);
    const install = document.getElementById('install');
    expect(install.hidden).toBe(true);
  });

  it('displays singular "annotation" for a single pin', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 200, author: '', text: 'Only one' },
    ]);
    renderViewer(state);
    const meta = document.getElementById('review-meta');
    expect(meta.textContent).toContain('1 annotation');
    expect(meta.textContent).not.toContain('annotations');
  });

  it('displays plural "annotations" for multiple pins', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 200, author: '', text: 'First' },
      { id: 2, x: 0.3, y: 400, author: '', text: 'Second' },
    ]);
    renderViewer(state);
    const meta = document.getElementById('review-meta');
    expect(meta.textContent).toContain('2 annotations');
  });

  it('handles pins with empty author', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 200, author: '', text: 'No author pin' },
    ]);
    renderViewer(state);
    const item = document.querySelector('#review-pins [role="listitem"]');
    expect(item.textContent).toContain('No author pin');
    // Author span should exist but be empty
    const authorEl = item.querySelector('.review-pin-author');
    expect(authorEl.textContent).toBe('');
  });

  it('does not throw when DOM elements are missing', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const state = createState('https://example.com', 1440, []);
    // Should not throw even if #viewer, #review-meta, etc. are missing
    expect(() => renderViewer(state)).not.toThrow();
  });
});

describe('init', () => {
  it('renders viewer when hash contains valid data', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 200, author: 'FL', text: 'Test' },
    ]);
    // Set location hash before init
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
});
