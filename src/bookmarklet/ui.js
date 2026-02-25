/**
 * Bookmarklet UI module
 *
 * Provides functions for creating pins, the comment panel,
 * and calculating pin positions. All CSS classes use the
 * pinment- namespace to avoid conflicts with host pages.
 */
import { generateSelector } from '../selector.js';

export function buildStyles() {
  return `
.pinment-pin {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e53e3e;
  color: #fff;
  font: bold 13px/28px system-ui, sans-serif;
  text-align: center;
  cursor: pointer;
  z-index: 2147483640;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  border: 2px solid #fff;
  transform: translate(-50%, -50%);
  user-select: none;
  transition: transform 0.15s ease;
}
.pinment-pin:hover {
  transform: translate(-50%, -50%) scale(1.2);
}
.pinment-pin-active {
  background: #dd6b20;
  transform: translate(-50%, -50%) scale(1.25);
}
.pinment-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #fff;
  border-left: 2px solid #e2e8f0;
  box-shadow: -4px 0 16px rgba(0,0,0,0.1);
  z-index: 2147483641;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: #1a202c;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.pinment-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.pinment-panel-hint {
  padding: 10px 16px;
  font-size: 13px;
  color: #718096;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.pinment-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
.pinment-comment {
  padding: 12px 16px;
  border-bottom: 1px solid #edf2f7;
}
.pinment-comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.pinment-comment-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e53e3e;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.pinment-comment-author {
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
}
.pinment-comment-text {
  color: #2d3748;
  line-height: 1.4;
  word-break: break-word;
}
.pinment-comment-input {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  resize: vertical;
  box-sizing: border-box;
}
.pinment-author-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  margin-top: 4px;
  box-sizing: border-box;
}
.pinment-comment-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}
.pinment-panel-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.pinment-btn {
  padding: 6px 14px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  color: #2d3748;
  transition: background 0.15s;
}
.pinment-btn:hover {
  background: #edf2f7;
}
.pinment-btn-share {
  background: #3182ce;
  color: #fff;
  border-color: #3182ce;
}
.pinment-btn-share:hover {
  background: #2b6cb0;
}
.pinment-btn-delete {
  color: #e53e3e;
  border-color: #fed7d7;
  font-size: 12px;
  padding: 3px 8px;
}
.pinment-btn-save {
  font-size: 12px;
  padding: 3px 8px;
  background: #38a169;
  color: #fff;
  border-color: #38a169;
}
.pinment-btn-save:hover {
  background: #2f855a;
}
.pinment-capacity {
  width: 100%;
  padding: 6px 0 0;
  font-size: 11px;
  color: #a0aec0;
}
.pinment-capacity-bar {
  height: 4px;
  background: #edf2f7;
  border-radius: 2px;
  margin-top: 3px;
  overflow: hidden;
}
.pinment-capacity-fill {
  height: 100%;
  background: #38a169;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.pinment-capacity-fill-warn {
  background: #dd6b20;
}
.pinment-capacity-fill-danger {
  background: #e53e3e;
}
.pinment-btn-share:disabled {
  background: #a0aec0;
  border-color: #a0aec0;
  cursor: not-allowed;
}
.pinment-toast {
  position: fixed;
  bottom: 24px;
  right: 340px;
  background: #1a202c;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  z-index: 2147483643;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: pinment-toast-in 0.2s ease;
}
@keyframes pinment-toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.pinment-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483639;
  cursor: crosshair;
}
.pinment-viewport-warning {
  padding: 8px 16px;
  background: #fffbeb;
  color: #92400e;
  font-size: 12px;
  border-bottom: 1px solid #fcd34d;
  flex-shrink: 0;
}
.pinment-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2147483642;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
}
.pinment-modal {
  position: relative;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 400px;
  max-width: calc(100vw - 32px);
  padding: 0;
  color: #1a202c;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
}
.pinment-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}
.pinment-modal-header-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.pinment-modal-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}
.pinment-modal-link {
  color: #718096;
  font-size: 12px;
  text-decoration: none;
}
.pinment-modal-link:hover {
  color: #3182ce;
  text-decoration: underline;
}
.pinment-modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #a0aec0;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  font-family: system-ui, sans-serif;
  margin: -4px -4px 0 0;
}
.pinment-modal-close:hover {
  color: #4a5568;
}
.pinment-modal-body {
  padding: 20px 24px 24px;
}
.pinment-modal-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 6px;
}
.pinment-modal-input-row {
  display: flex;
  gap: 8px;
}
.pinment-modal-input {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.pinment-modal-input:focus {
  outline: none;
  border-color: #3182ce;
}
.pinment-modal-input-error {
  border-color: #e53e3e;
}
.pinment-modal-error {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
  min-height: 16px;
}
.pinment-modal-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  color: #a0aec0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.pinment-modal-divider::before,
.pinment-modal-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}
.pinment-modal-btn {
  padding: 8px 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.pinment-modal-btn-primary {
  background: #3182ce;
  color: #fff;
  border-color: #3182ce;
  flex-shrink: 0;
}
.pinment-modal-btn-primary:hover {
  background: #2b6cb0;
  border-color: #2b6cb0;
}
.pinment-modal-btn-secondary {
  background: #fff;
  color: #2d3748;
  width: 100%;
}
.pinment-modal-btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
.pinment-modal-notice {
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}
.pinment-modal-steps {
  margin: 12px 0 0;
  padding: 0 0 0 20px;
  color: #4a5568;
  font-size: 13px;
  line-height: 1.7;
}
.pinment-modal-steps li {
  margin-bottom: 2px;
}
.pinment-modal-clipboard-hint {
  color: #38a169;
  font-size: 12px;
  margin-top: 4px;
}
.pinment-modal-input-prefilled {
  border-color: #38a169;
}
.pinment-modal-dismiss {
  margin-top: 20px;
  width: 100%;
}
.pinment-modal-btn-start {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  background: #3182ce;
  color: #fff;
  border-color: #3182ce;
  width: 100%;
  padding: 10px 16px;
}
.pinment-modal-btn-start:hover {
  background: #2b6cb0;
  border-color: #2b6cb0;
}
.pinment-panel-header-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pinment-btn-minimize {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #718096;
  transition: background 0.15s, color 0.15s;
}
.pinment-btn-minimize:hover {
  background: #edf2f7;
  color: #4a5568;
}
.pinment-btn-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #718096;
  transition: background 0.15s, color 0.15s;
}
.pinment-btn-close:hover {
  background: #fee2e2;
  color: #dc2626;
}
.pinment-minimized-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  font: 600 13px/1 system-ui, -apple-system, sans-serif;
  color: #2d3748;
  z-index: 2147483641;
  transition: box-shadow 0.15s, transform 0.15s;
}
.pinment-minimized-btn:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  transform: translateY(-1px);
}
.pinment-modal-btn-danger {
  background: #fff;
  color: #dc2626;
  border: 1.5px solid #dc2626;
  width: 100%;
}
.pinment-modal-btn-danger:hover {
  background: #fef2f2;
}
.pinment-exit-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.pinment-pin-fallback {
  opacity: 0.75;
  border-color: #fbbf24;
}
.pinment-pin-fallback::after {
  content: '!';
  position: absolute;
  top: -6px;
  right: -6px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f59e0b;
  color: #fff;
  font-size: 9px;
  line-height: 14px;
  text-align: center;
  font-weight: bold;
}
.pinment-env-banner {
  padding: 8px 16px;
  background: #eff6ff;
  color: #1e40af;
  font-size: 12px;
  border-bottom: 1px solid #bfdbfe;
  flex-shrink: 0;
}
.pinment-category-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  margin-top: 4px;
  box-sizing: border-box;
  background: #fff;
  color: #2d3748;
}
.pinment-category-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  flex-shrink: 0;
}
.pinment-category-text { background: #dbeafe; color: #1e40af; }
.pinment-category-layout { background: #ede9fe; color: #5b21b6; }
.pinment-category-missing { background: #ffedd5; color: #9a3412; }
.pinment-category-question { background: #d1fae5; color: #065f46; }
.pinment-btn-resolve {
  font-size: 12px;
  padding: 3px 8px;
}
.pinment-btn-resolve-open {
  color: #38a169;
  border-color: #c6f6d5;
}
.pinment-btn-resolve-resolved {
  background: #f0fff4;
  color: #276749;
  border-color: #9ae6b4;
}
.pinment-comment-resolved {
  opacity: 0.6;
}
.pinment-comment-resolved .pinment-comment-text {
  text-decoration: line-through;
}
.pinment-pin-resolved {
  opacity: 0.5;
  background: #a0aec0;
}
.pinment-btn-export {
  font-size: 12px;
  padding: 6px 10px;
}
.pinment-btn-share {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  flex: 1;
}
.pinment-btn-toggle {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #718096;
  flex-shrink: 0;
}
.pinment-btn-toggle:hover {
  color: #4a5568;
}
`;
}

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
export function createPinElement(pin) {
  const el = document.createElement('div');
  el.className = 'pinment-pin';
  el.dataset.pinmentId = pin.id;
  el.textContent = String(pin.id);
  el.style.position = 'absolute';

  let positioned = false;

  if (pin.s) {
    try {
      const target = document.querySelector(pin.s);
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        el.style.left = `${rect.left + scrollX + (pin.ox != null ? pin.ox : 0.5) * rect.width}px`;
        el.style.top = `${rect.top + scrollY + (pin.oy != null ? pin.oy : 0.5) * rect.height}px`;
        positioned = true;
      }
    } catch {
      // Invalid selector, fall through to fallback
    }
  }

  if (!positioned) {
    el.style.left = `${pin.fx}px`;
    el.style.top = `${pin.fy}px`;
    if (pin.s) {
      // Had a selector but couldn't resolve it — mark as fallback
      el.classList.add('pinment-pin-fallback');
    }
  }

  if (pin.resolved) {
    el.classList.add('pinment-pin-resolved');
  }

  return el;
}

