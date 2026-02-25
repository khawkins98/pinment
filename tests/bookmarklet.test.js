import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinElement, createPanel, calculatePinPosition, restorePins, buildStyles, createWelcomeModal, createDocsSiteModal, createMinimizedButton, createExitConfirmModal, filterAndSortPins, repositionPin, highlightPinTarget, clearPinHighlight } from '../src/bookmarklet/ui.js';
import { createState } from '../src/state.js';

beforeEach(() => {
  document.body.innerHTML = '';
  // Set a viewport width for tests
  Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true });
  Object.defineProperty(document.documentElement, 'scrollHeight', { value: 5000, writable: true });
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('buildStyles', () => {
  it('returns a string of CSS', () => {
    const css = buildStyles();
    expect(typeof css).toBe('string');
    expect(css.length).toBeGreaterThan(0);
  });

  it('uses pinment- namespaced selectors', () => {
    const css = buildStyles();
    // All class selectors should be namespaced
    const classMatches = css.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
    for (const cls of classMatches) {
      expect(cls).toMatch(/^\.pinment-/);
    }
  });
});

describe('calculatePinPosition', () => {
  beforeEach(() => {
    // jsdom doesn't implement elementFromPoint — provide a mock
    if (!document.elementFromPoint) {
      document.elementFromPoint = vi.fn().mockReturnValue(null);
    }
  });

  it('returns fallback coordinates when no element found', () => {
    document.elementFromPoint = vi.fn().mockReturnValue(null);
    const pos = calculatePinPosition(720, 500, null, null);
    expect(pos.s).toBeNull();
    expect(pos.ox).toBeNull();
    expect(pos.oy).toBeNull();
    expect(typeof pos.fx).toBe('number');
    expect(typeof pos.fy).toBe('number');
  });

  it('returns v2 pin position fields when element found', () => {
    const target = document.createElement('div');
    target.id = 'test-target';
    document.body.appendChild(target);
    // Mock elementFromPoint to return our target
    document.elementFromPoint = vi.fn().mockReturnValue(target);
    // Mock getBoundingClientRect
    target.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100,
    });

    const pos = calculatePinPosition(100, 50, null, null);
    expect(pos).toHaveProperty('s');
    expect(pos).toHaveProperty('ox');
    expect(pos).toHaveProperty('oy');
    expect(pos).toHaveProperty('fx');
    expect(pos).toHaveProperty('fy');
    expect(pos.s).not.toBeNull();
    expect(pos.ox).toBeCloseTo(0.5);
    expect(pos.oy).toBeCloseTo(0.5);
  });

  it('temporarily hides overlay and pin container during element detection', () => {
    document.elementFromPoint = vi.fn().mockReturnValue(null);
    const overlay = document.createElement('div');
    overlay.style.pointerEvents = 'auto';
    const container = document.createElement('div');
    container.style.display = 'block';

    calculatePinPosition(100, 100, overlay, container);

    // After call, styles should be restored
    expect(overlay.style.pointerEvents).toBe('');
    expect(container.style.display).toBe('');
  });
});

describe('createPinElement', () => {
  it('creates a positioned element with pin number', () => {
    const pin = { id: 1, s: null, ox: null, oy: null, fx: 720, fy: 200, author: 'FL', text: 'Test' };
    const el = createPinElement(pin);
    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('pinment-pin')).toBe(true);
    expect(el.textContent).toContain('1');
  });

  it('positions pin using fallback when selector is null', () => {
    const pin = { id: 3, s: null, ox: null, oy: null, fx: 360, fy: 500, author: '', text: '' };
    const el = createPinElement(pin);
    expect(el.style.position).toBe('absolute');
    expect(el.style.left).toBe('360px');
    expect(el.style.top).toBe('500px');
  });

  it('uses the pin id as visible number', () => {
    const pin = { id: 7, s: null, ox: null, oy: null, fx: 720, fy: 100, author: '', text: '' };
    const el = createPinElement(pin);
    expect(el.textContent).toContain('7');
  });

  it('adds fallback class when selector fails to resolve', () => {
    const pin = { id: 1, s: '#nonexistent-element', ox: 0.5, oy: 0.5, fx: 100, fy: 200, author: '', text: '' };
    const el = createPinElement(pin);
    expect(el.classList.contains('pinment-pin-fallback')).toBe(true);
    expect(el.style.left).toBe('100px');
    expect(el.style.top).toBe('200px');
  });

  it('does not add fallback class when selector is null', () => {
    const pin = { id: 1, s: null, ox: null, oy: null, fx: 100, fy: 200, author: '', text: '' };
    const el = createPinElement(pin);
    expect(el.classList.contains('pinment-pin-fallback')).toBe(false);
  });

  it('adds resolved class when pin is resolved', () => {
    const pin = { id: 1, s: null, ox: null, oy: null, fx: 100, fy: 200, author: '', text: '', resolved: true };
    const el = createPinElement(pin);
    expect(el.classList.contains('pinment-pin-resolved')).toBe(true);
  });

  it('does not add resolved class when pin is not resolved', () => {
    const pin = { id: 1, s: null, ox: null, oy: null, fx: 100, fy: 200, author: '', text: '' };
    const el = createPinElement(pin);
    expect(el.classList.contains('pinment-pin-resolved')).toBe(false);
  });
});

