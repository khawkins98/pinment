/**
 * Pinment bookmarklet entry point
 *
 * When invoked on a target page, this script injects the annotation UI,
 * allows pin placement, and provides share/restore functionality.
 * All DOM elements use the pinment- class namespace to avoid conflicts.
 */
import { buildStyles, createPinElement, createPanel, calculatePinPosition, createWelcomeModal, createDocsSiteModal, createMinimizedButton, createExitConfirmModal, repositionPin, highlightPinTarget, clearPinHighlight } from './ui.js';
import { compress, parseShareUrl, validateState, createShareUrl, estimateUrlSize, exportStateAsJson, importStateFromJson, SCHEMA_VERSION, MAX_URL_BYTES } from '../state.js';
import { detectEnv } from '../selector.js';
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
    editMode: true,
    viewportWidth: window.innerWidth,
    env: detectEnv(),
    filters: {
      category: 'all',
      status: 'all',
      author: 'all',
      sort: 'id',
    },
  };

  let panelMinimized = false;
  const MINIMIZED_BTN_ID = 'pinment-minimized-btn';

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

  // Reposition all pins when the window is resized
  let resizeRafId = null;
  function repositionAllPins() {
    for (const pin of state.pins) {
      const pinEl = pinContainer.querySelector(`[data-pinment-id="${pin.id}"]`);
      if (pinEl) repositionPin(pinEl, pin);
    }
  }
  function onResize() {
    if (resizeRafId) cancelAnimationFrame(resizeRafId);
    resizeRafId = requestAnimationFrame(() => {
      resizeRafId = null;
      repositionAllPins();
    });
  }
  window.addEventListener('resize', onResize);

  // Stored author name
  let authorName = '';
  try {
    authorName = localStorage.getItem(STORAGE_KEY_AUTHOR) || '';
  } catch {
    // localStorage may not be available
  }

  // Show welcome modal for restoring annotations or starting fresh
  const { modal, promise } = createWelcomeModal(parseShareUrl, validateState);
  document.body.appendChild(modal);

  promise.then((result) => {
    // User cancelled – tear down and exit
    if (result === false) {
      deactivate();
      return;
    }

    let loaded = null;
    if (typeof result === 'string') {
      // Share URL
      const raw = parseShareUrl(result);
      loaded = raw ? validateState(raw) : null;
    } else if (typeof result === 'object' && result !== null) {
      // Imported state object
      loaded = validateState(result);
    }

    if (loaded) {
      loadState(loaded);
    }

    // Warn before navigating away with unsaved pins
    window.addEventListener('beforeunload', onBeforeUnload);

    // Enable keyboard shortcuts
    document.addEventListener('keydown', onKeyDown);

    // Build panel and enable pin mode after modal resolves
    renderPanel();
    enablePinMode();
  });

  function onBeforeUnload(e) {
    if (state.pins.length > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  }

  let activePinIndex = -1;

  function onKeyDown(e) {
    // Skip when typing in inputs or when a modal is open
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.querySelector('.pinment-modal-backdrop')) return;
    if (panelMinimized) return;

    if (e.key === 'Escape' && state.editMode) {
      e.preventDefault();
      handleEditModeToggle();
      return;
    }

    if ((e.key === 'n' || e.key === 'N') && !state.editMode) {
      e.preventDefault();
      handleEditModeToggle();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const panel = document.getElementById(PANEL_ID);
      if (!panel) return;
      const visibleIds = panel._visiblePinIds;
      if (!visibleIds || visibleIds.size === 0) return;
      const ids = Array.from(visibleIds).sort((a, b) => a - b);

      e.preventDefault();
      if (e.key === 'ArrowDown') {
        activePinIndex = activePinIndex < ids.length - 1 ? activePinIndex + 1 : 0;
      } else {
        activePinIndex = activePinIndex > 0 ? activePinIndex - 1 : ids.length - 1;
      }

      const pinId = ids[activePinIndex];
      scrollToComment(pinId);
      clearPinHighlight();
      const pin = state.pins.find((p) => p.id === pinId);
      if (pin) highlightPinTarget(pin);
    }
  }

  function loadState(loaded) {
    for (const pin of loaded.pins) {
      state.pins.push(pin);
      addPinToPage(pin);
    }
    state.nextId = loaded.pins.length > 0 ? Math.max(...loaded.pins.map((p) => p.id)) + 1 : 1;
    if (loaded.env) {
      setTimeout(() => showEnvBanner(loaded.env), 0);
    }
  }

  function addPinToPage(pin) {
    const el = createPinElement(pin);
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'grab';

    // Highlight anchored element on hover
    el.addEventListener('mouseenter', () => highlightPinTarget(pin));
    el.addEventListener('mouseleave', () => clearPinHighlight());

    makePinDraggable(el, pin);
    pinContainer.appendChild(el);
  }

  function makePinDraggable(pinEl, pin) {
    const DRAG_THRESHOLD = 5;
    let startX, startY, isDragging;

    pinEl.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;
      e.preventDefault();

      const onMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!isDragging && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
          isDragging = true;
          pinEl.classList.add('pinment-pin-dragging');
          clearPinHighlight();
        }
        if (isDragging) {
          const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;
          pinEl.style.left = `${e.clientX + scrollX}px`;
          pinEl.style.top = `${e.clientY + scrollY}px`;
        }
      };

      const onUp = (e) => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        pinEl.classList.remove('pinment-pin-dragging');

        if (isDragging) {
          const overlay = document.getElementById(OVERLAY_ID);
          const pos = calculatePinPosition(e.clientX, e.clientY, overlay, pinContainer);
          pin.s = pos.s;
          pin.ox = pos.ox;
          pin.oy = pos.oy;
          pin.fx = pos.fx;
          pin.fy = pos.fy;

          repositionPin(pinEl, pin);
          updateCapacity(document.getElementById(PANEL_ID));
        } else {
          scrollToComment(pin.id);
        }
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // Click handler for adding pins
  function enablePinMode() {
    if (document.getElementById(OVERLAY_ID)) return;
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'pinment-overlay';
    overlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const pos = calculatePinPosition(e.clientX, e.clientY, overlay, pinContainer);
      const pin = {
        id: state.nextId++,
        s: pos.s,
        ox: pos.ox,
        oy: pos.oy,
        fx: pos.fx,
        fy: pos.fy,
        author: authorName,
        text: '',
      };
      state.pins.push(pin);
      addPinToPage(pin);

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
      editMode: state.editMode,
      onEditModeToggle: handleEditModeToggle,
      onShare: handleShare,
      onToggle: handleToggle,
      onMinimize: minimizePanel,
      onExit: handleExit,
      onSave: handleSave,
      onDelete: handleDelete,
      onCategoryChange: handleCategoryChange,
      onResolveToggle: handleResolveToggle,
      onExport: handleExport,
      onReply: handleReply,
      onImport: handleImport,
      filters: state.filters,
      onFilterChange: handleFilterChange,
      onPinHover: handlePinHover,
      onPinHoverEnd: handlePinHoverEnd,
    });
    panel.id = PANEL_ID;

    // Add capacity indicator
    updateCapacity(panel);

    document.body.appendChild(panel);

    // Sync on-page pin marker visibility with filter state
    syncPinVisibility(panel._visiblePinIds);

    // Re-enable pin mode overlay if in edit mode
    if (state.editMode && !document.getElementById(OVERLAY_ID)) {
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

  function handleCategoryChange(pinId, category) {
    const pin = state.pins.find((p) => p.id === pinId);
    if (pin) {
      if (category) {
        pin.c = category;
      } else {
        delete pin.c;
      }
    }
    updateCapacity(document.getElementById(PANEL_ID));
  }

  function handleResolveToggle(pinId) {
    const pin = state.pins.find((p) => p.id === pinId);
    if (pin) {
      pin.resolved = !pin.resolved;
      if (!pin.resolved) delete pin.resolved;
    }
    // Update pin element appearance
    const pinEl = pinContainer.querySelector(`[data-pinment-id="${pinId}"]`);
    if (pinEl) {
      pinEl.classList.toggle('pinment-pin-resolved', !!pin?.resolved);
    }
    renderPanel();
  }

  function handleReply(pinId, text, author) {
    const pin = state.pins.find((p) => p.id === pinId);
    if (!pin) return;
    if (!pin.replies) pin.replies = [];
    pin.replies.push({ author, text });
    if (author) {
      authorName = author;
      try { localStorage.setItem(STORAGE_KEY_AUTHOR, author); } catch { /* */ }
    }
    renderPanel();
  }

  function handleImport() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const loaded = importStateFromJson(reader.result);
        if (!loaded) {
          alert('Invalid Pinment JSON file.');
          return;
        }
        if (state.pins.length > 0 && !confirm('This will replace your current annotations. Continue?')) {
          return;
        }
        // Clear existing pins
        state.pins = [];
        pinContainer.innerHTML = '';
        loadState(loaded);
        renderPanel();
      };
      reader.readAsText(file);
    });
    fileInput.click();
  }

  function handleExport() {
    const data = buildStateData();
    const json = exportStateAsJson(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinment-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleToggle() {
    state.pinsVisible = !state.pinsVisible;
    pinContainer.style.display = state.pinsVisible ? '' : 'none';
  }

  function handlePinHover(pinId) {
    const pin = state.pins.find((p) => p.id === pinId);
    if (pin) highlightPinTarget(pin);
  }

  function handlePinHoverEnd() {
    clearPinHighlight();
  }

  function handleFilterChange(newFilters) {
    state.filters = newFilters;
    renderPanel();
  }

  function handleEditModeToggle() {
    state.editMode = !state.editMode;
    const overlay = document.getElementById(OVERLAY_ID);
    if (state.editMode) {
      if (!overlay) enablePinMode();
    } else {
      if (overlay) overlay.remove();
    }
    renderPanel();
  }

  function syncPinVisibility(visibleIds) {
    if (!visibleIds) return;
    const allPinEls = pinContainer.querySelectorAll('[data-pinment-id]');
    for (const el of allPinEls) {
      const id = parseInt(el.dataset.pinmentId, 10);
      el.style.display = visibleIds.has(id) ? '' : 'none';
    }
  }

  function buildStateData() {
    return {
      v: SCHEMA_VERSION,
      url: window.location.href.split('#')[0],
      viewport: state.viewportWidth,
      env: state.env,
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

  function showEnvBanner(env) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel || !env) return;
    const banner = document.createElement('div');
    banner.className = 'pinment-env-banner';
    const parts = [];
    if (env.ua) parts.push('Browser: ' + env.ua);
    if (env.vp) parts.push('Viewport: ' + env.vp[0] + '\u00d7' + env.vp[1]);
    if (env.dt) {
      const labels = { d: 'Desktop', t: 'Tablet', m: 'Mobile' };
      parts.push(labels[env.dt] || env.dt);
    }
    banner.textContent = 'Original review: ' + parts.join(' \u2022 ');
    panel.insertBefore(banner, panel.children[1] || null);
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

  function minimizePanel() {
    panelMinimized = true;
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.style.display = 'none';
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    const btn = createMinimizedButton(restorePanel);
    btn.id = MINIMIZED_BTN_ID;
    document.body.appendChild(btn);
  }

  function restorePanel() {
    panelMinimized = false;
    const btn = document.getElementById(MINIMIZED_BTN_ID);
    if (btn) btn.remove();
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.style.display = '';
    if (state.editMode && !document.getElementById(OVERLAY_ID)) {
      enablePinMode();
    }
  }

  function handleExit() {
    if (state.pins.length === 0) {
      deactivate();
      return;
    }
    const { modal } = createExitConfirmModal({
      onCopyAndExit: () => {
        handleShare();
        deactivate();
      },
      onExitWithout: () => {
        deactivate();
      },
      onCancel: () => {
        // Do nothing, modal removes itself
      },
    });
    document.body.appendChild(modal);
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('resize', onResize);
    if (resizeRafId) cancelAnimationFrame(resizeRafId);
    clearPinHighlight();
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
    const container = document.getElementById(PIN_CONTAINER_ID);
    if (container) container.remove();
    const minBtn = document.getElementById(MINIMIZED_BTN_ID);
    if (minBtn) minBtn.remove();
  }
})();