export function createPanel(pins, options = {}) {
  const { editable = false, onShare, onToggle, onClose, onMinimize, onExit, onSave, onDelete, onCategoryChange, onResolveToggle, onExport } = options;

  const panel = document.createElement('div');
  panel.className = 'pinment-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'pinment-panel-header';
  header.innerHTML = `<span>Pinment</span>`;

  const headerBtns = document.createElement('div');
  headerBtns.className = 'pinment-panel-header-btns';

  const minimizeBtn = document.createElement('button');
  minimizeBtn.className = 'pinment-btn-minimize';
  minimizeBtn.title = 'Minimize panel';
  minimizeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="13" y2="12"/></svg>';
  if (onMinimize) minimizeBtn.addEventListener('click', onMinimize);
  headerBtns.appendChild(minimizeBtn);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pinment-btn pinment-btn-close';
  closeBtn.title = 'Exit Pinment';
  closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>';
  const exitHandler = onExit || onClose;
  if (exitHandler) closeBtn.addEventListener('click', exitHandler);
  headerBtns.appendChild(closeBtn);

  header.appendChild(headerBtns);
  panel.appendChild(header);

  // Hint
  if (editable) {
    const hint = document.createElement('div');
    hint.className = 'pinment-panel-hint';
    hint.textContent = 'Click anywhere on the page to add a pin.';
    panel.appendChild(hint);
  }

  // Comment list
  const body = document.createElement('div');
  body.className = 'pinment-panel-body';

  for (const pin of pins) {
    const comment = createCommentItem(pin, editable, { onSave, onDelete, onCategoryChange, onResolveToggle });
    body.appendChild(comment);
  }

  panel.appendChild(body);

  // Footer buttons
  const footer = document.createElement('div');
  footer.className = 'pinment-panel-footer';

  const shareBtn = document.createElement('button');
  shareBtn.className = 'pinment-btn pinment-btn-share';
  shareBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2v8"/><path d="M4 6l4-4 4 4"/><path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3"/></svg> Save &amp; Share';
  if (onShare) shareBtn.addEventListener('click', onShare);
  footer.appendChild(shareBtn);

  const exportBtn = document.createElement('button');
  exportBtn.className = 'pinment-btn pinment-btn-export';
  exportBtn.title = 'Export as JSON';
  exportBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M8 2v8"/><path d="M4 8l4 4 4-4"/></svg>';
  if (onExport) exportBtn.addEventListener('click', onExport);
  footer.appendChild(exportBtn);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'pinment-btn pinment-btn-toggle';
  toggleBtn.title = 'Toggle pin visibility';
  toggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2.5"/></svg>';
  if (onToggle) toggleBtn.addEventListener('click', onToggle);
  footer.appendChild(toggleBtn);

  panel.appendChild(footer);

  return panel;
}