describe('repositionPin', () => {
  it('positions pin using element bounding rect and offset ratios', () => {
    const target = document.createElement('div');
    target.id = 'reposition-target';
    document.body.appendChild(target);
    target.getBoundingClientRect = () => ({ left: 100, top: 200, width: 400, height: 300 });

    const pin = { id: 1, s: '#reposition-target', ox: 0.5, oy: 0.25, fx: 0, fy: 0 };
    const el = document.createElement('div');
    repositionPin(el, pin);

    expect(el.style.left).toBe('300px'); // 100 + 0.5 * 400
    expect(el.style.top).toBe('275px');  // 200 + 0.25 * 300
    expect(el.classList.contains('pinment-pin-fallback')).toBe(false);
  });

  it('falls back to fx/fy when selector is null', () => {
    const pin = { id: 1, s: null, ox: null, oy: null, fx: 360, fy: 500 };
    const el = document.createElement('div');
    repositionPin(el, pin);

    expect(el.style.left).toBe('360px');
    expect(el.style.top).toBe('500px');
    expect(el.classList.contains('pinment-pin-fallback')).toBe(false);
  });

  it('falls back to fx/fy when selector does not resolve', () => {
    const pin = { id: 1, s: '#nonexistent', ox: 0.5, oy: 0.5, fx: 100, fy: 200 };
    const el = document.createElement('div');
    repositionPin(el, pin);

    expect(el.style.left).toBe('100px');
    expect(el.style.top).toBe('200px');
    expect(el.classList.contains('pinment-pin-fallback')).toBe(true);
  });

  it('removes fallback class when selector resolves again', () => {
    const el = document.createElement('div');
    el.classList.add('pinment-pin-fallback');

    const target = document.createElement('div');
    target.id = 'resolve-again';
    document.body.appendChild(target);
    target.getBoundingClientRect = () => ({ left: 50, top: 50, width: 100, height: 100 });

    const pin = { id: 1, s: '#resolve-again', ox: 0.5, oy: 0.5, fx: 999, fy: 999 };
    repositionPin(el, pin);

    expect(el.classList.contains('pinment-pin-fallback')).toBe(false);
  });

  it('handles invalid selectors gracefully', () => {
    const pin = { id: 1, s: '[invalid!!!', ox: 0.5, oy: 0.5, fx: 50, fy: 60 };
    const el = document.createElement('div');
    repositionPin(el, pin);

    expect(el.style.left).toBe('50px');
    expect(el.style.top).toBe('60px');
    expect(el.classList.contains('pinment-pin-fallback')).toBe(true);
  });
});

describe('highlightPinTarget', () => {
  it('adds pinment-highlight class to resolved element', () => {
    const target = document.createElement('div');
    target.id = 'highlight-test';
    document.body.appendChild(target);

    const pin = { id: 1, s: '#highlight-test' };
    const result = highlightPinTarget(pin);

    expect(result).toBe(target);
    expect(target.classList.contains('pinment-highlight')).toBe(true);
  });

  it('returns null when pin has no selector', () => {
    const pin = { id: 1, s: null };
    const result = highlightPinTarget(pin);
    expect(result).toBeNull();
  });

  it('returns null when selector does not resolve', () => {
    const pin = { id: 1, s: '#no-such-element' };
    const result = highlightPinTarget(pin);
    expect(result).toBeNull();
  });

  it('handles invalid selectors gracefully', () => {
    const pin = { id: 1, s: '[invalid!!!' };
    const result = highlightPinTarget(pin);
    expect(result).toBeNull();
  });
});

describe('clearPinHighlight', () => {
  it('removes pinment-highlight from all elements', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    el1.classList.add('pinment-highlight');
    el2.classList.add('pinment-highlight');
    document.body.appendChild(el1);
    document.body.appendChild(el2);

    clearPinHighlight();

    expect(el1.classList.contains('pinment-highlight')).toBe(false);
    expect(el2.classList.contains('pinment-highlight')).toBe(false);
  });

  it('is a no-op when no elements are highlighted', () => {
    expect(() => clearPinHighlight()).not.toThrow();
  });
});

