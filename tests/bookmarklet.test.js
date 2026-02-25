import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinElement, createPanel, calculatePinPosition, restorePins, buildStyles, createWelcomeModal } from '../src/bookmarklet/ui.js';
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
  it('returns x as ratio of viewport width', () => {
    const pos = calculatePinPosition(720, 500, 1440);
    expect(pos.x).toBeCloseTo(0.5);
  });

  it('returns y as absolute pixel offset', () => {
    const pos = calculatePinPosition(360, 832, 1440);
    expect(pos.y).toBe(832);
  });

  it('clamps x to 0-1 range', () => {
    const pos = calculatePinPosition(-10, 100, 1440);
    expect(pos.x).toBe(0);
    const pos2 = calculatePinPosition(1500, 100, 1440);
    expect(pos2.x).toBe(1);
  });

  it('returns x=0 for zero viewport width', () => {
    const pos = calculatePinPosition(100, 100, 0);
    expect(pos.x).toBe(0);
  });
});

describe('createPinElement', () => {
  it('creates a positioned element with pin number', () => {
    const pin = { id: 1, x: 0.5, y: 200, author: 'FL', text: 'Test' };
    const el = createPinElement(pin, 1440);
    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('pinment-pin')).toBe(true);
    expect(el.textContent).toContain('1');
  });

  it('positions pin using absolute positioning', () => {
    const pin = { id: 3, x: 0.25, y: 500, author: '', text: '' };
    const el = createPinElement(pin, 1440);
    expect(el.style.position).toBe('absolute');
    // x: 0.25 * 1440 = 360px
    expect(el.style.left).toBe('360px');
    expect(el.style.top).toBe('500px');
  });

  it('uses the pin id as visible number', () => {
    const pin = { id: 7, x: 0.5, y: 100, author: '', text: '' };
    const el = createPinElement(pin, 1440);
    expect(el.textContent).toContain('7');
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
  });

  it('shows hint text in editable mode', () => {
    const panel = createPanel([], { editable: true });
    const hint = panel.querySelector('.pinment-panel-hint');
    expect(hint).not.toBeNull();
    expect(hint.textContent).toContain('Click anywhere');
  });

  it('does not show hint in read-only mode', () => {
    const panel = createPanel([]);
    const hint = panel.querySelector('.pinment-panel-hint');
    expect(hint).toBeNull();
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

  it('invokes onClose callback when close button is clicked', () => {
    const onClose = vi.fn();
    const panel = createPanel([], { onClose });
    panel.querySelector('.pinment-btn-close').click();
    expect(onClose).toHaveBeenCalledOnce();
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
});

describe('restorePins', () => {
  it('creates pin elements from state data', () => {
    const container = document.createElement('div');
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 200, author: 'FL', text: 'Test' },
      { id: 2, x: 0.3, y: 400, author: 'KH', text: 'Another' },
    ]);
    const pins = restorePins(state, container, 1440);
    expect(pins.length).toBe(2);
    expect(container.querySelectorAll('.pinment-pin').length).toBe(2);
  });

  it('scales x positions when viewport differs', () => {
    const container = document.createElement('div');
    const state = createState('https://example.com', 1440, [
      { id: 1, x: 0.5, y: 200, author: '', text: '' },
    ]);
    // Restoring on an 800px viewport — x ratio stays the same, pixel position differs
    const pins = restorePins(state, container, 800);
    const pinEl = container.querySelector('.pinment-pin');
    // 0.5 * 800 = 400px
    expect(pinEl.style.left).toBe('400px');
  });
});

describe('createWelcomeModal', () => {
  it('creates a backdrop with modal content', () => {
    const { modal } = createWelcomeModal();
    expect(modal.classList.contains('pinment-modal-backdrop')).toBe(true);
    expect(modal.querySelector('.pinment-modal')).not.toBeNull();
  });

  it('contains title, description, input, and two action buttons', () => {
    const { modal } = createWelcomeModal();
    expect(modal.querySelector('.pinment-modal-title').textContent).toBe('Pinment');
    expect(modal.querySelector('.pinment-modal-desc')).not.toBeNull();
    expect(modal.querySelector('.pinment-modal-input')).not.toBeNull();
    expect(modal.querySelector('.pinment-modal-btn-primary').textContent).toBe('Load annotations');
    expect(modal.querySelector('.pinment-modal-btn-secondary').textContent).toBe('Start fresh');
  });

  it('resolves with null when "Start fresh" is clicked', async () => {
    const { modal, promise } = createWelcomeModal();
    document.body.appendChild(modal);
    modal.querySelector('.pinment-modal-btn-secondary').click();
    const result = await promise;
    expect(result).toBeNull();
  });

  it('resolves with null when "Load annotations" is clicked with empty input', async () => {
    const { modal, promise } = createWelcomeModal();
    document.body.appendChild(modal);
    modal.querySelector('.pinment-modal-btn-primary').click();
    const result = await promise;
    expect(result).toBeNull();
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
    modal.querySelector('.pinment-modal-btn-secondary').click();
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
