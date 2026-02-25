/**
 * Bookmarklet UI module
 *
 * Provides functions for creating pins, the comment panel,
 * and calculating pin positions. All CSS classes use the
 * pinment- namespace to avoid conflicts with host pages.
 */

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
.pinment-btn-toggle {}
.pinment-btn-close {}
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
  width: 420px;
  max-width: calc(100vw - 32px);
  padding: 28px;
  color: #1a202c;
  font-size: 14px;
  line-height: 1.5;
}
.pinment-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 22px;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  font-family: system-ui, sans-serif;
}
.pinment-modal-close:hover {
  color: #4a5568;
}
.pinment-modal-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 4px;
}
.pinment-modal-link {
  display: inline-block;
  color: #3182ce;
  font-size: 13px;
  text-decoration: none;
  margin-bottom: 20px;
}
.pinment-modal-link:hover {
  text-decoration: underline;
}
.pinment-modal-group {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}
.pinment-modal-group-desc {
  font-size: 13px;
  color: #718096;
  margin: 0 0 10px;
}
.pinment-modal-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 6px;
}
.pinment-modal-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font: inherit;
  font-size: 14px;
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
  margin-top: 6px;
  min-height: 18px;
}
.pinment-modal-group-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.pinment-modal-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  color: #a0aec0;
  font-size: 13px;
}
.pinment-modal-divider::before,
.pinment-modal-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.pinment-modal-btn {
  padding: 10px 16px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s;
}
.pinment-modal-btn-primary {
  background: #3182ce;
  color: #fff;
  border-color: #3182ce;
}
.pinment-modal-btn-primary:hover {
  background: #2b6cb0;
}
.pinment-modal-btn-secondary {
  background: #fff;
  color: #2d3748;
  width: 100%;
}
.pinment-modal-btn-secondary:hover {
  background: #edf2f7;
}
`;
}

export function calculatePinPosition(pageX, pageY, viewportWidth) {
  if (viewportWidth <= 0) return { x: 0, y: pageY };
  const x = Math.max(0, Math.min(1, pageX / viewportWidth));
  return { x, y: pageY };
}

export function createPinElement(pin, currentViewportWidth) {
  const el = document.createElement('div');
  el.className = 'pinment-pin';
  el.dataset.pinmentId = pin.id;
  el.textContent = String(pin.id);
  el.style.position = 'absolute';
  el.style.left = `${pin.x * currentViewportWidth}px`;
  el.style.top = `${pin.y}px`;
  return el;
}

export function createPanel(pins, options = {}) {
  const { editable = false, onShare, onToggle, onClose, onSave, onDelete } = options;

  const panel = document.createElement('div');
  panel.className = 'pinment-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'pinment-panel-header';
  header.innerHTML = `<span>Pinment</span>`;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'pinment-btn pinment-btn-close';
  closeBtn.textContent = '\u00d7';
  closeBtn.title = 'Close Pinment';
  if (onClose) closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);
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
    const comment = createCommentItem(pin, editable, { onSave, onDelete });
    body.appendChild(comment);
  }

  panel.appendChild(body);

  // Footer buttons
  const footer = document.createElement('div');
  footer.className = 'pinment-panel-footer';

  const shareBtn = document.createElement('button');
  shareBtn.className = 'pinment-btn pinment-btn-share';
  shareBtn.textContent = 'Share';
  if (onShare) shareBtn.addEventListener('click', onShare);
  footer.appendChild(shareBtn);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'pinment-btn pinment-btn-toggle';
  toggleBtn.textContent = 'Toggle pins';
  if (onToggle) toggleBtn.addEventListener('click', onToggle);
  footer.appendChild(toggleBtn);

  panel.appendChild(footer);

  return panel;
}

function createCommentItem(pin, editable, { onSave, onDelete } = {}) {
  const item = document.createElement('div');
  item.className = 'pinment-comment';
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

export function restorePins(state, container, currentViewportWidth) {
  const elements = [];
  for (const pin of state.pins) {
    const el = createPinElement(pin, currentViewportWidth);
    container.appendChild(el);
    elements.push(el);
  }
  return elements;
}

/**
 * Creates a welcome modal that replaces the native prompt().
 * Returns a Promise that resolves with the pasted URL string,
 * or null if the user chooses to start fresh.
 *
 * @param {(url: string) => object|null} validateUrl - validator that returns
 *   parsed state if the URL is valid, or null if not.
 * @returns {{ modal: HTMLElement, promise: Promise<string|null> }}
 */
export function createWelcomeModal(validateUrl) {
  const backdrop = document.createElement('div');
  backdrop.className = 'pinment-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'pinment-modal';

  const title = document.createElement('h2');
  title.className = 'pinment-modal-title';
  title.textContent = 'Pinment';
  modal.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'pinment-modal-desc';
  desc.textContent = 'Load annotations from a share URL, or start a fresh review on this page.';
  modal.appendChild(desc);

  const label = document.createElement('label');
  label.className = 'pinment-modal-label';
  label.textContent = 'Share URL';
  modal.appendChild(label);

  const input = document.createElement('input');
  input.className = 'pinment-modal-input';
  input.type = 'text';
  input.placeholder = 'https://khawkins98.github.io/pinment/#data=...';
  input.setAttribute('autocomplete', 'off');
  modal.appendChild(input);

  const errorEl = document.createElement('div');
  errorEl.className = 'pinment-modal-error';
  modal.appendChild(errorEl);

  const actions = document.createElement('div');
  actions.className = 'pinment-modal-actions';

  const freshBtn = document.createElement('button');
  freshBtn.className = 'pinment-modal-btn pinment-modal-btn-secondary';
  freshBtn.textContent = 'Start fresh';

  const loadBtn = document.createElement('button');
  loadBtn.className = 'pinment-modal-btn pinment-modal-btn-primary';
  loadBtn.textContent = 'Load annotations';

  actions.appendChild(freshBtn);
  actions.appendChild(loadBtn);
  modal.appendChild(actions);

  backdrop.appendChild(modal);

  const promise = new Promise((resolve) => {
    freshBtn.addEventListener('click', () => {
      backdrop.remove();
      resolve(null);
    });

    loadBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (!value) {
        backdrop.remove();
        resolve(null);
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

    // Focus the input once it's in the DOM
    setTimeout(() => input.focus(), 0);
  });

  return { modal: backdrop, promise };
}