describe('createPanel', () => {
  it('creates a panel element with pinment- class', () => {
    const panel = createPanel([]);
    expect(panel.classList.contains('pinment-panel')).toBe(true);
  });

  it('includes a header with title', () => {
    const panel = createPanel([]);
    const header = panel.querySelector('.pinment-panel-header');
    expect(header).not.toBeNull();
    expect(header.textContent).toContain('Pinment');
  });

  it('lists pins in the panel', () => {
    const pins = [
      { id: 1, x: 0.5, y: 100, author: 'FL', text: 'Fix heading' },
      { id: 2, x: 0.3, y: 200, author: 'KH', text: 'Add alt text' },
    ];
    const panel = createPanel(pins);
    const items = panel.querySelectorAll('.pinment-comment');
    expect(items.length).toBe(2);
  });

  it('shows pin number, author, and text for each comment', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: 'FL', text: 'Fix heading' }];
    const panel = createPanel(pins);
    const item = panel.querySelector('.pinment-comment');
    expect(item.textContent).toContain('1');
    expect(item.textContent).toContain('FL');
    expect(item.textContent).toContain('Fix heading');
  });

  it('includes action buttons', () => {
    const panel = createPanel([]);
    expect(panel.querySelector('.pinment-btn-share')).not.toBeNull();
    expect(panel.querySelector('.pinment-btn-toggle')).not.toBeNull();
    expect(panel.querySelector('.pinment-btn-close')).not.toBeNull();
    expect(panel.querySelector('.pinment-btn-minimize')).not.toBeNull();
  });

  it('shows mode bar in editable mode', () => {
    const panel = createPanel([], { editable: true });
    const modeBar = panel.querySelector('.pinment-mode-bar');
    expect(modeBar).not.toBeNull();
    expect(modeBar.textContent).toContain('Pin mode');
  });

  it('shows browse mode when editMode is false', () => {
    const panel = createPanel([], { editable: true, editMode: false });
    const modeBar = panel.querySelector('.pinment-mode-bar');
    expect(modeBar).not.toBeNull();
    expect(modeBar.textContent).toContain('Browse mode');
    expect(modeBar.classList.contains('pinment-mode-bar-browse')).toBe(true);
  });

  it('does not show mode bar in read-only mode', () => {
    const panel = createPanel([]);
    const modeBar = panel.querySelector('.pinment-mode-bar');
    expect(modeBar).toBeNull();
  });

  it('renders textarea and author input in editable mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: 'FL', text: 'Fix heading' }];
    const panel = createPanel(pins, { editable: true });
    const textarea = panel.querySelector('.pinment-comment-input');
    const authorInput = panel.querySelector('.pinment-author-input');
    expect(textarea).not.toBeNull();
    expect(textarea.value).toBe('Fix heading');
    expect(authorInput).not.toBeNull();
    expect(authorInput.value).toBe('FL');
  });

  it('renders static text in read-only mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: 'FL', text: 'Fix heading' }];
    const panel = createPanel(pins, { editable: false });
    const textEl = panel.querySelector('.pinment-comment-text');
    expect(textEl).not.toBeNull();
    expect(textEl.textContent).toBe('Fix heading');
    // No textarea in read-only mode
    expect(panel.querySelector('.pinment-comment-input')).toBeNull();
  });

  it('renders save and delete buttons in editable mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true });
    expect(panel.querySelector('.pinment-btn-save')).not.toBeNull();
    expect(panel.querySelector('.pinment-btn-delete')).not.toBeNull();
  });

  it('does not render save/delete buttons in read-only mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: false });
    expect(panel.querySelector('.pinment-btn-save')).toBeNull();
    expect(panel.querySelector('.pinment-btn-delete')).toBeNull();
  });

  it('invokes onShare callback when share button is clicked', () => {
    const onShare = vi.fn();
    const panel = createPanel([], { onShare });
    panel.querySelector('.pinment-btn-share').click();
    expect(onShare).toHaveBeenCalledOnce();
  });

  it('invokes onToggle callback when toggle button is clicked', () => {
    const onToggle = vi.fn();
    const panel = createPanel([], { onToggle });
    panel.querySelector('.pinment-btn-toggle').click();
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('invokes onClose callback when close button is clicked (backward compat)', () => {
    const onClose = vi.fn();
    const panel = createPanel([], { onClose });
    panel.querySelector('.pinment-btn-close').click();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('invokes onExit callback when exit button is clicked', () => {
    const onExit = vi.fn();
    const panel = createPanel([], { onExit });
    panel.querySelector('.pinment-btn-close').click();
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('invokes onMinimize callback when minimize button is clicked', () => {
    const onMinimize = vi.fn();
    const panel = createPanel([], { onMinimize });
    panel.querySelector('.pinment-btn-minimize').click();
    expect(onMinimize).toHaveBeenCalledOnce();
  });

  it('share button text contains "Save & Share"', () => {
    const panel = createPanel([]);
    const shareBtn = panel.querySelector('.pinment-btn-share');
    expect(shareBtn.textContent).toContain('Save');
    expect(shareBtn.textContent).toContain('Share');
  });

  it('toggle button has no visible text, only SVG', () => {
    const panel = createPanel([]);
    const toggleBtn = panel.querySelector('.pinment-btn-toggle');
    expect(toggleBtn.querySelector('svg')).not.toBeNull();
    // Should have no text nodes with visible content
    const textContent = Array.from(toggleBtn.childNodes)
      .filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim())
      .join('');
    expect(textContent).toBe('');
  });

  it('invokes onSave with pin id, text, and author when save is clicked', () => {
    const onSave = vi.fn();
    const pins = [{ id: 5, x: 0.5, y: 100, author: 'FL', text: 'Original' }];
    const panel = createPanel(pins, { editable: true, onSave });
    // Modify the textarea and author input before saving
    const textarea = panel.querySelector('.pinment-comment-input');
    const authorInput = panel.querySelector('.pinment-author-input');
    textarea.value = 'Updated comment';
    authorInput.value = 'KH';
    panel.querySelector('.pinment-btn-save').click();
    expect(onSave).toHaveBeenCalledWith(5, 'Updated comment', 'KH');
  });

  it('invokes onDelete with pin id when delete is clicked', () => {
    const onDelete = vi.fn();
    const pins = [{ id: 3, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true, onDelete });
    panel.querySelector('.pinment-btn-delete').click();
    expect(onDelete).toHaveBeenCalledWith(3);
  });

  it('sets data-pinment-id on comment items', () => {
    const pins = [{ id: 4, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins);
    const comment = panel.querySelector('.pinment-comment');
    expect(comment.dataset.pinmentId).toBe('4');
  });

  it('renders category selector in editable mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true });
    const select = panel.querySelector('.pinment-category-select');
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(5); // default + 4 categories
  });

  it('pre-selects the current category', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '', c: 'layout' }];
    const panel = createPanel(pins, { editable: true });
    const select = panel.querySelector('.pinment-category-select');
    expect(select.value).toBe('layout');
  });

  it('does not render category selector in read-only mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: false });
    expect(panel.querySelector('.pinment-category-select')).toBeNull();
  });

  it('shows category badge when pin has a category', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '', c: 'text' }];
    const panel = createPanel(pins);
    const badge = panel.querySelector('.pinment-category-badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe('Text issue');
    expect(badge.classList.contains('pinment-category-text')).toBe(true);
  });

  it('does not show category badge when pin has no category', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins);
    expect(panel.querySelector('.pinment-category-badge')).toBeNull();
  });

  it('invokes onCategoryChange when category is selected', () => {
    const onCategoryChange = vi.fn();
    const pins = [{ id: 3, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true, onCategoryChange });
    const select = panel.querySelector('.pinment-category-select');
    select.value = 'question';
    select.dispatchEvent(new Event('change'));
    expect(onCategoryChange).toHaveBeenCalledWith(3, 'question');
  });

  it('invokes onCategoryChange with undefined when cleared', () => {
    const onCategoryChange = vi.fn();
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '', c: 'text' }];
    const panel = createPanel(pins, { editable: true, onCategoryChange });
    const select = panel.querySelector('.pinment-category-select');
    select.value = '';
    select.dispatchEvent(new Event('change'));
    expect(onCategoryChange).toHaveBeenCalledWith(1, undefined);
  });

  it('renders resolve button in editable mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true });
    const resolveBtn = panel.querySelector('.pinment-btn-resolve');
    expect(resolveBtn).not.toBeNull();
    expect(resolveBtn.textContent).toBe('Resolve');
  });

  it('shows Resolved text when pin is resolved', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '', resolved: true }];
    const panel = createPanel(pins, { editable: true });
    const resolveBtn = panel.querySelector('.pinment-btn-resolve');
    expect(resolveBtn.textContent).toBe('Resolved');
    expect(resolveBtn.classList.contains('pinment-btn-resolve-resolved')).toBe(true);
  });

  it('applies resolved class to comment item when resolved', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '', resolved: true }];
    const panel = createPanel(pins, { editable: true });
    const comment = panel.querySelector('.pinment-comment');
    expect(comment.classList.contains('pinment-comment-resolved')).toBe(true);
  });

  it('invokes onResolveToggle when resolve button is clicked', () => {
    const onResolveToggle = vi.fn();
    const pins = [{ id: 5, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true, onResolveToggle });
    panel.querySelector('.pinment-btn-resolve').click();
    expect(onResolveToggle).toHaveBeenCalledWith(5);
  });

  it('renders export button', () => {
    const panel = createPanel([]);
    const exportBtn = panel.querySelector('.pinment-btn-export');
    expect(exportBtn).not.toBeNull();
  });

  it('invokes onExport when export button is clicked', () => {
    const onExport = vi.fn();
    const panel = createPanel([], { onExport });
    panel.querySelector('.pinment-btn-export').click();
    expect(onExport).toHaveBeenCalledOnce();
  });

  it('renders import button', () => {
    const panel = createPanel([]);
    const importBtn = panel.querySelector('.pinment-btn-import');
    expect(importBtn).not.toBeNull();
  });

  it('invokes onImport when import button is clicked', () => {
    const onImport = vi.fn();
    const panel = createPanel([], { onImport });
    panel.querySelector('.pinment-btn-import').click();
    expect(onImport).toHaveBeenCalledOnce();
  });

  it('renders version info in footer', () => {
    const panel = createPanel([]);
    const version = panel.querySelector('.pinment-version');
    expect(version).not.toBeNull();
    expect(version.textContent).toMatch(/^v\d+\.\d+\.\d+ · \d{4}-\d{2}-\d{2}$/);
  });

  it('renders reply button in editable mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true });
    const replyBtn = panel.querySelector('.pinment-btn-reply');
    expect(replyBtn).not.toBeNull();
    expect(replyBtn.textContent).toBe('Reply');
  });

  it('does not render reply button in read-only mode', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: false });
    expect(panel.querySelector('.pinment-btn-reply')).toBeNull();
  });

  it('shows reply form when reply button is clicked', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true });
    panel.querySelector('.pinment-btn-reply').click();
    expect(panel.querySelector('.pinment-reply-form')).not.toBeNull();
    expect(panel.querySelector('.pinment-reply-input')).not.toBeNull();
    expect(panel.querySelector('.pinment-btn-add-reply')).not.toBeNull();
    expect(panel.querySelector('.pinment-btn-cancel-reply')).not.toBeNull();
  });

  it('toggles reply form on repeated clicks', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true });
    const replyBtn = panel.querySelector('.pinment-btn-reply');
    replyBtn.click();
    expect(panel.querySelector('.pinment-reply-form')).not.toBeNull();
    replyBtn.click();
    expect(panel.querySelector('.pinment-reply-form')).toBeNull();
  });

  it('removes reply form when cancel is clicked', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true });
    panel.querySelector('.pinment-btn-reply').click();
    panel.querySelector('.pinment-btn-cancel-reply').click();
    expect(panel.querySelector('.pinment-reply-form')).toBeNull();
  });

  it('invokes onReply with pin id, text, and author when add reply is clicked', () => {
    const onReply = vi.fn();
    const pins = [{ id: 5, x: 0.5, y: 100, author: 'FL', text: 'test' }];
    const panel = createPanel(pins, { editable: true, onReply });
    panel.querySelector('.pinment-btn-reply').click();
    const replyInput = panel.querySelector('.pinment-reply-input');
    replyInput.value = 'My reply';
    const authorInput = panel.querySelector('.pinment-reply-form .pinment-author-input');
    authorInput.value = 'KH';
    panel.querySelector('.pinment-btn-add-reply').click();
    expect(onReply).toHaveBeenCalledWith(5, 'My reply', 'KH');
  });

  it('does not invoke onReply when reply text is empty', () => {
    const onReply = vi.fn();
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true, onReply });
    panel.querySelector('.pinment-btn-reply').click();
    panel.querySelector('.pinment-btn-add-reply').click();
    expect(onReply).not.toHaveBeenCalled();
  });

  it('renders existing replies in editable mode', () => {
    const pins = [{
      id: 1, x: 0.5, y: 100, author: 'FL', text: 'test',
      replies: [{ author: 'KH', text: 'Fixed it' }],
    }];
    const panel = createPanel(pins, { editable: true });
    const replies = panel.querySelector('.pinment-replies');
    expect(replies).not.toBeNull();
    expect(replies.textContent).toContain('KH');
    expect(replies.textContent).toContain('Fixed it');
  });

  it('renders existing replies in read-only mode', () => {
    const pins = [{
      id: 1, x: 0.5, y: 100, author: 'FL', text: 'test',
      replies: [{ author: 'KH', text: 'Confirmed' }],
    }];
    const panel = createPanel(pins, { editable: false });
    const replies = panel.querySelector('.pinment-replies');
    expect(replies).not.toBeNull();
    expect(replies.textContent).toContain('KH');
    expect(replies.textContent).toContain('Confirmed');
  });

  it('does not render replies section when no replies exist', () => {
    const pins = [{ id: 1, x: 0.5, y: 100, author: '', text: '' }];
    const panel = createPanel(pins, { editable: true });
    expect(panel.querySelector('.pinment-replies')).toBeNull();
  });

  it('renders multiple replies', () => {
    const pins = [{
      id: 1, x: 0.5, y: 100, author: 'FL', text: 'test',
      replies: [
        { author: 'KH', text: 'First reply' },
        { author: 'FL', text: 'Second reply' },
      ],
    }];
    const panel = createPanel(pins, { editable: true });
    const replyItems = panel.querySelectorAll('.pinment-reply');
    expect(replyItems.length).toBe(2);
  });
});

