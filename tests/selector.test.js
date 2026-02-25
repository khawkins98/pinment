import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateSelector, validateSelector, detectEnv } from '../src/selector.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('generateSelector', () => {
  it('returns selector using ID for elements with stable IDs', () => {
    document.body.innerHTML = '<div id="main"><p>Hello</p></div>';
    const el = document.getElementById('main');
    const selector = generateSelector(el);
    expect(selector).toBe('#main');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('returns a path for elements without IDs', () => {
    document.body.innerHTML = '<div><section><p>Target</p></section></div>';
    const el = document.querySelector('p');
    const selector = generateSelector(el);
    expect(selector).not.toBeNull();
    expect(document.querySelector(selector)).toBe(el);
  });

  it('handles nested elements with ID ancestor', () => {
    document.body.innerHTML = '<div id="content"><ul><li>First</li><li>Second</li></ul></div>';
    const el = document.querySelectorAll('li')[1];
    const selector = generateSelector(el);
    expect(selector).not.toBeNull();
    expect(document.querySelector(selector)).toBe(el);
  });

  it('skips unstable-looking IDs (hex hashes)', () => {
    document.body.innerHTML = '<div id="a1b2c3d4e5f6"><p>Content</p></div>';
    const el = document.querySelector('p');
    const selector = generateSelector(el);
    expect(selector).not.toBeNull();
    // Should not start with the hex hash ID
    expect(selector).not.toContain('#a1b2c3d4e5f6');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('skips pure numeric IDs', () => {
    document.body.innerHTML = '<div id="12345"><p>Content</p></div>';
    const el = document.querySelector('p');
    const selector = generateSelector(el);
    expect(selector).not.toContain('#12345');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('prefers data-testid when available', () => {
    document.body.innerHTML = '<div><button data-testid="submit-btn">Submit</button></div>';
    const el = document.querySelector('button');
    const selector = generateSelector(el);
    expect(selector).toContain('data-testid');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('produces unique selectors for sibling elements', () => {
    document.body.innerHTML = '<div><p>First</p><p>Second</p><p>Third</p></div>';
    const els = document.querySelectorAll('p');
    const selectors = Array.from(els).map(el => generateSelector(el));
    // All selectors should be unique
    expect(new Set(selectors).size).toBe(3);
    // Each should resolve to the correct element
    selectors.forEach((sel, i) => {
      expect(document.querySelector(sel)).toBe(els[i]);
    });
  });

  it('returns null for document.body', () => {
    expect(generateSelector(document.body)).toBeNull();
  });

  it('returns null for document.documentElement', () => {
    expect(generateSelector(document.documentElement)).toBeNull();
  });

  it('returns null for null input', () => {
    expect(generateSelector(null)).toBeNull();
  });

  it('handles elements with stable class names', () => {
    document.body.innerHTML = '<div><span class="price">$10</span><span class="label">Name</span></div>';
    const el = document.querySelector('.price');
    const selector = generateSelector(el);
    expect(selector).not.toBeNull();
    expect(document.querySelector(selector)).toBe(el);
  });
});

describe('validateSelector', () => {
  it('returns true when selector uniquely matches expected element', () => {
    document.body.innerHTML = '<div id="target">Hello</div>';
    const el = document.getElementById('target');
    expect(validateSelector('#target', el)).toBe(true);
  });

  it('returns false when selector matches a different element', () => {
    document.body.innerHTML = '<div class="item">First</div><div class="item">Second</div>';
    const first = document.querySelectorAll('.item')[0];
    const second = document.querySelectorAll('.item')[1];
    // .item matches multiple elements; first match is first, not second
    expect(validateSelector('.item', second)).toBe(false);
  });

  it('returns false when selector matches nothing', () => {
    document.body.innerHTML = '<div>Content</div>';
    const el = document.querySelector('div');
    expect(validateSelector('#nonexistent', el)).toBe(false);
  });

  it('returns false for invalid selector syntax', () => {
    document.body.innerHTML = '<div>Content</div>';
    const el = document.querySelector('div');
    expect(validateSelector('[[[invalid', el)).toBe(false);
  });
});

describe('detectEnv', () => {
  it('returns an object with ua, vp, and dt fields', () => {
    const env = detectEnv();
    expect(env).toHaveProperty('ua');
    expect(env).toHaveProperty('vp');
    expect(env).toHaveProperty('dt');
  });

  it('ua is a string in browser/version format', () => {
    const env = detectEnv();
    expect(typeof env.ua).toBe('string');
    expect(env.ua).toMatch(/^[A-Z]\//);
  });

  it('vp is an array of two numbers', () => {
    const env = detectEnv();
    expect(Array.isArray(env.vp)).toBe(true);
    expect(env.vp.length).toBe(2);
    expect(typeof env.vp[0]).toBe('number');
    expect(typeof env.vp[1]).toBe('number');
  });

  it('dt is one of d, t, or m', () => {
    const env = detectEnv();
    expect(['d', 't', 'm']).toContain(env.dt);
  });

  it('classifies wide viewports as desktop', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true });
    const env = detectEnv();
    expect(env.dt).toBe('d');
  });

  it('classifies narrow viewports as mobile', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    const env = detectEnv();
    expect(env.dt).toBe('m');
  });

  it('classifies medium viewports as tablet', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
    const env = detectEnv();
    expect(env.dt).toBe('t');
  });
});
