import LZString from 'lz-string';

export const SCHEMA_VERSION = 2;
export const MAX_URL_BYTES = 8000;

export const PIN_CATEGORIES = ['text', 'layout', 'missing', 'question'];

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

export function validateState(state) {
  if (!state || typeof state !== 'object') return null;
  if (state.v !== SCHEMA_VERSION) return null;
  if (typeof state.url !== 'string') return null;
  if (typeof state.viewport !== 'number') return null;
  if (!Array.isArray(state.pins)) return null;

  if (state.env !== null && state.env !== undefined) {
    if (typeof state.env !== 'object') return null;
  }

  for (const pin of state.pins) {
    if (typeof pin.id !== 'number') return null;
    if (pin.s !== null && pin.s !== undefined && typeof pin.s !== 'string') return null;
    if (pin.ox !== null && pin.ox !== undefined) {
      if (typeof pin.ox !== 'number' || pin.ox < 0 || pin.ox > 1) return null;
    }
    if (pin.oy !== null && pin.oy !== undefined) {
      if (typeof pin.oy !== 'number' || pin.oy < 0 || pin.oy > 1) return null;
    }
    if (typeof pin.fx !== 'number') return null;
    if (typeof pin.fy !== 'number') return null;
    if (typeof pin.text !== 'string') return null;
    if (pin.author !== undefined && typeof pin.author !== 'string') return null;
    if (pin.c !== undefined && !PIN_CATEGORIES.includes(pin.c)) return null;
    if (pin.resolved !== undefined && typeof pin.resolved !== 'boolean') return null;
  }

  return state;
}

export function estimateUrlSize(state, baseUrl = DEFAULT_BASE_URL) {
  const url = createShareUrl(state, baseUrl);
  return new TextEncoder().encode(url).length;
}

export function exportStateAsJson(state) {
  return JSON.stringify(state, null, 2);
}