describe('restorePins', () => {
  it('creates pin elements from state data', () => {
    const container = document.createElement('div');
    const state = createState('https://example.com', 1440, [
      { id: 1, s: null, ox: null, oy: null, fx: 720, fy: 200, author: 'FL', text: 'Test' },
      { id: 2, s: null, ox: null, oy: null, fx: 432, fy: 400, author: 'KH', text: 'Another' },
    ]);
    const pins = restorePins(state, container);
    expect(pins.length).toBe(2);
    expect(container.querySelectorAll('.pinment-pin').length).toBe(2);
  });

  it('positions pins using fallback coordinates', () => {
    const container = document.createElement('div');
    const state = createState('https://example.com', 1440, [
      { id: 1, s: null, ox: null, oy: null, fx: 400, fy: 200, author: '', text: '' },
    ]);
    restorePins(state, container);
    const pinEl = container.querySelector('.pinment-pin');
    expect(pinEl.style.left).toBe('400px');
    expect(pinEl.style.top).toBe('200px');
  });
});

describe('createWelcomeModal', () => {
  it('creates a backdrop with modal content', () => {
    const { modal } = createWelcomeModal();
    expect(modal.classList.contains('pinment-modal-backdrop')).toBe(true);
    expect(modal.querySelector('.pinment-modal')).not.toBeNull();
  });

  it('contains title, link, input, and action buttons', () => {
    const { modal } = createWelcomeModal();
    expect(modal.querySelector('.pinment-modal-title').textContent).toBe('Pinment');
    expect(modal.querySelector('.pinment-modal-link')).not.toBeNull();
    expect(modal.querySelector('.pinment-modal-input')).not.toBeNull();
    expect(modal.querySelector('.pinment-modal-btn-primary').textContent).toBe('Load');
    expect(modal.querySelector('.pinment-modal-btn-start').textContent).toContain('Start annotating on this page');
    expect(modal.querySelector('.pinment-modal-close')).not.toBeNull();
  });

  it('resolves with null when "Start annotating" is clicked', async () => {
    const { modal, promise } = createWelcomeModal();
    document.body.appendChild(modal);
    modal.querySelector('.pinment-modal-btn-start').click();
    const result = await promise;
    expect(result).toBeNull();
  });

  it('resolves with false when cancel is clicked', async () => {
    const { modal, promise } = createWelcomeModal();
    document.body.appendChild(modal);
    modal.querySelector('.pinment-modal-close').click();
    const result = await promise;
    expect(result).toBe(false);
  });

  it('shows error when "Load annotations" is clicked with empty input', async () => {
    const { modal } = createWelcomeModal();
    document.body.appendChild(modal);
    modal.querySelector('.pinment-modal-btn-primary').click();
    // Modal should still be in the DOM
    expect(document.querySelector('.pinment-modal-backdrop')).not.toBeNull();
    const errorEl = modal.querySelector('.pinment-modal-error');
    expect(errorEl.textContent).toContain('paste');
  });

  it('resolves with URL string when valid URL is submitted', async () => {
    const validator = vi.fn().mockReturnValue({ v: 1 });
    const { modal, promise } = createWelcomeModal(validator);
    document.body.appendChild(modal);
    const input = modal.querySelector('.pinment-modal-input');
    input.value = 'https://example.com/#data=abc123';
    modal.querySelector('.pinment-modal-btn-primary').click();
    const result = await promise;
    expect(result).toBe('https://example.com/#data=abc123');
    expect(validator).toHaveBeenCalledWith('https://example.com/#data=abc123');
  });

  it('shows error and stays open when validator rejects URL', async () => {
    const validator = vi.fn().mockReturnValue(null);
    const { modal } = createWelcomeModal(validator);
    document.body.appendChild(modal);
    const input = modal.querySelector('.pinment-modal-input');
    input.value = 'not-a-valid-url';
    modal.querySelector('.pinment-modal-btn-primary').click();
    // Modal should still be in the DOM
    expect(document.querySelector('.pinment-modal-backdrop')).not.toBeNull();
    // Error message should be shown
    const errorEl = modal.querySelector('.pinment-modal-error');
    expect(errorEl.textContent).toContain('Not a valid');
    // Input should have error class
    expect(input.classList.contains('pinment-modal-input-error')).toBe(true);
  });

  it('clears error when user types in input', async () => {
    const validator = vi.fn().mockReturnValue(null);
    const { modal } = createWelcomeModal(validator);
    document.body.appendChild(modal);
    const input = modal.querySelector('.pinment-modal-input');
    input.value = 'bad';
    modal.querySelector('.pinment-modal-btn-primary').click();
    // Error is shown
    expect(input.classList.contains('pinment-modal-input-error')).toBe(true);
    // User types — error should clear
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('pinment-modal-input-error')).toBe(false);
    expect(modal.querySelector('.pinment-modal-error').textContent).toBe('');
  });

  it('removes backdrop from DOM when resolved', async () => {
    const { modal, promise } = createWelcomeModal();
    document.body.appendChild(modal);
    expect(document.querySelector('.pinment-modal-backdrop')).not.toBeNull();
    modal.querySelector('.pinment-modal-btn-start').click();
    await promise;
    expect(document.querySelector('.pinment-modal-backdrop')).toBeNull();
  });

  it('trims whitespace from input value', async () => {
    const validator = vi.fn().mockReturnValue({ v: 1 });
    const { modal, promise } = createWelcomeModal(validator);
    document.body.appendChild(modal);
    modal.querySelector('.pinment-modal-input').value = '  https://example.com/#data=abc  ';
    modal.querySelector('.pinment-modal-btn-primary').click();
    const result = await promise;
    expect(result).toBe('https://example.com/#data=abc');
  });
});

