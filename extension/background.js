/**
 * Background Service Worker for Pinment Manifest V3 Extension.
 *
 * Listens for extension action button clicks on the toolbar and injects
 * the Pinment bundle into the active tab via chrome.scripting.executeScript.
 * This circumvents site Content-Security-Policy (CSP) headers that block
 * bookmarklet external script injection.
 */
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) return;

  // Do not attempt to inject into chrome://, edge://, about:, or chrome-extension://
  if (/^(chrome|edge|about|chrome-extension):/.test(tab.url)) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['pinment-bookmarklet.js'],
    });
  } catch (err) {
    console.error('Failed to inject Pinment:', err);
  }
});
