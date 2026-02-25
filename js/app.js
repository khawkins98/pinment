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

  // Show viewer; collapse install to just the bookmarklet step
  viewer.hidden = false;
  if (install) {
    install.querySelectorAll('.step:not(.step-featured)').forEach(s => { s.hidden = true; });
    const stepsList = install.querySelector('.steps');
    if (stepsList) stepsList.classList.add('steps-compact');
    // Move viewer above the install section
    if (install.parentNode === viewer.parentNode) {
      viewer.parentNode.insertBefore(viewer, install);
    }
  }

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

  if (state.env) {
    const envP = document.createElement('p');
    const parts = [];
    if (state.env.ua) parts.push('Browser: ' + state.env.ua);
    if (state.env.vp) parts.push('Viewport: ' + state.env.vp[0] + '\u00d7' + state.env.vp[1]);
    if (state.env.dt) {
      const labels = { d: 'Desktop', t: 'Tablet', m: 'Mobile' };
      parts.push(labels[state.env.dt] || state.env.dt);
    }
    envP.textContent = parts.join(' \u2022 ');
    meta.appendChild(envP);
  } else {
    const viewportP = document.createElement('p');
    viewportP.textContent = `Viewport: ${state.viewport}px`;
    meta.appendChild(viewportP);
  }

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
    if (pin.s) {
      coords.textContent = `Anchored to: ${pin.s}`;
    } else {
      coords.textContent = `Position: ${Math.round(pin.fx)}px, ${Math.round(pin.fy)}px (pixel fallback)`;
    }
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

  viewer.hidden = false;
  if (install) {
    install.querySelectorAll('.step:not(.step-featured)').forEach(s => { s.hidden = true; });
    const stepsList = install.querySelector('.steps');
    if (stepsList) stepsList.classList.add('steps-compact');
    if (install.parentNode === viewer.parentNode) {
      viewer.parentNode.insertBefore(viewer, install);
    }
  }

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