describe('createDocsSiteModal', () => {
  it('creates a backdrop with modal content', () => {
    const { modal } = createDocsSiteModal();
    expect(modal.classList.contains('pinment-modal-backdrop')).toBe(true);
    expect(modal.querySelector('.pinment-modal')).not.toBeNull();
  });

  it('contains instructions about using bookmarks bar', () => {
    const { modal } = createDocsSiteModal();
    const notice = modal.querySelector('.pinment-modal-notice');
    expect(notice).not.toBeNull();
    expect(notice.textContent).toContain('documentation');
    const steps = modal.querySelector('.pinment-modal-steps');
    expect(steps).not.toBeNull();
    expect(steps.children.length).toBe(3);
  });

  it('resolves with false when dismiss is clicked', async () => {
    const { modal, promise } = createDocsSiteModal();
    document.body.appendChild(modal);
    modal.querySelector('.pinment-modal-btn-secondary').click();
    const result = await promise;
    expect(result).toBe(false);
  });

  it('resolves with false when close is clicked', async () => {
    const { modal, promise } = createDocsSiteModal();
    document.body.appendChild(modal);
    modal.querySelector('.pinment-modal-close').click();
    const result = await promise;
    expect(result).toBe(false);
  });
});

describe('createWelcomeModal import', () => {
  it('contains an import button', () => {
    const { modal } = createWelcomeModal();
    const buttons = modal.querySelectorAll('.pinment-modal-btn-secondary');
    const importBtn = Array.from(buttons).find(b => b.textContent.includes('JSON'));
    expect(importBtn).not.toBeNull();
  });

  it('contains an import label', () => {
    const { modal } = createWelcomeModal();
    const labels = modal.querySelectorAll('.pinment-modal-label');
    const importLabel = Array.from(labels).find(l => l.textContent.includes('Import'));
    expect(importLabel).not.toBeNull();
  });
});

