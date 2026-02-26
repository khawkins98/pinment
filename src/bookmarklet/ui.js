/**
 * Bookmarklet UI module
 *
 * Provides functions for creating pins, the comment panel,
 * and calculating pin positions. All CSS classes use the
 * pinment- namespace to avoid conflicts with host pages.
 */
import { generateSelector } from '../selector.js';
import { VERSION, RELEASE_DATE } from '../version.js';

const LOGO_SVG = '<svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true" style="vertical-align:-3px;margin-right:4px"><path d="M16 1C9.9 1 5 5.9 5 12c0 8.4 11 19 11 19s11-10.6 11-19C27 5.9 22.1 1 16 1z" fill="#ef4444"/><circle cx="16" cy="12" r="4.5" fill="#fff"/></svg>';

export function buildStyles() {
  return `
[class^="pinment-"] *, [class^="pinment-"] {
  font-family: system-ui, -apple-system, sans-serif;
}
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
.pinment-version {
  width: 100%;
  text-align: center;
  font-size: 11px;
  color: #a0aec0;
  margin-top: 2px;
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
.pinment-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483639;
  cursor: crosshair;
}
.pinment-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  font-size: 13px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  gap: 8px;
}
.pinment-mode-bar-label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pinment-mode-bar-edit {
  background: #fffbeb;
  color: #92400e;
  border-bottom-color: #fcd34d;
}
.pinment-mode-bar-browse {
  background: #eff6ff;
  color: #1e40af;
  border-bottom-color: #93c5fd;
}
.pinment-mode-toggle {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.pinment-mode-bar-edit .pinment-mode-toggle {
  background: #fff;
  border-color: #d97706;
  color: #92400e;
}
.pinment-mode-bar-edit .pinment-mode-toggle:hover {
  background: #fef3c7;
}
.pinment-mode-bar-browse .pinment-mode-toggle {
  background: #fff;
  border-color: #3b82f6;
  color: #1e40af;
}
.pinment-mode-bar-browse .pinment-mode-toggle:hover {
  background: #dbeafe;
}
.pinment-mode-bar-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pinment-btn-icon {
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
  color: inherit;
  opacity: 0.7;
  transition: background 0.15s, opacity 0.15s;
}
.pinment-btn-icon:hover {
  background: rgba(0,0,0,0.08);
  opacity: 1;
}
.pinment-highlight {
  outline: 2px solid #3182ce !important;
  outline-offset: 2px !important;
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
.pinment-share-url-row {
  display: flex;
  gap: 8px;
}
.pinment-share-url-input {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font: inherit;
  font-size: 12px;
  box-sizing: border-box;
  background: #f9fafb;
  color: #2d3748;
  cursor: text;
}
.pinment-share-url-input:focus {
  outline: none;
  border-color: #3182ce;
}
.pinment-share-capacity {
  font-size: 11px;
  color: #a0aec0;
  margin-top: 6px;
}
.pinment-share-capacity-bar {
  height: 4px;
  background: #edf2f7;
  border-radius: 2px;
  margin-top: 3px;
  overflow: hidden;
}
.pinment-share-capacity-fill {
  height: 100%;
  background: #38a169;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.pinment-share-capacity-fill-warn {
  background: #dd6b20;
}
.pinment-share-capacity-fill-danger {
  background: #e53e3e;
}
.pinment-share-copied {
  color: #38a169;
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}
.pinment-share-error {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}
.pinment-share-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.pinment-pin-dragging {
  cursor: grabbing !important;
  opacity: 0.7;
  transform: translate(-50%, -50%) scale(1.3);
  z-index: 2147483645;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  transition: none;
}
.pinment-replies {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid #e2e8f0;
}
.pinment-reply {
  padding: 6px 0;
  font-size: 13px;
}
.pinment-reply + .pinment-reply {
  border-top: 1px solid #f7fafc;
}
.pinment-reply-author {
  font-weight: 600;
  color: #4a5568;
  font-size: 12px;
}
.pinment-reply-text {
  color: #2d3748;
  line-height: 1.4;
  word-break: break-word;
}
.pinment-reply-form {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pinment-reply-input {
  width: 100%;
  min-height: 40px;
  padding: 6px 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  resize: vertical;
  box-sizing: border-box;
}
.pinment-reply-actions {
  display: flex;
  gap: 4px;
}
.pinment-btn-reply {
  font-size: 12px;
  padding: 3px 8px;
  color: #3182ce;
  border-color: #bee3f8;
}
.pinment-btn-add-reply {
  font-size: 12px;
  padding: 3px 8px;
  background: #3182ce;
  color: #fff;
  border-color: #3182ce;
}
.pinment-btn-add-reply:hover {
  background: #2b6cb0;
}
.pinment-btn-cancel-reply {
  font-size: 12px;
  padding: 3px 8px;
}
.pinment-filter-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-shrink: 0;
}
.pinment-filter-select {
  flex: 1;
  min-width: 0;
  padding: 4px 6px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font: inherit;
  font-size: 11px;
  background: #fff;
  color: #2d3748;
  box-sizing: border-box;
  cursor: pointer;
}
.pinment-filter-select:focus {
  outline: none;
  border-color: #3182ce;
}
.pinment-filter-count {
  padding: 6px 16px;
  font-size: 12px;
  color: #718096;
  background: #fffff0;
  border-bottom: 1px solid #fefcbf;
}
.pinment-btn-spinner {
  display:inline-block; width:12px; height:12px;
  border:2px solid #cbd5e0; border-top-color:#3182ce;
  border-radius:50%; animation:pinment-spin 0.6s linear infinite;
  vertical-align:-1px;
}
@keyframes pinment-spin { to { transform:rotate(360deg) } }
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

export function createPanel(pins, options = {}) {
  const { editable = false, editMode = true, onEditModeToggle, onShareExport, onToggle, onClose, onMinimize, onExit, onSave, onDelete, onCategoryChange, onResolveToggle, onReply, onImport, onStartNew, filters = null, onFilterChange = null, onPinHover = null, onPinHoverEnd = null } = options;

  const panel = document.createElement('div');
  panel.className = 'pinment-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'pinment-panel-header';
  header.innerHTML = `<span>${LOGO_SVG}Pinment${typeof __PINMENT_DEV__ !== 'undefined' && __PINMENT_DEV__ ? ' (Dev)' : ''}</span>`;

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

  // Mode bar (edit/browse toggle + toolbar actions)
  if (editable) {
    const modeBar = document.createElement('div');
    modeBar.className = 'pinment-mode-bar ' + (editMode ? 'pinment-mode-bar-edit' : 'pinment-mode-bar-browse');

    const label = document.createElement('span');
    label.className = 'pinment-mode-bar-label';
    label.textContent = editMode ? 'Pin mode \u2014 click page to add pins' : 'Browse mode \u2014 interact with the page';
    modeBar.appendChild(label);

    const modeBarBtns = document.createElement('div');
    modeBarBtns.className = 'pinment-mode-bar-btns';

    const visibilityBtn = document.createElement('button');
    visibilityBtn.className = 'pinment-btn pinment-btn-icon';
    visibilityBtn.title = 'Toggle pin visibility';
    visibilityBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2.5"/></svg>';
    if (onToggle) visibilityBtn.addEventListener('click', onToggle);
    modeBarBtns.appendChild(visibilityBtn);

    if (onImport) {
      const importBtn = document.createElement('button');
      importBtn.className = 'pinment-btn pinment-btn-icon';
      importBtn.title = 'Import from JSON';
      importBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M8 10V2"/><path d="M4 4l4-4 4 4"/></svg>';
      importBtn.addEventListener('click', onImport);
      modeBarBtns.appendChild(importBtn);
    }

    if (onStartNew) {
      const startNewBtn = document.createElement('button');
      startNewBtn.className = 'pinment-btn pinment-btn-icon';
      startNewBtn.title = 'Start new annotation';
      startNewBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>';
      startNewBtn.addEventListener('click', onStartNew);
      modeBarBtns.appendChild(startNewBtn);
    }

    const modeToggleBtn = document.createElement('button');
    modeToggleBtn.className = 'pinment-mode-toggle';
    modeToggleBtn.textContent = editMode ? 'Browse (Esc)' : 'Add pins (N)';
    if (onEditModeToggle) modeToggleBtn.addEventListener('click', onEditModeToggle);
    modeBarBtns.appendChild(modeToggleBtn);

    modeBar.appendChild(modeBarBtns);
    panel.appendChild(modeBar);
  }

  // Filter toolbar
  if (filters && pins.length > 0) {
    const toolbar = createFilterToolbar(pins, filters, onFilterChange);
    panel.appendChild(toolbar);
  }

  // Determine visible pins
  const visiblePins = filters ? filterAndSortPins(pins, filters) : pins;

  // Comment list
  const body = document.createElement('div');
  body.className = 'pinment-panel-body';

  if (filters && visiblePins.length !== pins.length) {
    const countEl = document.createElement('div');
    countEl.className = 'pinment-filter-count';
    countEl.textContent = `Showing ${visiblePins.length} of ${pins.length} pins`;
    body.appendChild(countEl);
  }

  for (const pin of visiblePins) {
    const comment = createCommentItem(pin, editable, { onSave, onDelete, onCategoryChange, onResolveToggle, onReply, onPinHover, onPinHoverEnd });
    body.appendChild(comment);
  }

  panel.appendChild(body);

  // Footer buttons
  const footer = document.createElement('div');
  footer.className = 'pinment-panel-footer';

  const shareExportBtn = document.createElement('button');
  shareExportBtn.className = 'pinment-btn pinment-btn-share';
  shareExportBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2v8"/><path d="M4 6l4-4 4 4"/><path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3"/></svg> Share &amp; Export';
  if (onShareExport) shareExportBtn.addEventListener('click', onShareExport);
  footer.appendChild(shareExportBtn);

  const versionEl = document.createElement('div');
  versionEl.className = 'pinment-version';
  versionEl.textContent = `v${VERSION} · ${RELEASE_DATE}`;
  footer.appendChild(versionEl);

  panel.appendChild(footer);

  panel._visiblePinIds = new Set(visiblePins.map(p => p.id));
  return panel;
}

const CATEGORY_LABELS = {
  text: 'Text issue',
  layout: 'Layout issue',
  missing: 'Missing content',
  question: 'Question',
};

/**
 * Filters and sorts pins based on the given filter criteria.
 *
 * @param {Array} pins - Full array of pin objects
 * @param {{ category: string, status: string, author: string, sort: string }} filters
 * @returns {Array} Filtered and sorted copy of pins
 */
export function filterAndSortPins(pins, filters) {
  let result = pins.filter(pin => {
    if (filters.category !== 'all') {
      if (filters.category === 'none') {
        if (pin.c) return false;
      } else if (pin.c !== filters.category) {
        return false;
      }
    }
    if (filters.status === 'open' && pin.resolved) return false;
    if (filters.status === 'resolved' && !pin.resolved) return false;
    if (filters.author !== 'all' && (pin.author || '') !== filters.author) return false;
    return true;
  });

  const CATEGORY_ORDER = { text: 0, layout: 1, missing: 2, question: 3 };
  if (filters.sort === 'category') {
    result = [...result].sort((a, b) => {
      const ca = a.c ? (CATEGORY_ORDER[a.c] ?? 99) : 99;
      const cb = b.c ? (CATEGORY_ORDER[b.c] ?? 99) : 99;
      return ca - cb || a.id - b.id;
    });
  } else if (filters.sort === 'status') {
    result = [...result].sort((a, b) => {
      const sa = a.resolved ? 1 : 0;
      const sb = b.resolved ? 1 : 0;
      return sa - sb || a.id - b.id;
    });
  }

  return result;
}

function createFilterToolbar(pins, filters, onChange) {
  const toolbar = document.createElement('div');
  toolbar.className = 'pinment-filter-toolbar';

  const catSelect = document.createElement('select');
  catSelect.className = 'pinment-filter-select';
  catSelect.title = 'Filter by category';
  for (const [value, label] of [['all', 'All categories'], ...Object.entries(CATEGORY_LABELS), ['none', 'Uncategorized']]) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (filters.category === value) opt.selected = true;
    catSelect.appendChild(opt);
  }
  catSelect.addEventListener('change', () => {
    onChange({ ...filters, category: catSelect.value });
  });
  toolbar.appendChild(catSelect);

  const statusSelect = document.createElement('select');
  statusSelect.className = 'pinment-filter-select';
  statusSelect.title = 'Filter by status';
  for (const [value, label] of [['all', 'All statuses'], ['open', 'Open'], ['resolved', 'Resolved']]) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (filters.status === value) opt.selected = true;
    statusSelect.appendChild(opt);
  }
  statusSelect.addEventListener('change', () => {
    onChange({ ...filters, status: statusSelect.value });
  });
  toolbar.appendChild(statusSelect);

  const authors = [...new Set(pins.map(p => p.author || '').filter(Boolean))].sort();
  const authorSelect = document.createElement('select');
  authorSelect.className = 'pinment-filter-select';
  authorSelect.title = 'Filter by author';
  const allAuthorsOpt = document.createElement('option');
  allAuthorsOpt.value = 'all';
  allAuthorsOpt.textContent = 'All authors';
  authorSelect.appendChild(allAuthorsOpt);
  for (const name of authors) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (filters.author === name) opt.selected = true;
    authorSelect.appendChild(opt);
  }
  authorSelect.addEventListener('change', () => {
    onChange({ ...filters, author: authorSelect.value });
  });
  toolbar.appendChild(authorSelect);

  const sortSelect = document.createElement('select');
  sortSelect.className = 'pinment-filter-select';
  sortSelect.title = 'Sort by';
  for (const [value, label] of [['id', 'Sort: Pin #'], ['category', 'Sort: Category'], ['status', 'Sort: Status']]) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (filters.sort === value) opt.selected = true;
    sortSelect.appendChild(opt);
  }
  sortSelect.addEventListener('change', () => {
    onChange({ ...filters, sort: sortSelect.value });
  });
  toolbar.appendChild(sortSelect);

  return toolbar;
}

function renderReplies(replies) {
  const container = document.createElement('div');
  container.className = 'pinment-replies';
  for (const reply of replies) {
    const replyEl = document.createElement('div');
    replyEl.className = 'pinment-reply';
    if (reply.author) {
      const authorEl = document.createElement('span');
      authorEl.className = 'pinment-reply-author';
      authorEl.textContent = reply.author;
      replyEl.appendChild(authorEl);
      replyEl.appendChild(document.createTextNode(' '));
    }
    const textEl = document.createElement('span');
    textEl.className = 'pinment-reply-text';
    textEl.textContent = reply.text;
    replyEl.appendChild(textEl);
    container.appendChild(replyEl);
  }
  return container;
}

function createCommentItem(pin, editable, { onSave, onDelete, onCategoryChange, onResolveToggle, onReply, onPinHover, onPinHoverEnd } = {}) {
  const item = document.createElement('div');
  item.className = 'pinment-comment';
  if (pin.resolved) item.classList.add('pinment-comment-resolved');
  item.dataset.pinmentId = pin.id;

  if (onPinHover) item.addEventListener('mouseenter', () => onPinHover(pin.id));
  if (onPinHoverEnd) item.addEventListener('mouseleave', () => onPinHoverEnd(pin.id));

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

    // Replies section (editable)
    if (pin.replies && pin.replies.length > 0) {
      item.appendChild(renderReplies(pin.replies));
    }

    // Reply button and form
    const replyBtn = document.createElement('button');
    replyBtn.className = 'pinment-btn pinment-btn-reply';
    replyBtn.textContent = 'Reply';
    item.appendChild(replyBtn);

    replyBtn.addEventListener('click', () => {
      // Toggle reply form
      let form = item.querySelector('.pinment-reply-form');
      if (form) {
        form.remove();
        return;
      }
      form = document.createElement('div');
      form.className = 'pinment-reply-form';

      const replyInput = document.createElement('textarea');
      replyInput.className = 'pinment-reply-input';
      replyInput.placeholder = 'Write a reply\u2026';
      form.appendChild(replyInput);

      const replyAuthorInput = document.createElement('input');
      replyAuthorInput.className = 'pinment-author-input';
      replyAuthorInput.type = 'text';
      replyAuthorInput.placeholder = 'Your name (optional)';
      replyAuthorInput.value = pin.author || '';
      form.appendChild(replyAuthorInput);

      const replyActions = document.createElement('div');
      replyActions.className = 'pinment-reply-actions';

      const addBtn = document.createElement('button');
      addBtn.className = 'pinment-btn pinment-btn-add-reply';
      addBtn.textContent = 'Add reply';
      addBtn.addEventListener('click', () => {
        const text = replyInput.value.trim();
        if (!text) return;
        if (onReply) onReply(pin.id, text, replyAuthorInput.value);
      });
      replyActions.appendChild(addBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'pinment-btn pinment-btn-cancel-reply';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => form.remove());
      replyActions.appendChild(cancelBtn);

      form.appendChild(replyActions);
      item.appendChild(form);
      replyInput.focus();
    });
  } else {
    const text = document.createElement('div');
    text.className = 'pinment-comment-text';
    text.textContent = pin.text;
    item.appendChild(text);

    // Replies section (read-only)
    if (pin.replies && pin.replies.length > 0) {
      item.appendChild(renderReplies(pin.replies));
    }
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
export function createWelcomeModal(validateUrl, validateImport) {
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
  title.innerHTML = LOGO_SVG + 'Pinment' + (typeof __PINMENT_DEV__ !== 'undefined' && __PINMENT_DEV__ ? ' (Dev)' : '');
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

  // Import from JSON divider + button
  const divider2 = document.createElement('div');
  divider2.className = 'pinment-modal-divider';
  divider2.textContent = 'or';
  body.appendChild(divider2);

  const importLabel = document.createElement('label');
  importLabel.className = 'pinment-modal-label';
  importLabel.textContent = 'Import from a JSON file';
  body.appendChild(importLabel);

  const importBtn = document.createElement('button');
  importBtn.className = 'pinment-modal-btn pinment-modal-btn-secondary';
  importBtn.textContent = 'Choose JSON file\u2026';
  body.appendChild(importBtn);

  const importError = document.createElement('div');
  importError.className = 'pinment-modal-error';
  body.appendChild(importError);

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

    importBtn.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json,application/json';
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const state = JSON.parse(reader.result);
            if (validateImport && !validateImport(state)) {
              importError.textContent = 'Invalid Pinment JSON file. Check the file and try again.';
              return;
            }
            backdrop.remove();
            resolve(state);
          } catch {
            importError.textContent = 'Could not parse JSON file. Check the file and try again.';
          }
        };
        reader.readAsText(file);
      });
      fileInput.click();
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

    // Focus the start button by default
    setTimeout(() => freshBtn.focus(), 0);

    // Pre-fill from clipboard when the URL input is focused (deferred to
    // avoid a browser clipboard-permission prompt that can steal the first
    // click away from the "Start annotating" button).
    let clipboardChecked = false;
    input.addEventListener('focus', () => {
      if (clipboardChecked) return;
      clipboardChecked = true;
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
          }
        }).catch(() => {
          // Clipboard access denied — no problem, user can paste manually
        });
      }
    });
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
  title.innerHTML = LOGO_SVG + 'Pinment' + (typeof __PINMENT_DEV__ !== 'undefined' && __PINMENT_DEV__ ? ' (Dev)' : '');
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
 * Creates a modal warning that Pinment is designed for desktop browsers.
 * Shown when the bookmarklet is activated on a mobile device.
 *
 * @returns {{ modal: HTMLElement, promise: Promise<boolean> }}
 *   promise resolves to true (proceed) or false (cancel)
 */
export function createMobileWarningModal() {
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
  title.innerHTML = LOGO_SVG + 'Pinment' + (typeof __PINMENT_DEV__ !== 'undefined' && __PINMENT_DEV__ ? ' (Dev)' : '');
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
  notice.textContent = 'It looks like you\u2019re on a mobile device. Pinment is designed for desktop browsers and may not work well on smaller screens.';
  body.appendChild(notice);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;margin-top:16px;';

  const desktopBtn = document.createElement('button');
  desktopBtn.className = 'pinment-modal-btn pinment-modal-btn-primary';
  desktopBtn.textContent = 'I\u2019m on desktop';
  btnRow.appendChild(desktopBtn);

  const proceedBtn = document.createElement('button');
  proceedBtn.className = 'pinment-modal-btn pinment-modal-btn-secondary';
  proceedBtn.textContent = 'Continue anyway';
  btnRow.appendChild(proceedBtn);

  body.appendChild(btnRow);

  modal.appendChild(body);
  backdrop.appendChild(modal);

  const promise = new Promise((resolve) => {
    closeBtn.addEventListener('click', () => {
      backdrop.remove();
      resolve(false);
    });

    desktopBtn.addEventListener('click', () => {
      backdrop.remove();
      resolve(true);
    });

    proceedBtn.addEventListener('click', () => {
      backdrop.remove();
      resolve(true);
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
 * Creates a share & export modal with three options:
 * copy share URL, download JSON, download PDF.
 *
 * @param {object} options
 * @param {string} options.shareUrl - the full share URL
 * @param {number} options.urlSize - estimated URL size in bytes
 * @param {number} options.maxUrlBytes - max URL size limit
 * @param {() => void} options.onExportJson - callback for JSON export
 * @param {() => Promise<void>} options.onExportPdf - callback for PDF export
 * @returns {{ modal: HTMLElement }}
 */
export function createShareModal({ shareUrl, urlSize, maxUrlBytes, onExportJson, onExportPdf }) {
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
  title.innerHTML = LOGO_SVG + 'Share & Export';
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

  // --- Section 1: Copy share URL ---
  const urlLabel = document.createElement('label');
  urlLabel.className = 'pinment-modal-label';
  urlLabel.textContent = 'Copy share URL';
  body.appendChild(urlLabel);

  const pct = Math.min(100, Math.round((urlSize / maxUrlBytes) * 100));
  const overLimit = urlSize > maxUrlBytes;

  const urlRow = document.createElement('div');
  urlRow.className = 'pinment-share-url-row';

  const urlInput = document.createElement('input');
  urlInput.className = 'pinment-share-url-input';
  urlInput.type = 'text';
  urlInput.readOnly = true;
  urlInput.value = overLimit ? '' : shareUrl;
  urlRow.appendChild(urlInput);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'pinment-modal-btn pinment-modal-btn-primary';
  copyBtn.textContent = 'Copy';
  if (overLimit) copyBtn.disabled = true;
  urlRow.appendChild(copyBtn);

  body.appendChild(urlRow);

  // Capacity indicator
  const capacityEl = document.createElement('div');
  capacityEl.className = 'pinment-share-capacity';
  let fillClass = 'pinment-share-capacity-fill';
  if (pct >= 80 || overLimit) fillClass += ' pinment-share-capacity-fill-danger';
  else if (pct >= 60) fillClass += ' pinment-share-capacity-fill-warn';
  capacityEl.innerHTML = overLimit
    ? `<strong style="color:#e53e3e">URL is ${Math.round(urlSize / 1024)}KB \u2014 exceeds the ~${Math.round(maxUrlBytes / 1024)}KB limit.</strong> Remove some annotations or shorten comments, or use JSON export below.`
    : `${Math.round(urlSize / 1024 * 10) / 10}KB of ~${Math.round(maxUrlBytes / 1024)}KB URL limit (${pct}%)`;
  const capacityBar = document.createElement('div');
  capacityBar.className = 'pinment-share-capacity-bar';
  capacityBar.innerHTML = `<div class="${fillClass}" style="width:${pct}%"></div>`;
  if (!overLimit) capacityEl.appendChild(capacityBar);
  body.appendChild(capacityEl);

  // Feedback area for copy
  const feedbackEl = document.createElement('div');
  feedbackEl.className = 'pinment-share-copied';
  feedbackEl.style.display = 'none';
  body.appendChild(feedbackEl);

  // --- Divider ---
  const divider1 = document.createElement('div');
  divider1.className = 'pinment-modal-divider';
  divider1.textContent = 'or';
  body.appendChild(divider1);

  // --- Section 2: Export as JSON ---
  const jsonLabel = document.createElement('label');
  jsonLabel.className = 'pinment-modal-label';
  jsonLabel.textContent = 'Export as JSON file';
  body.appendChild(jsonLabel);

  const jsonBtn = document.createElement('button');
  jsonBtn.className = 'pinment-modal-btn pinment-modal-btn-secondary';
  jsonBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:-2px;margin-right:4px"><path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M8 2v8"/><path d="M4 8l4 4 4-4"/></svg> Download JSON';
  body.appendChild(jsonBtn);

  // --- Divider ---
  const divider2 = document.createElement('div');
  divider2.className = 'pinment-modal-divider';
  divider2.textContent = 'or';
  body.appendChild(divider2);

  // --- Section 3: Export as PDF ---
  const pdfLabel = document.createElement('label');
  pdfLabel.className = 'pinment-modal-label';
  pdfLabel.textContent = 'Export as PDF with screenshot';
  body.appendChild(pdfLabel);

  const pdfBtn = document.createElement('button');
  pdfBtn.className = 'pinment-modal-btn pinment-modal-btn-secondary';
  pdfBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:-2px;margin-right:4px"><rect x="2" y="1" width="12" height="14" rx="1"/><path d="M5 5h6"/><path d="M5 8h6"/><path d="M5 11h3"/></svg> Download PDF';
  body.appendChild(pdfBtn);

  modal.appendChild(body);
  backdrop.appendChild(modal);

  // --- Event handlers ---
  closeBtn.addEventListener('click', () => backdrop.remove());

  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        feedbackEl.textContent = 'Copied to clipboard!';
        feedbackEl.style.display = '';
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          feedbackEl.style.display = 'none';
        }, 2500);
      }).catch(() => {
        urlInput.select();
        feedbackEl.className = 'pinment-share-error';
        feedbackEl.textContent = 'Could not copy automatically. Select the URL above and copy manually.';
        feedbackEl.style.display = '';
      });
    } else {
      urlInput.select();
      feedbackEl.className = 'pinment-share-error';
      feedbackEl.textContent = 'Clipboard not available. Select the URL above and copy manually.';
      feedbackEl.style.display = '';
    }
  });

  // Select all text on click for easy manual copy
  urlInput.addEventListener('click', () => urlInput.select());

  jsonBtn.addEventListener('click', () => {
    if (onExportJson) onExportJson();
    feedbackEl.className = 'pinment-share-copied';
    feedbackEl.textContent = 'JSON file downloaded!';
    feedbackEl.style.display = '';
    setTimeout(() => { feedbackEl.style.display = 'none'; }, 2500);
  });

  pdfBtn.addEventListener('click', async () => {
    const originalContent = pdfBtn.innerHTML;
    pdfBtn.innerHTML = '<span class="pinment-btn-spinner"></span> Generating PDF\u2026';
    pdfBtn.disabled = true;
    // Close the modal before PDF capture so it doesn't appear in screenshot
    backdrop.style.display = 'none';
    try {
      if (onExportPdf) await onExportPdf();
    } catch (err) {
      alert(err.message || 'PDF export failed.');
    } finally {
      backdrop.style.display = '';
      pdfBtn.innerHTML = originalContent;
      pdfBtn.disabled = false;
    }
  });

  // Escape to close
  backdrop.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeBtn.click();
    }
  });

  // Focus the copy button by default
  setTimeout(() => overLimit ? jsonBtn.focus() : copyBtn.focus(), 0);

  return { modal: backdrop };
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
  title.innerHTML = LOGO_SVG + 'Exit Pinment?';
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
