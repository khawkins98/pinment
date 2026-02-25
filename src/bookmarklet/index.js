/**
 * Pinment bookmarklet entry point
 *
 * When invoked on a target page, this script injects the annotation UI,
 * allows pin placement, and provides share/restore functionality.
 * All DOM elements use the pinment- class namespace to avoid conflicts.
 */
import { buildStyles, createPinElement, createPanel, calculatePinPosition, createWelcomeModal, createDocsSiteModal } from './ui.js';
import { compress, parseShareUrl, createShareUrl, estimateUrlSize, SCHEMA_VERSION, MAX_URL_BYTES } from '../state.js';
const STORAGE_KEY_AUTHOR = 'pinment-author';
const PANEL_ID = 'pinment-panel';
const STYLE_ID = 'pinment-styles';
const OVERLAY_ID = 'pinment-overlay';
const PIN_CONTAINER_ID = 'pinment-pin-container';

(function pinment() {
  // Toggle off if already active
  if (document.getElementById(PANEL_ID)) {
    deactivate();
    return;
  }

  const state = {
    pins: [],
    nextId: 1,
    pinsVisible: true,
    viewportWidth: window.innerWidth,
  };

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = buildStyles();
  document.head.appendChild(styleEl);

  // Detect if running on the Pinment docs site itself
  if (document.body.hasAttribute('data-pinment-site')) {
    const { modal, promise } = createDocsSiteModal();
    document.body.appendChild(modal);
    promise.then(() => deactivate());
    return;
  }

  // Create pin container (covers entire document for absolute positioning)
  const pinContainer = document.createElement('div');
  pinContainer.id = PIN_CONTAINER_ID;
  pinContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483639;';
  document.body.appendChild(pinContainer);

  // Stored author name
  let authorName = '';
  try {
    authorName = localStorage.getItem(STORAGE_KEY_AUTHOR) || '';
  } catch {
    // localStorage may not be available
  }

  // Show welcome modal for restoring annotations or starting fresh
  const { modal, promise } = createWelcomeModal(parseShareUrl);
  document.body.appendChild(modal);

  promise.then((shareUrl) => {
    // User cancelled – tear down and exit
    if (shareUrl === false) {
      deactivate();
      return;
    }
    if (shareUrl) {
      const loaded = parseShareUrl(shareUrl);
      if (loaded) {
        for (const pin of loaded.pins) {
          state.pins.push(pin);
          const el = createPinElement(pin, state.viewportWidth);
          el.style.pointerEvents = 'auto';
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            scrollToComment(pin.id);
          });
          pinContainer.appendChild(el);
        }
        state.nextId = loaded.pins.length > 0 ? Math.max(...loaded.pins.map((p) => p.id)) + 1 : 1;
        if (loaded.viewport && loaded.viewport !== state.viewportWidth) {
          showViewportWarning(loaded.viewport);
        }
      }
    }

    // Build panel and enable pin mode after modal resolves
    renderPanel();
    enablePinMode();
  });

  // Click handler for adding pins
  function enablePinMode() {
    if (document.getElementById(OVERLAY_ID)) return;
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'pinment-overlay';
    overlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const pageX = e.clientX + scrollX;
      const pageY = e.clientY + scrollY;

      const pos = calculatePinPosition(pageX, pageY, state.viewportWidth);
      const pin = {
        id: state.nextId++,
        x: pos.x,
        y: pos.y,
        author: authorName,
        text: '',
      };
      state.pins.push(pin);

      const el = createPinElement(pin, state.viewportWidth);
      el.style.pointerEvents = 'auto';
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        scrollToComment(pin.id);
      });
      pinContainer.appendChild(el);

      // Remove overlay after placing pin
      overlay.remove();

      // Re-render panel to show new comment
      renderPanel();
    });
    document.body.appendChild(overlay);
  }

  function renderPanel() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) existing.remove();

    const panel = createPanel(state.pins, {
      editable: true,
      onShare: handleShare,
      onToggle: handleToggle,
      onClose: deactivate,
      onSave: handleSave,
      onDelete: handleDelete,
    });
    panel.id = PANEL_ID;

    // Add capacity indicator
    updateCapacity(panel);

    document.body.appendChild(panel);

    // Re-enable pin mode overlay if not present
    if (!document.getElementById(OVERLAY_ID)) {
      enablePinMode();
    }
  }

  function handleSave(pinId, text, author) {
    const pin = state.pins.find((p) => p.id === pinId);
    if (pin) {
      pin.text = text;
      pin.author = author;
      authorName = author;
      try {
        localStorage.setItem(STORAGE_KEY_AUTHOR, author);
      } catch {
        // Ignore storage errors
      }
    }
    updateCapacity(document.getElementById(PANEL_ID));
  }

  function handleDelete(pinId) {
    if (!confirm('Delete this pin?')) return;
    state.pins = state.pins.filter((p) => p.id !== pinId);
    // Remove pin element from page
    const pinEl = pinContainer.querySelector(`[data-pinment-id="${pinId}"]`);
    if (pinEl) pinEl.remove();
    renderPanel();
  }

  function handleToggle() {
    state.pinsVisible = !state.pinsVisible;
    pinContainer.style.display = state.pinsVisible ? '' : 'none';
  }

  function buildStateData() {
    return {
      v: SCHEMA_VERSION,
      url: window.location.href.split('#')[0],
      viewport: state.viewportWidth,
      pins: state.pins,
    };
  }

  function handleShare() {
    const data = buildStateData();
    const size = estimateUrlSize(data);

    if (size > MAX_URL_BYTES) {
      alert(`The share URL is ${Math.round(size / 1024)}KB, which exceeds the ~${Math.round(MAX_URL_BYTES / 1024)}KB limit. Remove some annotations or shorten comments before sharing.`);
      return;
    }

    const shareUrl = createShareUrl(data);

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showShareConfirmation();
      }).catch(() => {
        prompt('Copy this share URL:', shareUrl);
      });
    } else {
      prompt('Copy this share URL:', shareUrl);
    }
  }

  function showShareConfirmation() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    let toast = panel.querySelector('.pinment-toast');
    if (toast) toast.remove();
    toast = document.createElement('div');
    toast.className = 'pinment-toast';
    toast.textContent = 'Share URL copied to clipboard';
    panel.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  function scrollToComment(pinId) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const comment = panel.querySelector(`.pinment-comment[data-pinment-id="${pinId}"]`);
    if (comment) {
      comment.scrollIntoView({ behavior: 'smooth', block: 'center' });
      comment.style.background = '#fffff0';
      setTimeout(() => {
        comment.style.background = '';
      }, 1500);
    }
  }

  function showViewportWarning(originalViewport) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const warning = document.createElement('div');
    warning.className = 'pinment-viewport-warning';
    warning.textContent = `These annotations were created at ${originalViewport}px viewport width. Your current viewport is ${state.viewportWidth}px \u2014 pins may appear shifted.`;
    panel.insertBefore(warning, panel.children[1] || null);
  }

  function updateCapacity(panel) {
    if (!panel) return;
    let capacityEl = panel.querySelector('.pinment-capacity');
    if (!capacityEl) {
      capacityEl = document.createElement('div');
      capacityEl.className = 'pinment-capacity';
      const footer = panel.querySelector('.pinment-panel-footer');
      if (footer) footer.appendChild(capacityEl);
    }

    const data = buildStateData();
    const size = estimateUrlSize(data);
    const pct = Math.min(100, Math.round((size / MAX_URL_BYTES) * 100));
    const overLimit = size > MAX_URL_BYTES;

    let fillClass = 'pinment-capacity-fill';
    if (overLimit || pct > 80) fillClass += ' pinment-capacity-fill-danger';
    else if (pct > 60) fillClass += ' pinment-capacity-fill-warn';

    const label = overLimit
      ? `URL capacity: over limit (${Math.round(size / 1024)}KB / ${Math.round(MAX_URL_BYTES / 1024)}KB)`
      : `URL capacity: ${pct}%`;

    capacityEl.innerHTML = `
      <span>${label}</span>
      <div class="pinment-capacity-bar">
        <div class="${fillClass}" style="width:${Math.min(pct, 100)}%"></div>
      </div>
    `;

    // Disable share button when over limit
    const shareBtn = panel.querySelector('.pinment-btn-share');
    if (shareBtn) {
      shareBtn.disabled = overLimit;
      shareBtn.title = overLimit ? 'Remove annotations or shorten comments to share' : '';
    }
  }

  function deactivate() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
    const container = document.getElementById(PIN_CONTAINER_ID);
    if (container) container.remove();
  }
})();
