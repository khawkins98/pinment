/**
 * Modal dialogs: welcome, share/export, exit confirm, device warning, docs site.
 */
import { LOGO_SVG } from './styles.js';

/**
 * Creates a welcome modal that replaces the native prompt().
 * Returns a Promise that resolves with the pasted URL string,
 * null if the user chooses to start annotating, or false if cancelled.
 *
 * @param {(url: string) => object|null} validateUrl - validator that returns
 *   parsed state if the URL is valid, or null if not.
 * @returns {{ modal: HTMLElement, promise: Promise<string|null|false> }}
 */
export function createWelcomeModal(validateUrl, validateImport, draft = null) {
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
  link.href = 'https://www.allaboutken.com/pinment/';
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


  // Unsaved draft resume action (if present)
  let draftBtn = null;
  if (draft && draft.pins && draft.pins.length > 0) {
    const draftLabel = document.createElement('label');
    draftLabel.className = 'pinment-modal-label';
    draftLabel.textContent = 'Unsaved draft found for this page';
    body.appendChild(draftLabel);

    draftBtn = document.createElement('button');
    draftBtn.className = 'pinment-modal-btn pinment-modal-btn-draft';
    const pinCount = draft.pins.length;
    draftBtn.textContent = `Resume unsaved draft (${pinCount} pin${pinCount !== 1 ? 's' : ''})`;
    body.appendChild(draftBtn);

    const draftDivider = document.createElement('div');
    draftDivider.className = 'pinment-modal-divider';
    draftDivider.textContent = 'or';
    body.appendChild(draftDivider);
  }
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
  input.placeholder = 'https://www.allaboutken.com/pinment/#data=...';
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

    if (draftBtn) {
      draftBtn.addEventListener('click', () => {
        backdrop.remove();
        resolve({ isDraft: true, pins: draft.pins, nextId: draft.nextId });
      });
    }

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
  const tooltipText = 'Pinment stores annotations in the URL itself \u2014 no server needed. Browsers limit URL length to roughly 8KB, so very large annotations may need JSON export instead.';
  const helpIcon = `<span class="pinment-share-capacity-help" tabindex="0" role="button" aria-label="What is the URL limit?">?<span class="pinment-share-capacity-tooltip">${tooltipText}</span></span>`;
  capacityEl.innerHTML = overLimit
    ? `<strong style="color:#e53e3e">URL is ${Math.round(urlSize / 1024)}KB \u2014 exceeds the ~${Math.round(maxUrlBytes / 1024)}KB limit.</strong> Remove some annotations or shorten comments, or use JSON export below. ${helpIcon}`
    : `${Math.round(urlSize / 1024 * 10) / 10}KB of ~${Math.round(maxUrlBytes / 1024)}KB URL limit (${pct}%) ${helpIcon}`;
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
  jsonBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M8 2v8"/><path d="M4 8l4 4 4-4"/></svg> Download JSON';
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
  pdfBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="1" width="12" height="14" rx="1"/><path d="M5 5h6"/><path d="M5 8h6"/><path d="M5 11h3"/></svg> Download PDF';
  body.appendChild(pdfBtn);

  modal.appendChild(body);
  backdrop.appendChild(modal);

  // --- Event handlers ---
  closeBtn.addEventListener('click', () => backdrop.remove());

  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        feedbackEl.className = 'pinment-share-copied';
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
