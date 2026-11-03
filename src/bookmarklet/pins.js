/**
 * Pin creation, positioning, and target highlight operations.
 */
import { generateSelector } from '../selector.js';

/**
 * Identifies the DOM element under the click, generates a CSS selector,
 * and computes offset ratios within the element's bounding box.
 *
 * @param {number} clientX - viewport-relative X from the click event
 * @param {number} clientY - viewport-relative Y from the click event
 * @param {HTMLElement|null} overlay - the click overlay to temporarily hide
 * @param {HTMLElement|null} pinContainer - the pin container to temporarily hide
 * @returns {{ s: string|null, ox: number|null, oy: number|null, fx: number, fy: number }}
 */
export function calculatePinPosition(clientX, clientY, overlay, pinContainer) {
  // Temporarily hide Pinment elements from hit testing
  if (overlay) overlay.style.pointerEvents = 'none';
  if (pinContainer) pinContainer.style.display = 'none';

  const targetEl = document.elementFromPoint(clientX, clientY);

  // Restore
  if (overlay) overlay.style.pointerEvents = '';
  if (pinContainer) pinContainer.style.display = '';

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const pageX = clientX + scrollX;
  const pageY = clientY + scrollY;

  if (!targetEl || targetEl === document.body || targetEl === document.documentElement) {
    return { s: null, ox: null, oy: null, fx: Math.round(pageX), fy: Math.round(pageY) };
  }

  const selector = generateSelector(targetEl);
  const rect = targetEl.getBoundingClientRect();

  const ox = rect.width > 0 ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) : 0.5;
  const oy = rect.height > 0 ? Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)) : 0.5;

  return {
    s: selector,
    ox: Math.round(ox * 1000) / 1000,
    oy: Math.round(oy * 1000) / 1000,
    fx: Math.round(pageX),
    fy: Math.round(pageY),
  };
}

/**
 * Creates a pin element positioned by element-based anchoring with pixel fallback.
 *
 * @param {object} pin - v2 pin object with s, ox, oy, fx, fy
 * @returns {HTMLElement}
 */
/**
 * Repositions a pin element to match its anchored DOM element's current position.
 *
 * @param {HTMLElement} pinEl - The pin dot element
 * @param {object} pin - The pin data object with s, ox, oy, fx, fy
 */
export function repositionPin(pinEl, pin) {
  let positioned = false;

  if (pin.s) {
    try {
      const target = document.querySelector(pin.s);
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        pinEl.style.left = `${rect.left + scrollX + (pin.ox != null ? pin.ox : 0.5) * rect.width}px`;
        pinEl.style.top = `${rect.top + scrollY + (pin.oy != null ? pin.oy : 0.5) * rect.height}px`;
        positioned = true;
      }
    } catch { /* invalid selector */ }
  }

  if (!positioned) {
    pinEl.style.left = `${pin.fx}px`;
    pinEl.style.top = `${pin.fy}px`;
  }

  pinEl.classList.toggle('pinment-pin-fallback', !!(pin.s && !positioned));
}

/**
 * Adds a visual highlight to the DOM element a pin is anchored to.
 * @param {object} pin - Pin data with selector `s`
 * @returns {Element|null} The highlighted element, or null
 */
export function highlightPinTarget(pin) {
  if (!pin.s) return null;
  try {
    const target = document.querySelector(pin.s);
    if (target) {
      target.classList.add('pinment-highlight');
      return target;
    }
  } catch { /* invalid selector */ }
  return null;
}

/**
 * Removes the highlight class from any currently highlighted elements.
 */
export function clearPinHighlight() {
  const highlighted = document.querySelectorAll('.pinment-highlight');
  for (const el of highlighted) {
    el.classList.remove('pinment-highlight');
  }
}

export function createPinElement(pin) {
  const el = document.createElement('div');
  el.className = 'pinment-pin';
  el.dataset.pinmentId = pin.id;
  el.textContent = String(pin.id);
  el.style.position = 'absolute';

  repositionPin(el, pin);

  if (pin.resolved) {
    el.classList.add('pinment-pin-resolved');
  }

  return el;
}


export function restorePins(state, container) {
  const elements = [];
  for (const pin of state.pins) {
    const el = createPinElement(pin);
    container.appendChild(el);
    elements.push(el);
  }
  return elements;
}
