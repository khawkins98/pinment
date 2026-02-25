/**
 * Pinment hub site
 *
 * Handles two jobs:
 * 1. Provides the bookmarklet for installation
 * 2. If the URL contains a #data= fragment, decodes and displays the annotation
 *    data so the user can see the review even without visiting the target page
 */
import { decompress, validateState, exportStateAsJson, importStateFromJson } from '../src/state.js';

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
    // Add getting-started hint above the bookmarklet step
    if (!install.querySelector('.viewer-getting-started')) {
      const hint = document.createElement('p');
      hint.className = 'viewer-getting-started';
      hint.textContent = 'New to Pinment? Get started by adding the bookmarklet:';
      install.insertBefore(hint, stepsList);
    }
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

  // Export button
  const exportBtn = document.createElement('button');
  exportBtn.className = 'viewer-btn viewer-btn-secondary';
  exportBtn.textContent = 'Export JSON';
  exportBtn.addEventListener('click', () => {
    const json = exportStateAsJson(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinment-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  actions.appendChild(exportBtn);

  meta.appendChild(actions);

  const CATEGORY_LABELS = {
    text: 'Text issue',
    layout: 'Layout issue',
    missing: 'Missing content',
    question: 'Question',
  };

  // Render pin list
  pinsList.innerHTML = '';
  for (const pin of state.pins) {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    item.className = 'review-pin';
    if (pin.resolved) item.classList.add('review-pin-resolved');

    const header = document.createElement('div');
    header.className = 'review-pin-header';

    const badge = document.createElement('span');
    badge.className = 'review-pin-number';
    badge.textContent = String(pin.id);

    header.appendChild(badge);

    if (pin.c && CATEGORY_LABELS[pin.c]) {
      const catBadge = document.createElement('span');
      catBadge.className = `review-pin-category review-pin-category-${pin.c}`;
      catBadge.textContent = CATEGORY_LABELS[pin.c];
      header.appendChild(catBadge);
    }

    if (pin.resolved) {
      const resolvedBadge = document.createElement('span');
      resolvedBadge.className = 'review-pin-resolved-badge';
      resolvedBadge.textContent = 'Resolved';
      header.appendChild(resolvedBadge);
    }

    const author = document.createElement('span');
    author.className = 'review-pin-author';
    author.textContent = pin.author ? ` by ${pin.author}` : '';

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

    // Replies
    if (pin.replies && pin.replies.length > 0) {
      const repliesContainer = document.createElement('div');
      repliesContainer.className = 'review-pin-replies';
      for (const reply of pin.replies) {
        const replyEl = document.createElement('div');
        replyEl.className = 'review-pin-reply';
        if (reply.author) {
          const replyAuthor = document.createElement('span');
          replyAuthor.className = 'review-pin-reply-author';
          replyAuthor.textContent = reply.author;
          replyEl.appendChild(replyAuthor);
          replyEl.appendChild(document.createTextNode(' '));
        }
        const replyText = document.createElement('span');
        replyText.className = 'review-pin-reply-text';
        replyText.textContent = reply.text;
        replyEl.appendChild(replyText);
        repliesContainer.appendChild(replyEl);
      }
      item.appendChild(repliesContainer);
    }

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
  // Set the bookmarklet link to a tiny loader that dynamically loads
  // the full script from this site. This keeps the bookmark URL under
  // browser limits (~65 KB in Firefox) regardless of how large the
  // bookmarklet bundle grows.
  const bookmarkletLink = document.getElementById('bookmarklet');
  if (bookmarkletLink) {
    const scriptUrl = window.location.origin + import.meta.env.BASE_URL + 'pinment-bookmarklet.js';
    const loader = `(function(){var s=document.createElement('script');s.src='${scriptUrl}?v='+Date.now();s.onerror=function(){alert('Pinment failed to load. The page may block external scripts.')};document.head.appendChild(s)})()`;
    bookmarkletLink.href = 'javascript:void ' + encodeURIComponent(loader);
  }

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

  // Import JSON button
  const importBtn = document.getElementById('import-json-btn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json,application/json';
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const state = importStateFromJson(reader.result);
          if (state) {
            renderViewer(state);
          } else {
            renderError('Invalid Pinment JSON file. Check the file and try again.');
          }
        };
        reader.readAsText(file);
      });
      fileInput.click();
    });
  }
}

// Auto-init when loaded as a script (not during tests)
if (typeof window !== 'undefined' && document.getElementById('app')) {
  init();
}
