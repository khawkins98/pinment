import { describe, it, expect } from 'vitest';
import {
  createState,
  compress,
  decompress,
  createShareUrl,
  parseShareUrl,
  validateState,
  migrateV1toV2,
  estimateUrlSize,
  SCHEMA_VERSION,
  MAX_URL_BYTES,
} from '../src/state.js';

// Helper to create v2-format pins
function v2Pin(overrides = {}) {
  return { id: 1, s: '#main>p:nth-of-type(1)', ox: 0.5, oy: 0.3, fx: 720, fy: 200, author: 'FL', text: 'Test', ...overrides };
}

describe('createState', () => {
  it('creates state with correct schema version', () => {
    const state = createState('https://example.com', 1440);
    expect(state.v).toBe(SCHEMA_VERSION);
    expect(state.v).toBe(2);
  });

  it('creates state with url, viewport, and empty pins', () => {
    const state = createState('https://example.com', 1440);
    expect(state.url).toBe('https://example.com');
    expect(state.viewport).toBe(1440);
    expect(state.pins).toEqual([]);
  });

  it('accepts initial pins', () => {
    const pins = [v2Pin()];
    const state = createState('https://example.com', 1440, pins);
    expect(state.pins).toEqual(pins);
  });

  it('accepts env metadata', () => {
    const env = { ua: 'C/130', vp: [1440, 900], dt: 'd' };
    const state = createState('https://example.com', 1440, [], env);
    expect(state.env).toEqual(env);
  });

  it('omits env when not provided', () => {
    const state = createState('https://example.com', 1440);
    expect(state.env).toBeUndefined();
  });
});

