import LZString from 'lz-string';

export const SCHEMA_VERSION = 2;
export const MAX_URL_BYTES = 8000;

const DEFAULT_BASE_URL = 'https://khawkins98.github.io/pinment/';

export function createState(url, viewport, pins = [], env = null) {
  const state = { v: SCHEMA_VERSION, url, viewport, pins };
  if (env) state.env = env;
  return state;
}

export function compress(state) {
  const json = JSON.stringify(state);
  return LZString.compressToEncodedURIComponent(json);
}

export function decompress(compressed) {
  if (!compressed) return null;
  const json = LZString.decompressFromEncodedURIComponent(compressed);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function createShareUrl(state, baseUrl = DEFAULT_BASE_URL) {
  const compressed = compress(state);
  return `${baseUrl}#data=${compressed}`;
}

export function parseShareUrl(url) {
  try {
    const parsed = new URL(url);
    const hash = parsed.hash;
    if (!hash.startsWith('#data=')) return null;
    const compressed = hash.slice(6);
    return decompress(compressed);
  } catch {
    return null;
  }
}

/**
 * Migrates a v1 state to v2 format.
 * v1 pins (x ratio + y absolute) become v2 pins with pixel-only fallback.
 */
export function migrateV1toV2(state) {
  if (!state || state.v !== 1) return state;
  return {
    v: 2,
    url: state.url,
    viewport: state.viewport,
    env: null,
    pins: state.pins.map(pin => ({
      id: pin.id,
      s: null,
      ox: null,
      oy: null,
      fx: Math.round(pin.x * state.viewport),
      fy: pin.y,
      author: pin.author || '',
      text: pin.text,
    })),
  };
}

function validateV1(state) {
  if (state.v !== 1) return null;
  if (typeof state.url !== 'string') return null;
  if (typeof state.viewport !== 'number') return null;
  if (!Array.isArray(state.pins)) return null;

  for (const pin of state.pins) {
    if (typeof pin.id !== 'number') return null;
    if (typeof pin.x !== 'number' || pin.x < 0 || pin.x > 1) return null;
    if (typeof pin.y !== 'number') return null;
    if (typeof pin.text !== 'string') return null;
    if (pin.author !== undefined && typeof pin.author !== 'string') return null;
  }

  return state;
}

function validateV2(state) {
  if (state.v !== 2) return null;
  if (typeof state.url !== 'string') return null;
  if (typeof state.viewport !== 'number') return null;
  if (!Array.isArray(state.pins)) return null;

  if (state.env !== null && state.env !== undefined) {
    if (typeof state.env !== 'object') return null;
  }

  for (const pin of state.pins) {
    if (typeof pin.id !== 'number') return null;
    // s: string or null
    if (pin.s !== null && pin.s !== undefined && typeof pin.s !== 'string') return null;
    // ox/oy: number 0-1 or null
    if (pin.ox !== null && pin.ox !== undefined) {
      if (typeof pin.ox !== 'number' || pin.ox < 0 || pin.ox > 1) return null;
    }
    if (pin.oy !== null && pin.oy !== undefined) {
      if (typeof pin.oy !== 'number' || pin.oy < 0 || pin.oy > 1) return null;
    }
    // fx/fy: required numbers (fallback coordinates)
    if (typeof pin.fx !== 'number') return null;
    if (typeof pin.fy !== 'number') return null;
    if (typeof pin.text !== 'string') return null;
    if (pin.author !== undefined && typeof pin.author !== 'string') return null;
  }

  return state;
}

export function validateState(state) {
  if (!state || typeof state !== 'object') return null;

  // Accept v1 and migrate to v2
  if (state.v === 1) {
    const valid = validateV1(state);
    return valid ? migrateV1toV2(valid) : null;
  }

  if (state.v === 2) {
    return validateV2(state);
  }

  return null;
}

export function estimateUrlSize(state, baseUrl = DEFAULT_BASE_URL) {
  const url = createShareUrl(state, baseUrl);
  return new TextEncoder().encode(url).length;
}
