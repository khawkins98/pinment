/**
 * Sidebar review panel and pin filtering.
 */
import { LOGO_SVG } from './styles.js';
import { VERSION, RELEASE_DATE } from '../version.js';

// Lightweight element helpers
function makeBtn(text, variant, onClick) {
  const btn = document.createElement('button');
  btn.className = 'pinment-btn' + (variant ? ` pinment-btn-${variant}` : '');
  btn.textContent = text;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

function makeIconBtn(svgHtml, title, onClick) {
  const btn = document.createElement('button');
  btn.className = 'pinment-btn pinment-btn-icon';
  btn.innerHTML = svgHtml;
  btn.title = title;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
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

    modeBarBtns.appendChild(makeIconBtn(
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2.5"/></svg>',
      'Toggle pin visibility', onToggle));

    if (onImport) {
      modeBarBtns.appendChild(makeIconBtn(
        '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M8 10V2"/><path d="M4 4l4-4 4 4"/></svg>',
        'Import from JSON', onImport));
    }

    if (onStartNew) {
      modeBarBtns.appendChild(makeIconBtn(
        '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>',
        'Start new annotation', onStartNew));
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
  const versionLink = document.createElement('a');
  versionLink.href = 'https://github.com/khawkins98/pinment/blob/main/CHANGELOG.md';
  versionLink.target = '_blank';
  versionLink.rel = 'noopener noreferrer';
  versionLink.title = 'View changelog';
  versionLink.textContent = `v${VERSION} · ${RELEASE_DATE}`;
  versionEl.appendChild(versionLink);
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

    const saveBtn = makeBtn('Save', 'save', onSave ? () => onSave(pin.id, textarea.value, authorInput.value) : null);
    actions.appendChild(saveBtn);

    const resolveBtn = makeBtn(pin.resolved ? 'Resolved' : 'Resolve', 'resolve', onResolveToggle ? () => onResolveToggle(pin.id) : null);
    resolveBtn.classList.add(pin.resolved ? 'pinment-btn-resolve-resolved' : 'pinment-btn-resolve-open');
    actions.appendChild(resolveBtn);

    const deleteBtn = makeBtn('Delete', 'delete', onDelete ? () => onDelete(pin.id) : null);
    actions.appendChild(deleteBtn);

    const replyBtn = makeBtn('Reply', 'reply');
    actions.appendChild(replyBtn);

    item.appendChild(actions);

    // Replies section (editable)
    if (pin.replies && pin.replies.length > 0) {
      item.appendChild(renderReplies(pin.replies));
    }

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

      replyActions.appendChild(makeBtn('Add reply', 'add-reply', () => {
        const text = replyInput.value.trim();
        if (!text) return;
        if (onReply) onReply(pin.id, text, replyAuthorInput.value);
      }));

      replyActions.appendChild(makeBtn('Cancel', 'cancel-reply', () => form.remove()));

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


export function createMinimizedButton(onRestore) {
  const btn = document.createElement('button');
  btn.className = 'pinment-minimized-btn';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 1.5a1.914 1.914 0 0 1 2.707 2.707L5.707 12.707 1.5 14.5l1.793-4.207z"/></svg> Pinment';
  if (onRestore) btn.addEventListener('click', onRestore);
  return btn;
}

