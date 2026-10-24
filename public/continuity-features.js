/**
 * OneGlass — Continuity Features Module (Linear Design System Edition)
 * Standalone browser ES module with zero external dependencies.
 *
 * Implements:
 *  1. Universal Clipboard Sync (`beamClipboardText` & `handleContinuityMessage`)
 *  2. Multi-Strip Alignment Presets (`applyStripPreset`)
 *  3. Chunked Upload with Live Progress (`uploadFileWithProgress`)
 *  4. Transfer History Drawer (`toggleHistoryDrawer`)
 *
 * Design Engineering (Linear):
 *  - Zero emojis anywhere; all icons are crisp inline 14x14 1.5px stroke SVGs
 *  - Surfaces: #0b0c0e / rgba(14, 15, 18, 0.92) with backdrop-filter: blur(20px)
 *  - Hairline borders: 1px solid rgba(255, 255, 255, 0.08)
 *  - Elevation: inset 0 1px 0 rgba(255, 255, 255, 0.09), 0 20px 50px rgba(0, 0, 0, 0.7)
 *  - Typography: 12px/13px, -0.01em tracking, tabular-nums for bytes/percentages/timestamps
 *  - Motion: exclusively transform & opacity with cubic-bezier(0.32, 0.72, 0, 1)
 */

const CONTINUITY_STYLE_ID = 'oneglass-continuity-features-styles';
const CLIPBOARD_BANNER_ID = 'continuity-clipboard-banner';
const HISTORY_DRAWER_ID = 'continuity-history-drawer';
const HISTORY_BACKDROP_ID = 'continuity-history-backdrop';

const ICONS = {
  clipboard: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="1.75" width="5" height="2" rx="0.75"/><path d="M4.5 2.75H3.25A1.25 1.25 0 0 0 2 4v7.5a1.25 1.25 0 0 0 1.25 1.25h7.5A1.25 1.25 0 0 0 12 11.5V4a1.25 1.25 0 0 0-1.25-1.25H9.5"/></svg>`,
  copy: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.75" y="4.75" width="7" height="7" rx="1.25"/><path d="M9.25 4.75V3A1.25 1.25 0 0 0 8 1.75H3A1.25 1.25 0 0 0 1.75 3v5A1.25 1.25 0 0 0 3 9.25h1.75"/></svg>`,
  spawn: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="2"/><path d="M7 4.75v4.5M4.75 7h4.5"/></svg>`,
  close: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7"/></svg>`,
  history: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="5.25"/><path d="M7 4.25V7l2 1.25"/></svg>`,
  empty: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.5" width="10.5" height="9" rx="1.75"/><path d="M1.75 8h3l1 1.5h2.5l1-1.5h3"/></svg>`,
  open: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.25 9.75l5.5-5.5M5.25 4.25h4.5v4.5"/></svg>`,
  download: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2.25v6.5M4.5 6.5L7 9l2.5-2.5M2.5 11.5h9"/></svg>`,
  respawn: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 7a4.75 4.75 0 0 1 8.1-3.35L11.75 5M11.75 2.5V5h-2.5M11.75 7a4.75 4.75 0 0 1-8.1 3.35L2.25 9M2.25 11.5V9h2.5"/></svg>`,
  file: `<svg class="og-svg-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.25 1.75H3.75A1.25 1.25 0 0 0 2.5 3v8a1.25 1.25 0 0 0 1.25 1.25h6.5A1.25 1.25 0 0 0 11.5 11V5L8.25 1.75Z"/><path d="M8 1.75V5h3.5"/></svg>`,
};

