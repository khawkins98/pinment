import { describe, it, expect } from 'vitest';
import {
  createState,
  compress,
  decompress,
  createShareUrl,
  parseShareUrl,
  validateState,
  estimateUrlSize,
  SCHEMA_VERSION,
  MAX_URL_BYTES,
} from '../src/state.js';

describe('createState', () => {
  it('creates state with correct schema version', () => {
    const state = createState('https://example.com', 1440);
    expect(state.v).toBe(SCHEMA_VERSION);
  });

  it('creates state with url, viewport, and empty pins', () => {
    const state = createState('https://example.com', 1440);
    expect(state.url).toBe('https://example.com');
    expect(state.viewport).toBe(1440);
    expect(state.pins).toEqual([]);
  });

  it('accepts initial pins', () => {
    const pins = [{ id: 1, x: 0.5, y: 200, author: 'AL', text: 'test' }];
    const state = createState('https://example.com', 1440, pins);
    expect(state.pins).toEqual(pins);
  });
});

describe('compress / decompress', () => {
  it('roundtrips a state object', () => {
    const state = createState('https://example.com/page', 1440, [
      { id: 1, x: 0.25, y: 100, author: 'FL', text: 'Fix this heading' },
    ]);
    const compressed = compress(state);
    const result = decompress(compressed);
    expect(result).toEqual(state);
  });

  it('produces a URL-safe string', () => {
    const state = createState('https://example.com', 1440);
    const compressed = compress(state);
    // lz-string's compressToEncodedURIComponent should produce URL-safe output
    expect(compressed).toMatch(/^[A-Za-z0-9+/=\-_.!~*'()]*$/);
    // Should not contain characters that need encoding
    expect(compressed).toBe(encodeURIComponent(compressed));
  });

  it('returns null for invalid compressed data', () => {
    expect(decompress('not-valid-compressed-data')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(decompress('')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(decompress(null)).toBeNull();
  });

  it('handles special characters in comments', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 50, author: 'KH', text: 'Use "quotes" & <tags> here' },
    ]);
    const result = decompress(compress(state));
    expect(result.pins[0].text).toBe('Use "quotes" & <tags> here');
  });

  it('handles unicode in comments', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 50, author: '日本', text: '修正してください 🎉' },
    ]);
    const result = decompress(compress(state));
    expect(result.pins[0].text).toBe('修正してください 🎉');
    expect(result.pins[0].author).toBe('日本');
  });
});

describe('createShareUrl / parseShareUrl', () => {
  const baseUrl = 'https://khawkins98.github.io/pinment/';

  it('creates a valid URL with #data= fragment', () => {
    const state = createState('https://example.com', 1440);
    const url = createShareUrl(state, baseUrl);
    expect(url).toContain(baseUrl);
    expect(url).toContain('#data=');
  });

  it('roundtrips through URL creation and parsing', () => {
    const state = createState('https://staging.example.com/about', 1440, [
      { id: 1, x: 0.45, y: 832, author: 'FL', text: 'Wrong heading' },
      { id: 2, x: 0.8, y: 1200, author: 'KH', text: 'Image missing alt text' },
    ]);
    const url = createShareUrl(state, baseUrl);
    const parsed = parseShareUrl(url);
    expect(parsed).toEqual(state);
  });

  it('returns null for URLs without #data= fragment', () => {
    expect(parseShareUrl('https://example.com')).toBeNull();
    expect(parseShareUrl('https://example.com#other=stuff')).toBeNull();
  });

  it('returns null for invalid URLs', () => {
    expect(parseShareUrl('')).toBeNull();
    expect(parseShareUrl('not a url')).toBeNull();
  });

  it('uses default base URL when none provided', () => {
    const state = createState('https://example.com', 1440);
    const url = createShareUrl(state);
    expect(url).toContain('#data=');
  });
});

describe('validateState', () => {
  it('accepts a valid state object', () => {
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 100, author: 'FL', text: 'Test' },
    ]);
    expect(validateState(state)).toEqual(state);
  });

  it('rejects null/undefined', () => {
    expect(validateState(null)).toBeNull();
    expect(validateState(undefined)).toBeNull();
  });

  it('rejects wrong schema version', () => {
    expect(validateState({ v: 99, url: 'x', viewport: 1440, pins: [] })).toBeNull();
  });

  it('rejects missing url', () => {
    expect(validateState({ v: 1, viewport: 1440, pins: [] })).toBeNull();
  });

  it('rejects missing viewport', () => {
    expect(validateState({ v: 1, url: 'x', pins: [] })).toBeNull();
  });

  it('rejects non-array pins', () => {
    expect(validateState({ v: 1, url: 'x', viewport: 1440, pins: 'not array' })).toBeNull();
  });

  it('rejects pin with x outside 0-1', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 1.5, y: 100, author: '', text: '' }] };
    expect(validateState(state)).toBeNull();
  });

  it('rejects pin with negative x', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: -0.1, y: 100, author: '', text: '' }] };
    expect(validateState(state)).toBeNull();
  });

  it('rejects pin with missing text', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 0.5, y: 100, author: '' }] };
    expect(validateState(state)).toBeNull();
  });

  it('accepts pins with empty text', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 0.5, y: 100, author: '', text: '' }] };
    expect(validateState(state)).toEqual(state);
  });

  it('accepts state with no pins', () => {
    const state = { v: 1, url: 'https://example.com', viewport: 1440, pins: [] };
    expect(validateState(state)).toEqual(state);
  });

  it('rejects pin with non-string author', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 0.5, y: 100, author: 42, text: '' }] };
    expect(validateState(state)).toBeNull();
  });

  it('accepts pin with undefined author', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 0.5, y: 100, text: 'no author' }] };
    expect(validateState(state)).toEqual(state);
  });

  it('rejects non-object input', () => {
    expect(validateState('string')).toBeNull();
    expect(validateState(42)).toBeNull();
    expect(validateState(true)).toBeNull();
  });
});

describe('estimateUrlSize', () => {
  it('returns a number of bytes', () => {
    const state = createState('https://example.com', 1440);
    const size = estimateUrlSize(state);
    expect(typeof size).toBe('number');
    expect(size).toBeGreaterThan(0);
  });

  it('grows with more pins', () => {
    const small = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 100, author: 'A', text: 'Short' },
    ]);
    const large = createState('https://example.com', 1440, Array.from({ length: 20 }, (_, i) => ({
      id: i + 1, x: Math.random(), y: Math.random() * 5000, author: 'Author', text: `Comment number ${i + 1} with some detail`,
    })));
    expect(estimateUrlSize(large)).toBeGreaterThan(estimateUrlSize(small));
  });

  it('stays within browser limits for reasonable annotation sets', () => {
    const state = createState('https://example.com/long/path/to/page', 1440, Array.from({ length: 50 }, (_, i) => ({
      id: i + 1, x: Math.random(), y: Math.random() * 5000, author: 'FL', text: `Comment ${i + 1}`,
    })));
    // Should fit in 8KB for 50 short annotations
    expect(estimateUrlSize(state)).toBeLessThan(MAX_URL_BYTES);
  });
});
