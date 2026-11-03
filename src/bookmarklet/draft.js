/**
 * Local draft persistence for Pinment annotations.
 *
 * Ephemerally auto-saves in-progress reviews to localStorage so users
 * don't lose annotations on accidental tab closes or navigation.
 */

const STORAGE_PREFIX = 'pinment-draft:';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getDraftKey(url) {
  const target = url || (typeof window !== 'undefined' && window.location ? window.location.href : '');
  try {
    const parsed = new URL(target);
    return STORAGE_PREFIX + parsed.origin + parsed.pathname;
  } catch {
    return STORAGE_PREFIX + (target ? target.split('#')[0].split('?')[0] : 'default');
  }
}

export function saveDraft(pins, nextId, url) {
  if (typeof localStorage === 'undefined') return;
  const key = getDraftKey(url);
  if (!pins || pins.length === 0) {
    clearDraft(url);
    return;
  }
  try {
    const payload = {
      timestamp: Date.now(),
      nextId: nextId || (Math.max(...pins.map((p) => p.id), 0) + 1),
      pins,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // localStorage may be full or blocked
  }
}

export function loadDraft(url) {
  if (typeof localStorage === 'undefined') return null;
  const key = getDraftKey(url);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.pins) || data.pins.length === 0) return null;
    if (data.timestamp && Date.now() - data.timestamp > MAX_AGE_MS) {
      clearDraft(url);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearDraft(url) {
  if (typeof localStorage === 'undefined') return;
  const key = getDraftKey(url);
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}
