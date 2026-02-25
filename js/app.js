/**
 * Pinment hub site
 *
 * Handles two jobs:
 * 1. Provides the bookmarklet for installation
 * 2. If the URL contains a #data= fragment, decodes and displays the annotation
 *    data so the user can see the review even without visiting the target page
 */
import { decompress, validateState } from '../src/state.js';

export function parseHashData(hash) {
  if (!hash || !hash.startsWith('#data=')) return null;
  const compressed = hash.slice(6);
  const state = decompress(compressed);
  if (!state) return null;
  return validateState(state);
}

export function renderViewer(state) {
  const viewer = document.getElementById('viewer');
  const install = document.getElementById('install');
  const meta = document.getElementById('review-meta');
  const pinsList = document.getElementById('review-pins');

  if (!viewer || !meta || !pinsList) return;

  // Hide install, show viewer
  if (install) install.hidden = true;
  viewer.hidden = false;

  // Render meta info
  meta.innerHTML = '';
  const urlP = document.createElement('p');
  const urlLabel = document.createElement('strong');
  urlLabel.textContent = 'Page: ';
  const urlLink = document.createElement('a');
  urlLink.href = state.url;
  urlLink.target = '_blank';
  urlLink.rel = 'noopener';
  urlLink.textContent = state.url;
  urlP.appendChild(urlLabel);
  urlP.appendChild(urlLink);
  meta.appendChild(urlP);

  const viewportP = document.createElement('p');
  viewportP.textContent = `Viewport: ${state.viewport}px`;
  meta.appendChild(viewportP);

  const pinCountP = document.createElement('p');
  pinCountP.textContent = `${state.pins.length} annotation${state.pins.length !== 1 ? 's' : ''}`;
  meta.appendChild(pinCountP);

  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'viewer-actions';

  const openLink = document.createElement('a');
  openLink.href = state.url;
  openLink.target = '_blank';
  openLink.rel = 'noopener';
  openLink.className = 'viewer-btn viewer-btn-primary';
  openLink.textContent = 'Open target page';
  actions.appendChild(openLink);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'viewer-btn viewer-btn-secondary';
  copyBtn.textContent = 'Copy share URL';
  copyBtn.addEventListener('click', () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy share URL'; }, 2000);
      }).catch(() => {
        prompt('Copy this share URL:', shareUrl);
      });
    } else {
      prompt('Copy this share URL:', shareUrl);
    }
  });
  actions.appendChild(copyBtn);

  meta.appendChild(actions);

  // Render pin list
  pinsList.innerHTML = '';
  for (const pin of state.pins) {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    item.className = 'review-pin';

    const header = document.createElement('div');
    header.className = 'review-pin-header';

    const badge = document.createElement('span');
    badge.className = 'review-pin-number';
    badge.textContent = String(pin.id);

    const author = document.createElement('span');
    author.className = 'review-pin-author';
    author.textContent = pin.author ? ` by ${pin.author}` : '';

    header.appendChild(badge);
    header.appendChild(author);
    item.appendChild(header);

    const text = document.createElement('p');
    text.className = 'review-pin-text';
    text.textContent = pin.text;
    item.appendChild(text);

    const coords = document.createElement('p');
    coords.className = 'review-pin-coords';
    coords.textContent = `Position: ${Math.round(pin.x * 100)}% from left, ${pin.y}px from top`;
    item.appendChild(coords);

    pinsList.appendChild(item);
  }
}

export function renderError(message) {
  const viewer = document.getElementById('viewer');
  const install = document.getElementById('install');
  const meta = document.getElementById('review-meta');
  const pinsList = document.getElementById('review-pins');

  if (!viewer || !meta || !pinsList) return;

  if (install) install.hidden = true;
  viewer.hidden = false;

  meta.innerHTML = '';
  const errorP = document.createElement('p');
  errorP.className = 'viewer-error';
  errorP.textContent = message;
  meta.appendChild(errorP);

  pinsList.innerHTML = '';
}

export function init() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#data=')) {
    const state = parseHashData(hash);
    if (state) {
      renderViewer(state);
    } else {
      renderError('This share link appears to be corrupted or incomplete. Ask the sender for a new link.');
    }
  }

  // Listen for hash changes (e.g. user navigates to a share URL)
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash;
    if (newHash && newHash.startsWith('#data=')) {
      const newState = parseHashData(newHash);
      if (newState) {
        renderViewer(newState);
      } else {
        renderError('This share link appears to be corrupted or incomplete. Ask the sender for a new link.');
      }
    }
  });
}

// Auto-init when loaded as a script (not during tests)
if (typeof window !== 'undefined' && document.getElementById('app')) {
  init();
}