const CATEGORY_LABELS = {
  text: 'Text issue',
  layout: 'Layout issue',
  missing: 'Missing content',
  question: 'Question',
};

function createCommentItem(pin, editable, { onSave, onDelete, onCategoryChange, onResolveToggle } = {}) {
  const item = document.createElement('div');
  item.className = 'pinment-comment';
  if (pin.resolved) item.classList.add('pinment-comment-resolved');
  item.dataset.pinmentId = pin.id;

  const header = document.createElement('div');
  header.className = 'pinment-comment-header';

  const badge = document.createElement('span');
  badge.className = 'pinment-comment-number';
  badge.textContent = String(pin.id);

  const author = document.createElement('span');
  author.className = 'pinment-comment-author';
  author.textContent = pin.author || '';

  header.appendChild(badge);

  if (pin.c && CATEGORY_LABELS[pin.c]) {
    const catBadge = document.createElement('span');
    catBadge.className = `pinment-category-badge pinment-category-${pin.c}`;
    catBadge.textContent = CATEGORY_LABELS[pin.c];
    header.appendChild(catBadge);
  }

  header.appendChild(author);
  item.appendChild(header);

  if (editable) {
    const textarea = document.createElement('textarea');
    textarea.className = 'pinment-comment-input';
    textarea.value = pin.text;
    textarea.placeholder = 'Add a comment\u2026';
    item.appendChild(textarea);

    const authorInput = document.createElement('input');
    authorInput.className = 'pinment-author-input';
    authorInput.type = 'text';
    authorInput.value = pin.author || '';
    authorInput.placeholder = 'Your name (optional)';
    item.appendChild(authorInput);

    const categorySelect = document.createElement('select');
    categorySelect.className = 'pinment-category-select';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Category (optional)';
    categorySelect.appendChild(defaultOpt);
    for (const [value, label] of Object.entries(CATEGORY_LABELS)) {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      if (pin.c === value) opt.selected = true;
      categorySelect.appendChild(opt);
    }
    if (onCategoryChange) {
      categorySelect.addEventListener('change', () => {
        onCategoryChange(pin.id, categorySelect.value || undefined);
      });
    }
    item.appendChild(categorySelect);

    const actions = document.createElement('div');
    actions.className = 'pinment-comment-actions';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'pinment-btn pinment-btn-save';
    saveBtn.textContent = 'Save';
    if (onSave) {
      saveBtn.addEventListener('click', () => {
        onSave(pin.id, textarea.value, authorInput.value);
      });
    }
    actions.appendChild(saveBtn);

    const resolveBtn = document.createElement('button');
    resolveBtn.className = `pinment-btn pinment-btn-resolve ${pin.resolved ? 'pinment-btn-resolve-resolved' : 'pinment-btn-resolve-open'}`;
    resolveBtn.textContent = pin.resolved ? 'Resolved' : 'Resolve';
    if (onResolveToggle) {
      resolveBtn.addEventListener('click', () => onResolveToggle(pin.id));
    }
    actions.appendChild(resolveBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'pinment-btn pinment-btn-delete';
    deleteBtn.textContent = 'Delete';
    if (onDelete) {
      deleteBtn.addEventListener('click', () => onDelete(pin.id));
    }
    actions.appendChild(deleteBtn);

    item.appendChild(actions);
  } else {
    const text = document.createElement('div');
    text.className = 'pinment-comment-text';
    text.textContent = pin.text;
    item.appendChild(text);
  }

  return item;
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

/**
 * Creates a welcome modal that replaces the native prompt().
 * Returns a Promise that resolves with the pasted URL string,
 * null if the user chooses to start annotating, or false if cancelled.
 *
 * @param {(url: string) => object|null} validateUrl - validator that returns
 *   parsed state if the URL is valid, or null if not.
 * @returns {{ modal: HTMLElement, promise: Promise<string|null|false> }}
 */
export function createWelcomeModal(validateUrl) {
  const backdrop = document.createElement('div');
  backdrop.className = 'pinment-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'pinment-modal';

  // Header row: title + link on left, close on right
  const header = document.createElement('div');
  header.className = 'pinment-modal-header';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'pinment-modal-header-left';

  const title = document.createElement('h2');
  title.className = 'pinment-modal-title';
  title.textContent = 'Pinment';
  headerLeft.appendChild(title);

  const link = document.createElement('a');
  link.className = 'pinment-modal-link';
  link.href = 'https://khawkins98.github.io/pinment/';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'What is Pinment?';
  headerLeft.appendChild(link);

  header.appendChild(headerLeft);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pinment-modal-close';
  closeBtn.textContent = '\u00d7';
  closeBtn.title = 'Cancel';
  header.appendChild(closeBtn);

  modal.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'pinment-modal-body';

  // Start annotating: primary action on top
  const startLabel = document.createElement('label');
  startLabel.className = 'pinment-modal-label';
  startLabel.textContent = 'Start a new annotation session';
  body.appendChild(startLabel);

  const freshBtn = document.createElement('button');
  freshBtn.className = 'pinment-modal-btn pinment-modal-btn-start';
  freshBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 1.5a1.914 1.914 0 0 1 2.707 2.707L5.707 12.707 1.5 14.5l1.793-4.207z"/></svg> Start annotating on this page';
  body.appendChild(freshBtn);

  // Divider
  const divider = document.createElement('div');
  divider.className = 'pinment-modal-divider';
  divider.textContent = 'or';
  body.appendChild(divider);

  // Share URL: label + input row with inline load button
  const label = document.createElement('label');
  label.className = 'pinment-modal-label';
  label.textContent = 'Paste a share URL to load annotations';
  body.appendChild(label);

  const inputRow = document.createElement('div');
  inputRow.className = 'pinment-modal-input-row';

  const input = document.createElement('input');
  input.className = 'pinment-modal-input';
  input.type = 'text';
  input.placeholder = 'https://khawkins98.github.io/pinment/#data=...';
  input.setAttribute('autocomplete', 'off');
  inputRow.appendChild(input);

  const loadBtn = document.createElement('button');
  loadBtn.className = 'pinment-modal-btn pinment-modal-btn-primary';
  loadBtn.textContent = 'Load';
  inputRow.appendChild(loadBtn);

  body.appendChild(inputRow);

  const errorEl = document.createElement('div');
  errorEl.className = 'pinment-modal-error';
  body.appendChild(errorEl);

  modal.appendChild(body);
  backdrop.appendChild(modal);

  const promise = new Promise((resolve) => {
    closeBtn.addEventListener('click', () => {
      backdrop.remove();
      resolve(false);
    });

    freshBtn.addEventListener('click', () => {
      backdrop.remove();
      resolve(null);
    });

    loadBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (!value) {
        input.classList.add('pinment-modal-input-error');
        errorEl.textContent = 'Please paste a Pinment share URL first.';
        return;
      }
      if (validateUrl && !validateUrl(value)) {
        input.classList.add('pinment-modal-input-error');
        errorEl.textContent = 'Not a valid Pinment share URL. Check the link and try again.';
        return;
      }
      backdrop.remove();
      resolve(value);
    });

    // Clear error on input
    input.addEventListener('input', () => {
      input.classList.remove('pinment-modal-input-error');
      errorEl.textContent = '';
    });

    // Allow Enter key to submit
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        loadBtn.click();
      }
    });

    // Allow Escape key to cancel
    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeBtn.click();
      }
    });

    // Focus the start button by default; switch to input if clipboard has a share URL
    setTimeout(() => {
      freshBtn.focus();
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((clipText) => {
          const trimmed = (clipText || '').trim();
          if (trimmed && trimmed.includes('#data=') && !input.value) {
            input.value = trimmed;
            input.classList.add('pinment-modal-input-prefilled');
            errorEl.textContent = '';
            const hint = document.createElement('div');
            hint.className = 'pinment-modal-clipboard-hint';
            hint.textContent = 'Pre-filled from clipboard';
            inputRow.parentNode.insertBefore(hint, errorEl);
            input.focus();
          }
        }).catch(() => {
          // Clipboard access denied — no problem, user can paste manually
        });
      }
    }, 0);
  });

  return { modal: backdrop, promise };
}

