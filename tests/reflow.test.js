import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { repositionPin, calculatePinPosition } from '../src/bookmarklet/pins.js';

describe('reflow and repositioning', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="target-el" style="position: absolute; top: 100px; left: 100px; width: 200px; height: 100px;">
        Target element
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('repositions pin when element bounds shift', () => {
    const target = document.getElementById('target-el');
    target.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
    });

    const pin = {
      id: 1,
      s: '#target-el',
      ox: 0.5,
      oy: 0.5,
      fx: 200,
      fy: 150,
    };

    const pinEl = document.createElement('div');
    pinEl.className = 'pinment-pin';
    document.body.appendChild(pinEl);

    repositionPin(pinEl, pin);
    expect(pinEl.style.left).toBe('200px');
    expect(pinEl.style.top).toBe('150px');

    // Simulate element shifting after a dynamic layout reflow
    target.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 300,
      top: 250,
      width: 200,
      height: 100,
    });

    repositionPin(pinEl, pin);
    expect(pinEl.style.left).toBe('400px');
    expect(pinEl.style.top).toBe('300px');
  });

  it('handles ResizeObserver observation on body', () => {
    let observedElement = null;
    let disconnected = false;

    class MockResizeObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe(el) {
        observedElement = el;
      }
      disconnect() {
        disconnected = true;
      }
    }

    const observer = new MockResizeObserver(() => {});
    observer.observe(document.body);
    expect(observedElement).toBe(document.body);

    observer.disconnect();
    expect(disconnected).toBe(true);
  });
});