describe('createWelcomeModal layout', () => {
  it('has pencil SVG in start button', () => {
    const { modal } = createWelcomeModal();
    const startBtn = modal.querySelector('.pinment-modal-btn-start');
    expect(startBtn).not.toBeNull();
    const svg = startBtn.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('start button appears before divider in DOM order', () => {
    const { modal } = createWelcomeModal();
    const body = modal.querySelector('.pinment-modal-body');
    const children = Array.from(body.children);
    const startIdx = children.findIndex(el => el.classList.contains('pinment-modal-btn-start'));
    const dividerIdx = children.findIndex(el => el.classList.contains('pinment-modal-divider'));
    expect(startIdx).toBeGreaterThan(-1);
    expect(dividerIdx).toBeGreaterThan(-1);
    expect(startIdx).toBeLessThan(dividerIdx);
  });
});

describe('createMinimizedButton', () => {
  it('renders with correct class', () => {
    const btn = createMinimizedButton(() => {});
    expect(btn.classList.contains('pinment-minimized-btn')).toBe(true);
  });

  it('fires callback on click', () => {
    const cb = vi.fn();
    const btn = createMinimizedButton(cb);
    btn.click();
    expect(cb).toHaveBeenCalledOnce();
  });

  it('contains Pinment text and SVG', () => {
    const btn = createMinimizedButton(() => {});
    expect(btn.textContent).toContain('Pinment');
    expect(btn.querySelector('svg')).not.toBeNull();
  });
});

describe('createExitConfirmModal', () => {
  it('renders 3 action buttons', () => {
    const { modal } = createExitConfirmModal({
      onCopyAndExit: vi.fn(),
      onExitWithout: vi.fn(),
      onCancel: vi.fn(),
    });
    const buttons = modal.querySelectorAll('.pinment-exit-actions .pinment-modal-btn');
    expect(buttons.length).toBe(3);
  });

  it('fires onCopyAndExit when copy button is clicked', () => {
    const onCopyAndExit = vi.fn();
    const { modal } = createExitConfirmModal({
      onCopyAndExit,
      onExitWithout: vi.fn(),
      onCancel: vi.fn(),
    });
    document.body.appendChild(modal);
    const btn = modal.querySelector('.pinment-modal-btn-primary');
    btn.click();
    expect(onCopyAndExit).toHaveBeenCalledOnce();
  });

  it('fires onExitWithout when exit button is clicked', () => {
    const onExitWithout = vi.fn();
    const { modal } = createExitConfirmModal({
      onCopyAndExit: vi.fn(),
      onExitWithout,
      onCancel: vi.fn(),
    });
    document.body.appendChild(modal);
    const btn = modal.querySelector('.pinment-modal-btn-danger');
    btn.click();
    expect(onExitWithout).toHaveBeenCalledOnce();
  });

  it('fires onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    const { modal } = createExitConfirmModal({
      onCopyAndExit: vi.fn(),
      onExitWithout: vi.fn(),
      onCancel,
    });
    document.body.appendChild(modal);
    const btn = modal.querySelector('.pinment-modal-btn-secondary');
    btn.click();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('Escape key triggers cancel', () => {
    const onCancel = vi.fn();
    const { modal } = createExitConfirmModal({
      onCopyAndExit: vi.fn(),
      onExitWithout: vi.fn(),
      onCancel,
    });
    document.body.appendChild(modal);
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    modal.dispatchEvent(event);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows warning message about unsaved annotations', () => {
    const { modal } = createExitConfirmModal({
      onCopyAndExit: vi.fn(),
      onExitWithout: vi.fn(),
      onCancel: vi.fn(),
    });
    const notice = modal.querySelector('.pinment-modal-notice');
    expect(notice.textContent).toContain('not saved');
  });
});

describe('filterAndSortPins', () => {
  const ALL_FILTERS = { category: 'all', status: 'all', author: 'all', sort: 'id' };
  const pins = [
    { id: 1, author: 'FL', text: 'a', c: 'text' },
    { id: 2, author: 'KH', text: 'b', c: 'layout', resolved: true },
    { id: 3, author: 'FL', text: 'c', c: 'question' },
    { id: 4, author: 'KH', text: 'd' },
    { id: 5, author: '', text: 'e', c: 'missing', resolved: true },
  ];

  it('returns all pins when all filters are "all" and sort is "id"', () => {
    const result = filterAndSortPins(pins, ALL_FILTERS);
    expect(result.map(p => p.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it('filters by category "text"', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, category: 'text' });
    expect(result.map(p => p.id)).toEqual([1]);
  });

  it('filters by category "none" for uncategorized pins', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, category: 'none' });
    expect(result.map(p => p.id)).toEqual([4]);
  });

  it('filters by status "open"', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, status: 'open' });
    expect(result.map(p => p.id)).toEqual([1, 3, 4]);
  });

  it('filters by status "resolved"', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, status: 'resolved' });
    expect(result.map(p => p.id)).toEqual([2, 5]);
  });

  it('filters by author', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, author: 'KH' });
    expect(result.map(p => p.id)).toEqual([2, 4]);
  });

  it('combines category and status filters', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, category: 'layout', status: 'resolved' });
    expect(result.map(p => p.id)).toEqual([2]);
  });

  it('combines category and author filters', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, category: 'question', author: 'FL' });
    expect(result.map(p => p.id)).toEqual([3]);
  });

  it('sorts by category', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, sort: 'category' });
    expect(result.map(p => p.id)).toEqual([1, 2, 5, 3, 4]);
  });

  it('sorts by status (open first, then resolved)', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, sort: 'status' });
    expect(result.map(p => p.id)).toEqual([1, 3, 4, 2, 5]);
  });

  it('returns empty array when no pins match', () => {
    const result = filterAndSortPins(pins, { ...ALL_FILTERS, category: 'text', status: 'resolved' });
    expect(result).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const copy = [...pins];
    filterAndSortPins(pins, { ...ALL_FILTERS, sort: 'category' });
    expect(pins).toEqual(copy);
  });
});