let activeContinuityController = null;

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return 'Live Surface';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatRelativeTime(ts) {
  if (!ts) return 'Just now';
  const diffSec = Math.max(0, Math.round((Date.now() - Number(ts)) / 1000));
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const d = new Date(Number(ts));
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function injectContinuityStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CONTINUITY_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = CONTINUITY_STYLE_ID;
  style.textContent = `
    .og-svg-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
    }

    .og-tabular {
      font-variant-numeric: tabular-nums;
    }

    /* Universal Clipboard Floating Banner — Linear Surface */
    #${CLIPBOARD_BANNER_ID} {
      position: fixed;
      right: 20px;
      bottom: max(84px, calc(env(safe-area-inset-bottom, 18px) + 68px));
      width: min(368px, calc(100vw - 32px));
      z-index: 62;
      background: rgba(14, 15, 18, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 13px 14px;
      color: #f2f3f5;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      font-size: 12px;
      letter-spacing: -0.01em;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        0 20px 50px rgba(0, 0, 0, 0.7);
      pointer-events: none;
      opacity: 0;
      transform: translate3d(0, 18px, 0) scale(0.97);
      transition:
        transform 320ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity 320ms cubic-bezier(0.32, 0.72, 0, 1);
      will-change: transform, opacity;
    }

    #${CLIPBOARD_BANNER_ID}.is-visible {
      pointer-events: auto;
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }

    .cc-banner-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
    }

    .cc-banner-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: #f2f3f5;
      min-width: 0;
    }

    .cc-banner-badge-icon {
      color: #5e6ad2;
      display: inline-flex;
      align-items: center;
    }

    .cc-banner-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
      flex-shrink: 0;
    }

    .cc-banner-time {
      color: #8a8f98;
      font-size: 12px;
      letter-spacing: -0.01em;
      font-variant-numeric: tabular-nums;
    }

    .cc-banner-close {
      appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: #0b0c0e;
      color: #8a8f98;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      padding: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition:
        transform 180ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity 180ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .cc-banner-close:hover {
      color: #f2f3f5;
      opacity: 0.96;
      transform: scale(1.04);
    }

    .cc-banner-close:active {
      transform: scale(0.95);
    }

    .cc-banner-snippet {
      font: 12px/1.5 "JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
      letter-spacing: -0.01em;
      color: #f2f3f5;
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 9px 11px;
      max-height: 82px;
      overflow: hidden;
      word-break: break-word;
      white-space: pre-wrap;
      margin-bottom: 10px;
      user-select: text;
      -webkit-user-select: text;
    }

    .cc-banner-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cc-action-btn {
      flex: 1;
      appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: #0b0c0e;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.09);
      color: #f2f3f5;
      font: 500 12px/1.2 "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      letter-spacing: -0.01em;
      padding: 7px 10px;
      border-radius: 7px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition:
        transform 180ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity 180ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .cc-action-btn.primary {
      /* #5e6ad2 gave 4.2:1 with this text colour (below WCAG AA 4.5:1); #4f5bc4 gives ~5.2:1. */
      background: #4f5bc4;
      border-color: rgba(255, 255, 255, 0.14);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
      color: #f2f3f5;
    }

    .cc-action-btn:hover {
      transform: translate3d(0, -1px, 0);
      opacity: 0.95;
    }

    .cc-action-btn:active {
      transform: scale(0.97);
    }

    /* Transfer History Slide-Over Backdrop & Drawer — Linear Surface */
    #${HISTORY_BACKDROP_ID} {
      position: fixed;
      inset: 0;
      z-index: 60;
      background: rgba(5, 6, 8, 0.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      pointer-events: none;
      opacity: 0;
      transition: opacity 340ms cubic-bezier(0.32, 0.72, 0, 1);
      will-change: opacity;
    }

    #${HISTORY_BACKDROP_ID}.is-open {
      pointer-events: auto;
      opacity: 1;
    }

    #${HISTORY_DRAWER_ID} {
      position: fixed;
      top: max(12px, env(safe-area-inset-top, 12px));
      right: 12px;
      bottom: max(12px, env(safe-area-inset-bottom, 12px));
      width: min(388px, calc(100vw - 24px));
      z-index: 61;
      display: flex;
      flex-direction: column;
      background: rgba(14, 15, 18, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        0 20px 50px rgba(0, 0, 0, 0.7);
      color: #f2f3f5;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      font-size: 12px;
      letter-spacing: -0.01em;
      pointer-events: none;
      opacity: 0;
      transform: translate3d(calc(100% + 24px), 0, 0);
      transition:
        transform 380ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity 380ms cubic-bezier(0.32, 0.72, 0, 1);
      will-change: transform, opacity;
      overflow: hidden;
    }

    #${HISTORY_DRAWER_ID}.is-open {
      pointer-events: auto;
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .ch-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 14px 16px 12px;
      background: #0b0c0e;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .ch-drawer-title {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #f2f3f5;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .ch-drawer-title-icon {
      color: #5e6ad2;
      display: inline-flex;
      align-items: center;
    }

    .ch-drawer-count {
      font-size: 12px;
      font-weight: 500;
      letter-spacing: -0.01em;
      font-variant-numeric: tabular-nums;
      padding: 1px 7px;
      border-radius: 5px;
      background: rgba(94, 106, 210, 0.16);
      border: 1px solid rgba(94, 106, 210, 0.36);
      color: #f2f3f5;
    }

    .ch-drawer-sub {
      font-size: 12px;
      letter-spacing: -0.01em;
      color: #8a8f98;
      margin-top: 3px;
    }

    .ch-drawer-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ch-empty-state {
      margin: auto 0;
      text-align: center;
      padding: 36px 20px;
      color: #8a8f98;
      font-size: 12px;
      letter-spacing: -0.01em;
      line-height: 1.5;
    }

    .ch-empty-icon {
      width: 28px;
      height: 28px;
      margin: 0 auto 10px;
      border-radius: 8px;
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.09);
      color: #8a8f98;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ch-empty-title {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: #f2f3f5;
      margin-bottom: 4px;
    }

    .ch-item-card {
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.09);
      border-radius: 9px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      transition:
        transform 200ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity 200ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .ch-item-card:hover {
      transform: translate3d(0, -1px, 0);
    }

    .ch-item-top {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ch-item-thumb {
      width: 36px;
      height: 36px;
      border-radius: 7px;
      background: rgba(94, 106, 210, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #38bdf8;
      flex-shrink: 0;
      overflow: hidden;
    }

    .ch-item-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .ch-item-info {
      flex: 1;
      min-width: 0;
    }

    .ch-item-name {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: #f2f3f5;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ch-item-meta {
      font-size: 12px;
      letter-spacing: -0.01em;
      font-variant-numeric: tabular-nums;
      color: #8a8f98;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ch-item-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ch-item-btn {
      flex: 1;
      appearance: none;
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
      color: #f2f3f5;
      font: 500 12px/1.2 "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      letter-spacing: -0.01em;
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition:
        transform 180ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity 180ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .ch-item-btn.respawn {
      background: rgba(94, 106, 210, 0.18);
      border-color: rgba(94, 106, 210, 0.42);
      color: #f2f3f5;
    }

    .ch-item-btn.respawn .og-svg-icon {
      color: #38bdf8;
    }

    .ch-item-btn:hover {
      transform: translate3d(0, -1px, 0);
      opacity: 0.94;
    }

    .ch-item-btn:active {
      transform: scale(0.97);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Standalone XHR Chunked/Streaming Upload with Live Progress (0..100%)
 * @param {File|Blob} file
 * @param {string} role
 * @param {(percent: number, loaded?: number, total?: number) => void} [onProgress]
 * @returns {Promise<any>}
 */
export function uploadFileWithProgress(file, role = 'laptop', onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided for upload'));
      return;
    }

    const params = new URLSearchParams({
      name: file.name || 'shared-file',
      mime: file.type || 'application/octet-stream',
      from: role || 'laptop',
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/upload?${params.toString()}`, true);

    if (typeof onProgress === 'function') {
      onProgress(0, 0, file.size || 0);
    }

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (typeof onProgress !== 'function') return;
        const total = event.lengthComputable && event.total > 0 ? event.total : (file.size || 1);
        const pct = Math.max(0, Math.min(100, Math.round((event.loaded / total) * 100)));
        onProgress(pct, event.loaded, total);
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (typeof onProgress === 'function') {
          const total = file.size || 0;
          onProgress(100, total, total);
        }
        try {
          const parsed = JSON.parse(xhr.responseText);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Invalid JSON from /api/upload: ${err.message}`));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during file upload'));
    };

    xhr.onabort = () => {
      reject(new Error('File upload aborted'));
    };

    xhr.send(file);
  });
}

/**
 * Top-level named export wrapper for `applyStripPreset`.
 * Delegates to the active continuity controller if initialized.
 */
export function applyStripPreset(presetName) {
  if (activeContinuityController && typeof activeContinuityController.applyStripPreset === 'function') {
    return activeContinuityController.applyStripPreset(presetName);
  }
  return [];
}

/**
 * Top-level named export wrapper for `toggleHistoryDrawer`.
 * Delegates to the active continuity controller if initialized.
 */
export function toggleHistoryDrawer(sharedItems) {
  if (activeContinuityController && typeof activeContinuityController.toggleHistoryDrawer === 'function') {
    return activeContinuityController.toggleHistoryDrawer(sharedItems);
  }
  return false;
}

/**
 * Top-level named export wrapper for `addHistoryItem`.
 * Delegates to active controller or syncs directly to window.sharedItemsHistory.
 */
export function addHistoryItem(item) {
  if (activeContinuityController && typeof activeContinuityController.addHistoryItem === 'function') {
    return activeContinuityController.addHistoryItem(item);
  }
  if (typeof window !== 'undefined' && item && typeof item === 'object') {
    if (!Array.isArray(window.sharedItemsHistory)) {
      window.sharedItemsHistory = [];
    }
    window.sharedItemsHistory.unshift(item);
  }
  return item;
}

export const applyStripPresetInstance = applyStripPreset;

if (typeof window !== 'undefined') {
  window.oneGlassContinuity = {
    toggleHistoryDrawer: (sharedItems) => toggleHistoryDrawer(sharedItems),
    addHistoryItem: (item) => addHistoryItem(item),
    applyStripPreset: (presetName) => applyStripPreset(presetName),
    applyStripPresetInstance: (presetName) => applyStripPreset(presetName),
  };
  window.oneGlassHistory = () => toggleHistoryDrawer();
}

/**
 * Initializes OneGlass Continuity features and returns controller methods.
 *
 * @param {Object} options
 * @param {() => WebSocket|null} options.getWs
 * @param {() => string} options.getRole
 * @param {() => Array<Object>} options.getPeers
 * @param {() => string|null} options.getSelfId
 * @param {(item: Object) => void} options.onSpawnCard
 * @param {(message: string) => void} options.showToast
 */
export function initContinuityFeatures({
  getWs = () => null,
  getRole = () => 'laptop',
  getPeers = () => [],
  getSelfId = () => null,
  onSpawnCard = () => {},
  showToast = () => {},
} = {}) {
  injectContinuityStyles();

  const sessionHistory = [];
  let bannerHideTimer = null;
  let clipboardCardCounter = 1;

  function recordHistoryItem(item) {
    if (!item || typeof item !== 'object') return;
    const key = item.id || item.url || `${item.name || 'item'}_${item.ts || ''}`;
    const existingIdx = sessionHistory.findIndex(
      (entry) => (entry.id && entry.id === item.id) || (entry.url && entry.url === item.url) || entry._key === key
    );
    const normalized = {
      ...item,
      _key: key,
      ts: item.ts || Date.now(),
    };
    if (existingIdx >= 0) {
      sessionHistory[existingIdx] = { ...sessionHistory[existingIdx], ...normalized };
    } else {
      sessionHistory.unshift(normalized);
    }

    // Keep window.sharedItemsHistory in sync
    if (typeof window !== 'undefined') {
      if (!Array.isArray(window.sharedItemsHistory)) {
        window.sharedItemsHistory = [];
      }
      const winIdx = window.sharedItemsHistory.findIndex(
        (entry) => entry && ((entry.id && entry.id === normalized.id) || (entry.url && entry.url === normalized.url) || entry._key === key)
      );
      if (winIdx >= 0) {
        window.sharedItemsHistory[winIdx] = { ...window.sharedItemsHistory[winIdx], ...normalized };
      } else {
        window.sharedItemsHistory.unshift(normalized);
      }
    }
  }

  // Seed initial session history from window.sharedItemsHistory if populated
  if (typeof window !== 'undefined' && Array.isArray(window.sharedItemsHistory)) {
    window.sharedItemsHistory.forEach(recordHistoryItem);
  }

  function buildClipboardCardItem(text, fromLabel = 'Clipboard') {
    const trimmed = String(text || '').trim();
    let isUrl = false;
    let hostname = '';
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        hostname = new URL(trimmed).hostname;
        isUrl = true;
      } catch {
        isUrl = false;
      }
    }
    const idx = clipboardCardCounter++;
    return {
      id: `clip_sync_${Date.now()}_${idx}`,
      name: isUrl ? hostname : `Clipboard #${idx}`,
      ext: isUrl ? 'URL' : 'CLIP',
      category: 'code',
      noteText: trimmed,
      textSnippet: trimmed,
      url: isUrl ? trimmed : undefined,
      sub: `${fromLabel} · Drag to strip`,
    };
  }

  // ==========================================================================
  // 1. Universal Clipboard Sync (`beamClipboardText` & `handleContinuityMessage`)
  // ==========================================================================
  function sendClipboardPayload(rawText) {
    const text = String(rawText ?? '');
    if (!text.trim()) {
      showToast?.('Clipboard is empty');
      return false;
    }

    const ws = getWs?.();
    const payload = {
      type: 'clipboard_sync',
      text,
      ts: Date.now(),
    };

    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(payload));
      showToast?.('Clipboard sent');
      return true;
    }

    showToast?.('Not connected to the laptop');
    return false;
  }

  function beamClipboardText(text) {
    if (typeof text === 'string' && text.length > 0) {
      return sendClipboardPayload(text);
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
      return navigator.clipboard
        .readText()
        .then((clipText) => sendClipboardPayload(clipText))
        .catch(() => {
          showToast?.('Allow clipboard access to paste');
          return false;
        });
    }
    return false;
  }

  function ensureClipboardBanner() {
    let banner = document.getElementById(CLIPBOARD_BANNER_ID);
    if (!banner) {
      banner = document.createElement('div');
      banner.id = CLIPBOARD_BANNER_ID;
      banner.setAttribute('role', 'status');
      banner.setAttribute('aria-live', 'polite');
      document.body.appendChild(banner);
    }
    return banner;
  }

  function hideClipboardBanner() {
    const banner = document.getElementById(CLIPBOARD_BANNER_ID);
    if (banner) {
      banner.classList.remove('is-visible');
    }
    if (bannerHideTimer) {
      clearTimeout(bannerHideTimer);
      bannerHideTimer = null;
    }
  }

  function renderClipboardBanner(msg) {
    if (typeof document === 'undefined') return;
    const text = String(msg?.text ?? '');
    if (!text) return;

    const banner = ensureClipboardBanner();
    const sourceLabel = msg.fromName || (msg.fromRole === 'phone' ? 'iPhone' : 'Peer Display');
    const timeLabel = formatRelativeTime(msg.ts);

    banner.innerHTML = `
      <div class="cc-banner-head">
        <span class="cc-banner-badge">
          <span class="cc-banner-dot"></span>
          <span class="cc-banner-badge-icon">${ICONS.clipboard}</span>
          <span>Clipboard from ${escapeHtml(sourceLabel)}</span>
          <span class="cc-banner-time">(${escapeHtml(timeLabel)})</span>
        </span>
        <button type="button" class="cc-banner-close" title="Dismiss" aria-label="Dismiss">${ICONS.close}</button>
      </div>
      <div class="cc-banner-snippet">${escapeHtml(text)}</div>
      <div class="cc-banner-actions">
        <button type="button" class="cc-action-btn primary" data-action="copy-system">
          ${ICONS.copy}
          <span>Copy</span>
        </button>
        <button type="button" class="cc-action-btn" data-action="spawn-card">
          ${ICONS.spawn}
          <span>Add as card</span>
        </button>
      </div>
    `;

    const closeBtn = banner.querySelector('.cc-banner-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideClipboardBanner();
      });
    }

    const copyBtn = banner.querySelector('[data-action="copy-system"]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
          }
          showToast?.('Copied');
        } catch {
          showToast?.('Text selected');
        }
      });
    }

    const spawnBtn = banner.querySelector('[data-action="spawn-card"]');
    if (spawnBtn) {
      spawnBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardItem = buildClipboardCardItem(text, `From ${sourceLabel}`);
        recordHistoryItem(cardItem);
        onSpawnCard?.(cardItem);
        showToast?.('Clipboard added as a card');
        hideClipboardBanner();
      });
    }

    requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    });

    if (bannerHideTimer) clearTimeout(bannerHideTimer);
    bannerHideTimer = setTimeout(() => {
      hideClipboardBanner();
    }, 12000);
  }

  function handleContinuityMessage(msg) {
    if (!msg || typeof msg !== 'object') return false;

    if (msg.type === 'clipboard_sync') {
      const text = String(msg.text ?? '');
      if (!text) return false;
      renderClipboardBanner(msg);
      showToast?.('Clipboard received');
      return true;
    }

    if (msg.type === 'card_flick' && msg.item) {
      recordHistoryItem(msg.item);
      if (isDrawerOpen()) {
        renderHistoryDrawerItems();
      }
      return true;
    }

    if (msg.type === 'history_sync' && Array.isArray(msg.items)) {
      msg.items.forEach(recordHistoryItem);
      if (isDrawerOpen()) {
        renderHistoryDrawerItems();
      }
      return true;
    }

    return false;
  }

  // ==========================================================================
  // 2. Multi-Strip Alignment Presets (`applyStripPreset`)
  // ==========================================================================
  function applyStripPresetInstance(presetName) {
    const allPeers = Array.isArray(getPeers?.()) ? getPeers() : [];
    const selfId = getSelfId?.();

    let phones = allPeers.filter(
      (p) => p && p.role === 'phone' && (!selfId || p.id !== selfId)
    );
    if (phones.length === 0) {
      phones = allPeers.filter((p) => p && p.role === 'phone');
    }

    const ws = getWs?.();
    const n = phones.length;

    if (n === 0) {
      showToast?.(`Layout ready. Pair a phone to use it.`);
      return [];
    }

    const surroundEdges = ['right', 'left', 'top', 'bottom'];
    const updates = [];

    phones.forEach((p, idx) => {
      let edge = 'right';
      let centerRatio = 0.5;
      let spanRatio = 0.30;

      if (presetName === 'side-by-side') {
        edge = 'right';
        if (n === 1) {
          centerRatio = 0.50;
          spanRatio = 0.30;
        } else if (n === 2) {
          centerRatio = idx === 0 ? 0.32 : 0.68;
          spanRatio = 0.30;
        } else {
          spanRatio = Number(Math.max(0.16, Math.min(0.30, 0.76 / n)).toFixed(2));
          const start = 0.18;
          const end = 0.82;
          centerRatio = Number((start + (idx / (n - 1)) * (end - start)).toFixed(2));
        }
      } else if (presetName === 'overlap-all') {
        edge = 'right';
        centerRatio = 0.50;
        spanRatio = 0.46;
      } else if (presetName === 'surround') {
        edge = surroundEdges[idx % surroundEdges.length];
        centerRatio = 0.50;
        spanRatio = 0.32;
      } else if (presetName === 'top-notch') {
        edge = 'top';
        centerRatio = 0.50;
        spanRatio = 0.32;
      } else {
        edge = p.edge || 'right';
        centerRatio = p.centerRatio ?? 0.50;
        spanRatio = p.spanRatio ?? 0.30;
      }

      p.edge = edge;
      p.centerRatio = centerRatio;
      p.spanRatio = spanRatio;

      const updateMsg = {
        type: 'update_strip',
        peerId: p.id,
        edge,
        centerRatio,
        spanRatio,
      };
      updates.push(updateMsg);

      if (ws && ws.readyState === 1 && p.id && p.id !== '__preview__') {
        ws.send(JSON.stringify(updateMsg));
      }
    });

    const presetLabels = {
      'side-by-side': 'Side-by-Side Right Bezel',
      'overlap-all': 'Overlap All (Broadcast Flick)',
      'surround': 'Surround 4-Edge Array',
      'top-notch': 'Top-Notch Dock',
    };
    showToast?.(`Layout: ${presetLabels[presetName] || presetName}`);
    return updates;
  }

  // ==========================================================================
  // 3. Chunked Upload with Live Progress (`uploadFileWithProgress`)
  // ==========================================================================
  function uploadWithRoleProgress(file, roleOverride, onProgress) {
    const effectiveRole =
      typeof roleOverride === 'string' && roleOverride
        ? roleOverride
        : getRole?.() || 'laptop';
    const progressCb =
      typeof roleOverride === 'function' ? roleOverride : onProgress;

    return uploadFileWithProgress(file, effectiveRole, progressCb).then((uploaded) => {
      if (uploaded && typeof uploaded === 'object') {
        recordHistoryItem(uploaded);
        if (isDrawerOpen()) {
          renderHistoryDrawerItems();
        }
      }
      return uploaded;
    });
  }

  // ==========================================================================
  // 4. Transfer History Drawer (`toggleHistoryDrawer`)
  // ==========================================================================
  function ensureHistoryDrawerDOM() {
    if (typeof document === 'undefined') return { drawer: null, backdrop: null };

    let backdrop = document.getElementById(HISTORY_BACKDROP_ID);
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = HISTORY_BACKDROP_ID;
      backdrop.addEventListener('click', () => {
        setDrawerOpen(false);
      });
      document.body.appendChild(backdrop);
    }

    let drawer = document.getElementById(HISTORY_DRAWER_ID);
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = HISTORY_DRAWER_ID;
      drawer.setAttribute('aria-label', 'Transfer History');
      drawer.innerHTML = `
        <div class="ch-drawer-header">
          <div>
            <div class="ch-drawer-title">
              <span class="ch-drawer-title-icon">${ICONS.history}</span>
              <span>Transfer History</span>
              <span class="ch-drawer-count og-tabular" data-role="count">0</span>
            </div>
            <div class="ch-drawer-sub">1-click Open, Save (?dl=1), or Re-Spawn onto Canvas</div>
          </div>
          <button type="button" class="cc-banner-close" data-action="close-drawer" title="Close" aria-label="Close">${ICONS.close}</button>
        </div>
        <div class="ch-drawer-list" data-role="list"></div>
      `;

      const closeBtn = drawer.querySelector('[data-action="close-drawer"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          setDrawerOpen(false);
        });
      }

      document.body.appendChild(drawer);
    }

    return { drawer, backdrop };
  }

  function isDrawerOpen() {
    const drawer = document.getElementById(HISTORY_DRAWER_ID);
    return Boolean(drawer && drawer.classList.contains('is-open'));
  }

  function setDrawerOpen(open) {
    const { drawer, backdrop } = ensureHistoryDrawerDOM();
    if (!drawer || !backdrop) return false;
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    return open;
  }

  function renderHistoryDrawerItems(itemsOverride) {
    const { drawer } = ensureHistoryDrawerDOM();
    if (!drawer) return;

    if (Array.isArray(itemsOverride)) {
      itemsOverride.forEach(recordHistoryItem);
    }

    const items =
      Array.isArray(itemsOverride) && itemsOverride.length > 0 && sessionHistory.length === 0
        ? itemsOverride
        : sessionHistory;

    const countEl = drawer.querySelector('[data-role="count"]');
    const listEl = drawer.querySelector('[data-role="list"]');
    if (countEl) countEl.textContent = String(items.length);
    if (!listEl) return;

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="ch-empty-state">
          <div class="ch-empty-icon">${ICONS.empty}</div>
          <div class="ch-empty-title">No Transfers Yet</div>
          <div>Drop a file, paste a snippet, or flick a card across the bezel to populate your session history.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items
      .map((item, idx) => {
        const name = item.name || 'Shared Item';
        const ext = (item.ext || item.category || 'FILE').toString().toUpperCase().slice(0, 6);
        const sizeLabel = formatBytes(item.size);
        const fromLabel = item.from ? `From ${item.from}` : item.sub || 'Session item';
        const timeLabel = formatRelativeTime(item.ts);
        const openUrl = item.url ? escapeHtml(item.url) : '';
        const saveUrl = item.url
          ? escapeHtml(item.url.includes('?') ? `${item.url}&dl=1` : `${item.url}?dl=1`)
          : '';
        const isImage = item.category === 'image' || Boolean(item.previewUrl);
        const thumbHtml =
          isImage && (item.previewUrl || item.url)
            ? `<img src="${escapeHtml(item.previewUrl || item.url)}" alt="">`
            : escapeHtml(ext);

        return `
          <div class="ch-item-card" data-history-index="${idx}">
            <div class="ch-item-top">
              <div class="ch-item-thumb">${thumbHtml}</div>
              <div class="ch-item-info">
                <div class="ch-item-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
                <div class="ch-item-meta og-tabular">${escapeHtml(sizeLabel)} · ${escapeHtml(fromLabel)} · ${escapeHtml(timeLabel)}</div>
              </div>
            </div>
            <div class="ch-item-actions">
              ${
                openUrl
                  ? `<a class="ch-item-btn" href="${openUrl}" target="_blank" rel="noopener">${ICONS.open}<span>Open</span></a>`
                  : ''
              }
              ${
                saveUrl
                  ? `<a class="ch-item-btn" href="${saveUrl}" download="${escapeHtml(name)}">${ICONS.download}<span>Save</span></a>`
                  : ''
              }
              <button type="button" class="ch-item-btn respawn" data-action="respawn" data-index="${idx}">
                ${ICONS.respawn}
                <span>Re-Spawn</span>
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-action="respawn"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.getAttribute('data-index'));
        const target = items[idx];
        if (!target) return;
        const respawnedItem = {
          ...target,
          id:
            target.category === 'canvas'
              ? target.id
              : `respawn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        };
        onSpawnCard?.(respawnedItem);
        showToast?.(`Re-Spawned "${target.name || 'Item'}" onto Canvas`);
      });
    });
  }

  function toggleHistoryDrawerInstance(sharedItems) {
    if (Array.isArray(sharedItems)) {
      sharedItems.forEach(recordHistoryItem);
    }
    const nextState = !isDrawerOpen();
    renderHistoryDrawerItems(sharedItems);
    setDrawerOpen(nextState);
    return nextState;
  }

  function addHistoryItemInstance(item) {
    recordHistoryItem(item);
    if (isDrawerOpen()) {
      renderHistoryDrawerItems();
    }
    return item;
  }

  const controller = {
    handleContinuityMessage,
    beamClipboardText,
    applyStripPreset: applyStripPresetInstance,
    applyStripPresetInstance,
    uploadFileWithProgress: uploadWithRoleProgress,
    toggleHistoryDrawer: toggleHistoryDrawerInstance,
    addHistoryItem: addHistoryItemInstance,
  };

  activeContinuityController = controller;
  if (typeof window !== 'undefined') {
    window.oneGlassContinuity = {
      toggleHistoryDrawer: toggleHistoryDrawerInstance,
      addHistoryItem: addHistoryItemInstance,
      applyStripPreset: applyStripPresetInstance,
      applyStripPresetInstance,
      uploadFileWithProgress: uploadWithRoleProgress,
      beamClipboardText,
      handleContinuityMessage,
    };
    window.oneGlassHistory = () => toggleHistoryDrawerInstance();
  }

  return controller;
}

export default initContinuityFeatures;
