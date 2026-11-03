export const LOGO_SVG = '<svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true" style="vertical-align:-3px;margin-right:4px"><path d="M16 1C9.9 1 5 5.9 5 12c0 8.4 11 19 11 19s11-10.6 11-19C27 5.9 22.1 1 16 1z" fill="#ef4444"/><circle cx="16" cy="12" r="4.5" fill="#fff"/></svg>';

export function buildStyles() {
  return `
[class^="pinment-"] *, [class^="pinment-"] {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.pinment-panel, .pinment-modal, .pinment-minimized-btn, .pinment-env-banner, .pinment-mode-bar {
  all: initial;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.4;
}
.pinment-panel *, .pinment-modal *, .pinment-minimized-btn *, .pinment-env-banner *, .pinment-mode-bar * {
  box-sizing: border-box;
  font-family: inherit;
}
[class^="pinment-"] svg {
  display: inline-block;
  vertical-align: middle;
}
.pinment-modal-btn-draft {
  background: #3182ce;
  color: #fff;
  border: 1px solid #3182ce;
  margin-bottom: 8px;
}
.pinment-modal-btn-draft:hover {
  background: #2b6cb0;
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
  flex-wrap: wrap;
  align-items: center;
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
.pinment-version a {
  color: inherit;
  text-decoration: none;
}
.pinment-version a:hover {
  color: #718096;
  text-decoration: underline;
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
  flex-wrap: wrap;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  gap: 4px;
}
.pinment-mode-bar-label {
  width: 100%;
  font-size: 12px;
  line-height: 1.3;
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
  margin-left: auto;
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
  gap: 2px;
  width: 100%;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
  color: #718096;
  margin-top: 6px;
}
.pinment-share-capacity-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #a0aec0;
  color: #718096;
  font-size: 9px;
  font-weight: 700;
  cursor: help;
  position: relative;
  vertical-align: middle;
  margin-left: 4px;
  line-height: 1;
}
.pinment-share-capacity-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #2d3748;
  color: #fff;
  font-size: 11px;
  font-weight: 400;
  padding: 6px 10px;
  border-radius: 4px;
  white-space: normal;
  width: 220px;
  line-height: 1.4;
  z-index: 10;
  pointer-events: none;
  text-align: left;
}
.pinment-share-capacity-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #2d3748;
}
.pinment-share-capacity-help:hover .pinment-share-capacity-tooltip,
.pinment-share-capacity-help:focus .pinment-share-capacity-tooltip {
  display: block;
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
  gap: 6px;
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