describe('createPanel with filters', () => {
  const filters = { category: 'all', status: 'all', author: 'all', sort: 'id' };
  const pins = [
    { id: 1, author: 'FL', text: 'a', c: 'text' },
    { id: 2, author: 'KH', text: 'b', c: 'layout', resolved: true },
    { id: 3, author: 'FL', text: 'c' },
  ];

  it('renders filter toolbar when filters are provided and pins exist', () => {
    const panel = createPanel(pins, { filters });
    expect(panel.querySelector('.pinment-filter-toolbar')).not.toBeNull();
    expect(panel.querySelectorAll('.pinment-filter-select').length).toBe(4);
  });

  it('does not render filter toolbar when filters is null', () => {
    const panel = createPanel(pins);
    expect(panel.querySelector('.pinment-filter-toolbar')).toBeNull();
  });

  it('does not render filter toolbar when no pins exist', () => {
    const panel = createPanel([], { filters });
    expect(panel.querySelector('.pinment-filter-toolbar')).toBeNull();
  });

  it('renders only matching comment items when category filter is active', () => {
    const panel = createPanel(pins, { filters: { ...filters, category: 'text' } });
    const items = panel.querySelectorAll('.pinment-comment');
    expect(items.length).toBe(1);
    expect(items[0].dataset.pinmentId).toBe('1');
  });

  it('renders filter count when filtering reduces visible pins', () => {
    const panel = createPanel(pins, { filters: { ...filters, status: 'resolved' } });
    const count = panel.querySelector('.pinment-filter-count');
    expect(count).not.toBeNull();
    expect(count.textContent).toContain('1 of 3');
  });

  it('does not render filter count when all pins are shown', () => {
    const panel = createPanel(pins, { filters });
    expect(panel.querySelector('.pinment-filter-count')).toBeNull();
  });

  it('invokes onFilterChange with updated filters when a select changes', () => {
    const onFilterChange = vi.fn();
    const panel = createPanel(pins, { filters, onFilterChange });
    const selects = panel.querySelectorAll('.pinment-filter-select');
    // Change the status select (second one)
    selects[1].value = 'resolved';
    selects[1].dispatchEvent(new Event('change'));
    expect(onFilterChange).toHaveBeenCalledWith({ ...filters, status: 'resolved' });
  });

  it('author dropdown contains unique authors from all pins', () => {
    const panel = createPanel(pins, { filters });
    const authorSelect = panel.querySelectorAll('.pinment-filter-select')[2];
    const options = Array.from(authorSelect.options).map(o => o.value);
    expect(options).toEqual(['all', 'FL', 'KH']);
  });

  it('attaches _visiblePinIds with correct filtered ids', () => {
    const panel = createPanel(pins, { filters: { ...filters, category: 'layout' } });
    expect(panel._visiblePinIds).toBeInstanceOf(Set);
    expect([...panel._visiblePinIds]).toEqual([2]);
  });

  it('attaches _visiblePinIds with all ids when no filters', () => {
    const panel = createPanel(pins);
    expect(panel._visiblePinIds).toBeInstanceOf(Set);
    expect([...panel._visiblePinIds]).toEqual([1, 2, 3]);
  });
});