/**
 * Creates a modal shown when the bookmarklet is run on the Pinment
 * documentation site itself. Explains how to use it on another page.
 * The returned promise always resolves with false (cancel).
 *
 * @returns {{ modal: HTMLElement, promise: Promise<false> }}
 */
export function createDocsSiteModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'pinment-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'pinment-modal';

  // Header
  const header = document.createElement('div');
  header.className = 'pinment-modal-header';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'pinment-modal-header-left';

  const title = document.createElement('h2');
  title.className = 'pinment-modal-title';
  title.textContent = 'Pinment';
  headerLeft.appendChild(title);
  header.appendChild(headerLeft);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pinment-modal-close';
  closeBtn.textContent = '\u00d7';
  closeBtn.title = 'Close';
  header.appendChild(closeBtn);

  modal.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'pinment-modal-body';

  const notice = document.createElement('p');
  notice.className = 'pinment-modal-notice';
  notice.textContent = 'You\u2019re on the Pinment documentation page. To annotate a website, add the bookmarklet to your browser first:';
  body.appendChild(notice);

  const steps = document.createElement('ol');
  steps.className = 'pinment-modal-steps';
  const step1 = document.createElement('li');
  step1.textContent = 'Drag the Pinment button above to your bookmarks bar';
  const step2 = document.createElement('li');
  step2.textContent = 'Navigate to the page you want to review';
  const step3 = document.createElement('li');
  step3.textContent = 'Click the bookmarklet from your bookmarks bar';
  steps.appendChild(step1);
  steps.appendChild(step2);
  steps.appendChild(step3);
  body.appendChild(steps);

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'pinment-modal-btn pinment-modal-btn-secondary pinment-modal-dismiss';
  dismissBtn.textContent = 'Got it';
  body.appendChild(dismissBtn);

  modal.appendChild(body);
  backdrop.appendChild(modal);

  const promise = new Promise((resolve) => {
    closeBtn.addEventListener('click', () => {
      backdrop.remove();
      resolve(false);
    });

    dismissBtn.addEventListener('click', () => {
      backdrop.remove();
      resolve(false);
    });

    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeBtn.click();
      }
    });
  });

  return { modal: backdrop, promise };
}