describe('compress / decompress', () => {
  it('roundtrips a state object', () => {
    const state = createState('https://example.com/page', 1440, [
      v2Pin({ id: 1, s: '#heading', ox: 0.25, oy: 0.1, fx: 360, fy: 100, author: 'FL', text: 'Fix this heading' }),
    ]);
    const compressed = compress(state);
    const result = decompress(compressed);
    expect(result).toEqual(state);
  });

  it('produces a URL-safe string', () => {
    const state = createState('https://example.com', 1440);
    const compressed = compress(state);
    // lz-string's compressToEncodedURIComponent uses a custom base64 alphabet
    // that may include + which is safe in fragments but encoded by encodeURIComponent.
    // Verify it roundtrips correctly through a URL fragment.
    expect(typeof compressed).toBe('string');
    expect(compressed.length).toBeGreaterThan(0);
    const roundtripped = decompress(compressed);
    expect(roundtripped).toEqual(state);
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
      v2Pin({ text: 'Use "quotes" & <tags> here' }),
    ]);
    const result = decompress(compress(state));
    expect(result.pins[0].text).toBe('Use "quotes" & <tags> here');
  });

  it('handles unicode in comments', () => {
    const state = createState('https://example.com', 1440, [
      v2Pin({ author: '日本', text: '修正してください 🎉' }),
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
      v2Pin({ id: 1, s: '#content>h1', ox: 0.45, oy: 0.5, fx: 648, fy: 832, author: 'FL', text: 'Wrong heading' }),
      v2Pin({ id: 2, s: null, ox: null, oy: null, fx: 1152, fy: 1200, author: 'KH', text: 'Image missing alt text' }),
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

describe('migrateV1toV2', () => {
  it('converts v1 pins to v2 format', () => {
    const v1 = { v: 1, url: 'https://example.com', viewport: 1440, pins: [
      { id: 1, x: 0.5, y: 100, author: 'FL', text: 'Test' },
    ]};
    const v2 = migrateV1toV2(v1);
    expect(v2.v).toBe(2);
    expect(v2.env).toBeNull();
    expect(v2.pins[0]).toEqual({
      id: 1, s: null, ox: null, oy: null, fx: 720, fy: 100, author: 'FL', text: 'Test',
    });
  });

  it('computes fx from x * viewport', () => {
    const v1 = { v: 1, url: 'x', viewport: 800, pins: [
      { id: 1, x: 0.25, y: 300, author: '', text: '' },
    ]};
    const v2 = migrateV1toV2(v1);
    expect(v2.pins[0].fx).toBe(200);
    expect(v2.pins[0].fy).toBe(300);
  });

  it('sets s, ox, oy to null', () => {
    const v1 = { v: 1, url: 'x', viewport: 1440, pins: [
      { id: 1, x: 0.5, y: 100, text: 'test' },
    ]};
    const v2 = migrateV1toV2(v1);
    expect(v2.pins[0].s).toBeNull();
    expect(v2.pins[0].ox).toBeNull();
    expect(v2.pins[0].oy).toBeNull();
  });

  it('defaults author to empty string if undefined', () => {
    const v1 = { v: 1, url: 'x', viewport: 1440, pins: [
      { id: 1, x: 0.5, y: 100, text: 'test' },
    ]};
    const v2 = migrateV1toV2(v1);
    expect(v2.pins[0].author).toBe('');
  });

  it('returns non-v1 state unchanged', () => {
    const s = { v: 2, url: 'x', viewport: 1440, pins: [] };
    expect(migrateV1toV2(s)).toBe(s);
  });
});

describe('validateState', () => {
  it('accepts a valid v2 state object', () => {
    const state = createState('https://example.com', 1440, [v2Pin()]);
    expect(validateState(state)).toEqual(state);
  });

  it('accepts v1 state and returns migrated v2', () => {
    const v1 = { v: 1, url: 'https://example.com', viewport: 1440, pins: [
      { id: 1, x: 0.5, y: 100, author: 'FL', text: 'Test' },
    ]};
    const result = validateState(v1);
    expect(result.v).toBe(2);
    expect(result.pins[0].s).toBeNull();
    expect(result.pins[0].fx).toBe(720);
    expect(result.pins[0].fy).toBe(100);
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
    expect(validateState({ v: 2, viewport: 1440, pins: [] })).toBeNull();
  });

  it('rejects missing viewport', () => {
    expect(validateState({ v: 1, url: 'x', pins: [] })).toBeNull();
    expect(validateState({ v: 2, url: 'x', pins: [] })).toBeNull();
  });

  it('rejects non-array pins', () => {
    expect(validateState({ v: 1, url: 'x', viewport: 1440, pins: 'not array' })).toBeNull();
    expect(validateState({ v: 2, url: 'x', viewport: 1440, pins: 'not array' })).toBeNull();
  });

  it('rejects v1 pin with x outside 0-1', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 1.5, y: 100, author: '', text: '' }] };
    expect(validateState(state)).toBeNull();
  });

  it('rejects v1 pin with negative x', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: -0.1, y: 100, author: '', text: '' }] };
    expect(validateState(state)).toBeNull();
  });

  it('rejects pin with missing text', () => {
    expect(validateState({ v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 0.5, y: 100, author: '' }] })).toBeNull();
    expect(validateState({ v: 2, url: 'x', viewport: 1440, pins: [{ id: 1, fx: 720, fy: 100, author: '' }] })).toBeNull();
  });

  it('accepts v1 pins with empty text and migrates', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 0.5, y: 100, author: '', text: '' }] };
    const result = validateState(state);
    expect(result.v).toBe(2);
    expect(result.pins[0].fx).toBe(720);
  });

  it('accepts v2 state with no pins', () => {
    const state = { v: 2, url: 'https://example.com', viewport: 1440, pins: [] };
    expect(validateState(state)).toEqual(state);
  });

  it('accepts v1 state with no pins and migrates', () => {
    const state = { v: 1, url: 'https://example.com', viewport: 1440, pins: [] };
    const result = validateState(state);
    expect(result.v).toBe(2);
    expect(result.env).toBeNull();
  });

  it('rejects pin with non-string author', () => {
    expect(validateState({ v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 0.5, y: 100, author: 42, text: '' }] })).toBeNull();
  });

  it('accepts v1 pin with undefined author and migrates', () => {
    const state = { v: 1, url: 'x', viewport: 1440, pins: [{ id: 1, x: 0.5, y: 100, text: 'no author' }] };
    const result = validateState(state);
    expect(result.v).toBe(2);
    expect(result.pins[0].author).toBe('');
    expect(result.pins[0].text).toBe('no author');
  });

  it('rejects v2 pin with ox outside 0-1', () => {
    const state = { v: 2, url: 'x', viewport: 1440, pins: [{ id: 1, s: '#x', ox: 1.5, oy: 0.5, fx: 100, fy: 100, text: '' }] };
    expect(validateState(state)).toBeNull();
  });

  it('rejects v2 pin with missing fx', () => {
    const state = { v: 2, url: 'x', viewport: 1440, pins: [{ id: 1, s: '#x', ox: 0.5, oy: 0.5, fy: 100, text: '' }] };
    expect(validateState(state)).toBeNull();
  });

  it('accepts v2 pin with null selector (pixel-only fallback)', () => {
    const state = { v: 2, url: 'x', viewport: 1440, pins: [
      { id: 1, s: null, ox: null, oy: null, fx: 720, fy: 100, text: 'test' },
    ]};
    expect(validateState(state)).toEqual(state);
  });

  it('accepts v2 state with env metadata', () => {
    const state = { v: 2, url: 'x', viewport: 1440, env: { ua: 'C/130', vp: [1440, 900], dt: 'd' }, pins: [] };
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
      v2Pin({ id: 1, text: 'Short' }),
    ]);
    const large = createState('https://example.com', 1440, Array.from({ length: 20 }, (_, i) => (
      v2Pin({ id: i + 1, fx: Math.random() * 1440, fy: Math.random() * 5000, author: 'Author', text: `Comment number ${i + 1} with some detail` })
    )));
    expect(estimateUrlSize(large)).toBeGreaterThan(estimateUrlSize(small));
  });

  it('stays within browser limits for reasonable annotation sets', () => {
    const state = createState('https://example.com/long/path/to/page', 1440, Array.from({ length: 50 }, (_, i) => (
      v2Pin({ id: i + 1, s: `#content>p:nth-of-type(${i + 1})`, fx: Math.random() * 1440, fy: Math.random() * 5000, text: `Comment ${i + 1}` })
    )));
    expect(estimateUrlSize(state)).toBeLessThan(MAX_URL_BYTES);
  });
});
