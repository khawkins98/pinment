import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDraftKey, saveDraft, loadDraft, clearDraft } from '../src/bookmarklet/draft.js';
import { createWelcomeModal } from '../src/bookmarklet/ui.js';

describe('draft management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('generates consistent scoped key from URL', () => {
    const key = getDraftKey('https://example.com/staging/page?v=1#pinment=123');
    expect(key).toBe('pinment-draft:https://example.com/staging/page');
  });

  it('saves and loads draft from localStorage', () => {
    const pins = [{ id: 1, text: 'Hello', fx: 100, fy: 200 }];
    const url = 'https://example.com/my-page';
    saveDraft(pins, 2, url);

    const loaded = loadDraft(url);
    expect(loaded).not.toBeNull();
    expect(loaded.pins).toEqual(pins);
    expect(loaded.nextId).toBe(2);
    expect(loaded.timestamp).toBeGreaterThan(0);
  });

  it('clears draft from localStorage', () => {
    const pins = [{ id: 1, text: 'Hello', fx: 100, fy: 200 }];
    const url = 'https://example.com/my-page';
    saveDraft(pins, 2, url);
    expect(loadDraft(url)).not.toBeNull();

    clearDraft(url);
    expect(loadDraft(url)).toBeNull();
  });

  it('clears draft when saving empty pins list', () => {
    const url = 'https://example.com/my-page';
    saveDraft([{ id: 1, text: 'Test', fx: 10, fy: 20 }], 2, url);
    expect(loadDraft(url)).not.toBeNull();

    saveDraft([], 1, url);
    expect(loadDraft(url)).toBeNull();
  });

  it('ignores drafts older than 7 days', () => {
    const pins = [{ id: 1, text: 'Old', fx: 10, fy: 20 }];
    const url = 'https://example.com/old-page';
    const key = getDraftKey(url);
    const oldTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
    localStorage.setItem(key, JSON.stringify({ timestamp: oldTimestamp, nextId: 2, pins }));

    expect(loadDraft(url)).toBeNull();
  });
});

describe('createWelcomeModal with draft', () => {
  it('renders draft resume button when draft exists', () => {
    const draft = {
      pins: [{ id: 1, text: 'Draft pin', fx: 10, fy: 20 }],
      nextId: 2,
    };
    const { modal } = createWelcomeModal(null, null, draft);
    const draftBtn = modal.querySelector('.pinment-modal-btn-draft');
    expect(draftBtn).not.toBeNull();
    expect(draftBtn.textContent).toContain('Resume unsaved draft (1 pin)');
  });

  it('resolves with draft state when resume draft button is clicked', async () => {
    const draft = {
      pins: [{ id: 1, text: 'Draft pin', fx: 10, fy: 20 }],
      nextId: 2,
    };
    const { modal, promise } = createWelcomeModal(null, null, draft);
    const draftBtn = modal.querySelector('.pinment-modal-btn-draft');
    draftBtn.click();

    const result = await promise;
    expect(result).toEqual({ isDraft: true, pins: draft.pins, nextId: 2 });
  });

  it('does not render draft button when draft is null or empty', () => {
    const { modal } = createWelcomeModal(null, null, null);
    const draftBtn = modal.querySelector('.pinment-modal-btn-draft');
    expect(draftBtn).toBeNull();
  });
});
