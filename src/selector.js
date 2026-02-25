/**
 * CSS selector generation and environment detection for element-based pin anchoring.
 */

/**
 * Generates a stable, unique CSS selector for a DOM element.
 * Prefers IDs > data-testid > stable classes > nth-of-type.
 *
 * @param {Element} el
 * @returns {string|null}
 */
export function generateSelector(el) {
  if (!el || el === document.body || el === document.documentElement) return null;

  const segments = [];
  let current = el;

  while (current && current !== document.body && current !== document.documentElement) {
    const segment = buildSegment(current);
    segments.unshift(segment);

    // If we hit a usable ID, that's a unique root — stop
    if (segment.startsWith('#')) break;

    current = current.parentElement;
  }

  const selector = segments.join('>');

  // Validate uniqueness
  try {
    const matches = document.querySelectorAll(selector);
    if (matches.length === 1 && matches[0] === el) return selector;
  } catch {
    // Invalid selector — fall through
  }

  // Fallback: full path from body
  return buildFullPath(el);
}

/**
 * Validates that a selector uniquely identifies the expected element.
 *
 * @param {string} selector
 * @param {Element} expected
 * @returns {boolean}
 */
export function validateSelector(selector, expected) {
  try {
    const matches = document.querySelectorAll(selector);
    return matches.length === 1 && matches[0] === expected;
  } catch {
    return false;
  }
}

/**
 * Detects compact browser/device environment metadata.
 *
 * @returns {{ ua: string, vp: [number, number], dt: string }}
 */
export function detectEnv() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let browser = 'O';
  let ver = '';

  const edgeMatch = ua.match(/Edg\/(\d+)/);
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  const safariMatch = ua.match(/Version\/(\d+).*Safari/);

  if (edgeMatch) { browser = 'E'; ver = edgeMatch[1]; }
  else if (chromeMatch) { browser = 'C'; ver = chromeMatch[1]; }
  else if (firefoxMatch) { browser = 'F'; ver = firefoxMatch[1]; }
  else if (safariMatch) { browser = 'S'; ver = safariMatch[1]; }

  const w = typeof window !== 'undefined' ? window.innerWidth : 0;
  const h = typeof window !== 'undefined' ? window.innerHeight : 0;
  const dt = w < 768 ? 'm' : w < 1024 ? 't' : 'd';

  return { ua: `${browser}/${ver}`, vp: [w, h], dt };
}

function buildSegment(el) {
  // 1. Usable ID
  if (el.id && isStableId(el.id)) {
    return '#' + cssEscape(el.id);
  }

  const tag = el.tagName.toLowerCase();

  // 2. data-testid
  if (el.dataset && el.dataset.testid) {
    return tag + '[data-testid="' + el.dataset.testid + '"]';
  }

  // 3. Stable class name that's unique among siblings
  const stableClasses = filterStableClasses(el.classList);
  for (const cls of stableClasses) {
    const candidate = tag + '.' + cssEscape(cls);
    if (uniqueAmongSiblings(el, candidate)) return candidate;
  }

  // 4. nth-of-type fallback
  const index = nthOfTypeIndex(el);
  return tag + ':nth-of-type(' + index + ')';
}

function buildFullPath(el) {
  const segments = [];
  let current = el;

  while (current && current !== document.body && current !== document.documentElement) {
    if (current.id && isStableId(current.id)) {
      segments.unshift('#' + cssEscape(current.id));
      break;
    }
    const tag = current.tagName.toLowerCase();
    const index = nthOfTypeIndex(current);
    segments.unshift(tag + ':nth-of-type(' + index + ')');
    current = current.parentElement;
  }

  const selector = segments.join('>');

  try {
    const matches = document.querySelectorAll(selector);
    if (matches.length === 1 && matches[0] === el) return selector;
  } catch {
    // fall through
  }

  return null;
}

function isStableId(id) {
  if (/^[0-9a-f]{8,}$/i.test(id)) return false; // hex hashes
  if (/^\d+$/.test(id)) return false;             // pure numbers
  if (/[:.]/.test(id)) return false;               // framework-generated
  return true;
}

function filterStableClasses(classList) {
  if (!classList) return [];
  return Array.from(classList).filter(c =>
    !/^(css|sc|emotion|styled)-/.test(c) &&
    !/^[a-z]{1,2}-[0-9a-z]{4,}$/.test(c) &&
    !['hover', 'active', 'focus', 'open', 'hidden', 'show', 'visible', 'is-open', 'is-active', 'is-hidden'].includes(c)
  );
}

function uniqueAmongSiblings(el, selector) {
  const parent = el.parentElement;
  if (!parent) return false;
  try {
    const matches = parent.querySelectorAll(':scope>' + selector);
    return matches.length === 1 && matches[0] === el;
  } catch {
    return false;
  }
}

function nthOfTypeIndex(el) {
  let index = 1;
  let sibling = el.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === el.tagName) index++;
    sibling = sibling.previousElementSibling;
  }
  return index;
}

// CSS.escape polyfill for environments that lack it
function cssEscape(str) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(str);
  return str.replace(/([^\w-])/g, '\\$1');
}