/**
 * Creates a small floating pill button shown when the panel is minimized.
 *
 * @param {() => void} onRestore - callback to restore the panel
 * @returns {HTMLElement}
 */
export function createMinimizedButton(onRestore) {
  const btn = document.createElement('button');
  btn.className = 'pinment-minimized-btn';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 1.5a1.914 1.914 0 0 1 2.707 2.707L5.707 12.707 1.5 14.5l1.793-4.207z"/></svg> Pinment';
  if (onRestore) btn.addEventListener('click', onRestore);
  return btn;
}

/**
 * Creates an exit confirmation modal warning about unsaved annotations.
 *
 * @param {{ onCopyAndExit: () => void, onExitWithout: () => void, onCancel: () => void }} callbacks
 * @returns {{ modal: HTMLElement }}
 */
export function createExitConfirmModal({ onCopyAndExit, onExitWithout, onCancel }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'pinment-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'pinment-modal';

  // Header
  const header = document.createElement('div');
  header.className = 'pinment-modal-header';
  const title = document.createElement('h2');
  title.className = 'pinment-modal-title';
  title.textContent = 'Exit Pinment?';
  header.appendChild(title);
  modal.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'pinment-modal-body';

  const warning = document.createElement('p');
  warning.className = 'pinment-modal-notice';
  warning.textContent = 'Your annotations are not saved anywhere. If you exit now, all pins and comments will be lost.';
  body.appendChild(warning);

  const actions = document.createElement('div');
  actions.className = 'pinment-exit-actions';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'pinment-modal-btn pinment-modal-btn-primary';
  copyBtn.textContent = 'Copy Share URL & Exit';
  copyBtn.style.width = '100%';
  copyBtn.addEventListener('click', () => {
    backdrop.remove();
    if (onCopyAndExit) onCopyAndExit();
  });
  actions.appendChild(copyBtn);

  const exitBtn = document.createElement('button');
  exitBtn.className = 'pinment-modal-btn pinment-modal-btn-danger';
  exitBtn.textContent = 'Exit Without Saving';
  exitBtn.addEventListener('click', () => {
    backdrop.remove();
    if (onExitWithout) onExitWithout();
  });
  actions.appendChild(exitBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'pinment-modal-btn pinment-modal-btn-secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    backdrop.remove();
    if (onCancel) onCancel();
  });
  actions.appendChild(cancelBtn);

  body.appendChild(actions);
  modal.appendChild(body);
  backdrop.appendChild(modal);

  // Escape = cancel
  backdrop.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelBtn.click();
    }
  });

  // Focus cancel button by default
  setTimeout(() => cancelBtn.focus(), 0);

  return { modal: backdrop };
}
