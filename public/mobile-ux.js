// ============================================================================
// OneGlass — Linear-Grade Mobile UX, 120Hz Precision Trackpad & Remote Laser
// Standalone ES Module (Zero External Dependencies, Zero Emojis)
// ============================================================================

const ICONS = {
  camera: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4.5h2.2l1.1-1.5h4.4l1.1 1.5H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z"/><circle cx="7.5" cy="8.25" r="2.25"/></svg>`,
  files: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.25" width="9.5" height="8.5" rx="1.5"/><path d="M4.25 12.75h8a1.5 1.5 0 0 0 1.5-1.5v-6.5"/><circle cx="4.75" cy="5.25" r="1"/><path d="m2.25 9.5 2.6-2.4a1 1 0 0 1 1.35 0l2.8 2.65"/></svg>`,
  trackpad: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.75 2.25 9.5 4.1-4.15 1.35-1.35 4.15-4-9.6Z"/><path d="m8.2 7.8 3.55 3.55"/></svg>`,
  edge: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.25" width="11.5" height="10.5" rx="1.75"/><path d="M10.25 2.25v10.5"/><path d="M4.5 7.5h3"/></svg>`,
  laser: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.5" cy="7.5" r="4.75"/><circle cx="7.5" cy="7.5" r="1.25"/><path d="M7.5 1v1.75M7.5 12.25V14M1 7.5h1.75M12.25 7.5H14"/></svg>`,
  note: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="1.75" width="10" height="11.5" rx="1.5"/><path d="M5 5.25h5M5 8h5M5 10.75h3"/></svg>`,
  sketch: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.75 2.25 12.75 5.25 5.25 12.75H2.25v-3L9.75 2.25Z"/><path d="m8.25 3.75 3 3"/></svg>`,
  namedrop: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.25 1.5 3.25 8.25h4l-.5 5.25 5-6.75h-4l.5-5.25Z"/></svg>`,
  close: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 3.5 8 8M11.5 3.5l-8 8"/></svg>`,
  spectrum: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="7.5" r="3.5"/><circle cx="9" cy="7.5" r="3.5"/></svg>`,
  edgeTop: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.25" width="11.5" height="10.5" rx="1.5"/><path d="M1.75 5.25h11.5"/><path d="m5.5 9.25 2-2 2 2"/></svg>`,
  edgeRight: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.25" width="11.5" height="10.5" rx="1.5"/><path d="M10.25 2.25v10.5"/><path d="m5.25 5.5 2 2-2 2"/></svg>`,
  edgeLeft: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.25" width="11.5" height="10.5" rx="1.5"/><path d="M4.75 2.25v10.5"/><path d="m9.75 5.5-2 2 2 2"/></svg>`,
  edgeBottom: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.25" width="11.5" height="10.5" rx="1.5"/><path d="M1.75 9.75h11.5"/><path d="m5.5 5.75 2 2 2-2"/></svg>`,
  scan: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 4.5V3a1 1 0 0 1 1-1h1.5M10.25 2h1.5a1 1 0 0 1 1 1v1.5M12.75 10.5V12a1 1 0 0 1-1 1h-1.5M4.75 13h-1.5a1 1 0 0 1-1-1v-1.5"/><path d="M4.5 7.5h6"/></svg>`,
  apps: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="4.5" height="4.5" rx="1"/><rect x="8.5" y="2" width="4.5" height="4.5" rx="1"/><rect x="2" y="8.5" width="4.5" height="4.5" rx="1"/><rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1"/></svg>`,
  portal: `<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.5" width="12.5" height="9" rx="1.5"/><path d="M5.5 14h5M8 11.5V14"/></svg>`,
  teleprompter: `<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 4h11M2.5 8h11M2.5 12h7"/></svg>`,
  panoramic: `<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M5.75 3v10M10.25 3v10"/></svg>`,
  synth: `<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 8h2l1.5-4 2 8 2-6 1.5 4 1.5-2h2.5"/></svg>`,
  history: `<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="5.75"/><path d="M8 5v3l2.25 1.5"/></svg>`,
  sharesheet: `<svg width="15" height="15" viewBox="0 0 15 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 7.5v4.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5V7.5"/><path d="m5 4.5 2.5-3 2.5 3"/><path d="M7.5 1.5v8"/></svg>`,
};

export function initMobileUX({
  getWs = () => window.ws,
  getRole = () => window.ROLE || 'laptop',
  getSelfId = () => window.selfId,
  getPeers = () => window.connectedPeers || [],
  onFilesPicked = (files) => window.handleFilesSelected?.(files),
  onSpawnTextCard = (text) => window.spawnTextCard?.(text),
  onTriggerNameDrop = () => window.triggerManualNameDrop?.(),
  showToast = (text) => window.showToast?.(text),
} = {}) {
  let trackpadOpen = false;
  let edgeSheetOpen = false;
  let currentEdge = 'right';
  let currentCenterRatio = 0.5;

  // Trackpad & Laser state (Phone side)
  let cursorXRatio = 0.5;
  let cursorYRatio = 0.5;
  let laserHeld = false;
  let laserColorMode = 'red'; // 'red' | 'cyan'
  let padPointerId = null;
  let padStartX = 0;
  let padStartY = 0;
  let padLastX = 0;
  let padLastY = 0;
  let padLastMoveTs = 0;
  let padDownTs = 0;
  let padMovedDistance = 0;
  let lastStreamTs = 0;
  const localRipples = [];

  // Remote Cursor & Laser state (Laptop side)
  const remoteState = {
    active: false,
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.5,
    clicking: false,
    laser: false,
    color: 'red',
    peerName: 'iPhone',
    lastPacketTs: 0,
    trail: [],
    rafId: null,
  };

  function sendWs(payload) {
    const sock = typeof getWs === 'function' ? getWs() : null;
    if (sock && sock.readyState === 1) {
      sock.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  function haptic(pattern = 10) {
    try {
      if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(pattern);
    } catch {}
  }

  function isMobileContext() {
    const role = typeof getRole === 'function' ? getRole() : 'laptop';
    return role === 'phone';
  }

  function formatCoordReadout(xRatio, yRatio) {
    return `X ${xRatio.toFixed(2)} · Y ${yRatio.toFixed(2)} · 120Hz`;
  }

  // ==========================================================================
  // 1. Inject Linear Mobile Material & Precision CSS
  // ==========================================================================
  function injectStyles() {
    if (document.getElementById('og-mobile-ux-styles')) return;
    const style = document.createElement('style');
    style.id = 'og-mobile-ux-styles';
    style.textContent = `
      :root {
        --og-safe-top: env(safe-area-inset-top, 0px);
        --og-safe-bottom: env(safe-area-inset-bottom, 0px);
        --og-safe-left: env(safe-area-inset-left, 0px);
        --og-safe-right: env(safe-area-inset-right, 0px);
        --og-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
        --og-surface: rgba(11, 12, 15, 0.92);
        --og-surface-elevated: rgba(18, 20, 26, 0.94);
        --og-border: rgba(255, 255, 255, 0.08);
        --og-specular: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        --og-text-primary: #f2f3f5;
        --og-text-secondary: #8a8f98;
        --og-accent: #5e6ad2;
        --og-accent-soft: rgba(94, 106, 210, 0.18);
        --og-accent-border: rgba(94, 106, 210, 0.55);
        --og-laser-red: #e5484d;
        --og-laser-cyan: #5e6ad2;
      }

      /* Mobile Mode Chrome Refinements */
      body.og-mobile-mode #ui-shell {
        padding:
          max(12px, calc(var(--og-safe-top) + 8px))
          max(14px, calc(var(--og-safe-right) + 12px))
          max(14px, calc(var(--og-safe-bottom) + 10px))
          max(14px, calc(var(--og-safe-left) + 12px));
      }

      body.og-mobile-mode .top-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      body.og-mobile-mode .dynamic-island {
        width: 100%;
        justify-content: space-between;
        padding: 7px 12px;
        gap: 8px;
      }

      body.og-mobile-mode .island-title {
        font-size: 13px;
        color: var(--og-text-primary);
      }

      body.og-mobile-mode .island-sub {
        font-size: 11.5px;
        color: var(--og-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
      }

      body.og-mobile-mode .toolbar {
        justify-content: center;
        gap: 6px;
      }

      body.og-mobile-mode .bottom-dock {
        display: none !important;
      }

      /* Thumb-First Bottom Action Bar */
      #og-thumb-bar {
        position: fixed;
        left: max(12px, var(--og-safe-left));
        right: max(12px, var(--og-safe-right));
        bottom: max(12px, calc(var(--og-safe-bottom) + 6px));
        z-index: 40;
        display: none;
        flex-direction: column;
        gap: 8px;
        pointer-events: auto;
      }

      body.og-mobile-mode #og-thumb-bar {
        display: flex;
      }

      .og-thumb-subbar {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
      }

      .og-mini-pill {
        appearance: none;
        -webkit-appearance: none;
        background: var(--og-surface);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid var(--og-border);
        box-shadow: var(--og-specular), 0 8px 20px rgba(0, 0, 0, 0.45);
        color: var(--og-text-secondary);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: -0.01em;
        padding: 6px 11px;
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: inherit;
        transition:
          transform 160ms var(--og-ease-out),
          opacity 160ms var(--og-ease-out);
      }
      .og-mini-pill svg {
        color: var(--og-text-primary);
        flex-shrink: 0;
      }
      .og-mini-pill:active {
        transform: scale(0.97);
      }

      .og-thumb-dock {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
        padding: 4px;
        border-radius: 18px;
        background: var(--og-surface);
        backdrop-filter: blur(28px) saturate(180%);
        -webkit-backdrop-filter: blur(28px) saturate(180%);
        border: 1px solid var(--og-border);
        box-shadow:
          0 20px 48px rgba(0, 0, 0, 0.72),
          var(--og-specular);
      }

      .og-pill-btn {
        appearance: none;
        -webkit-appearance: none;
        border: 1px solid var(--og-border);
        background: rgba(255, 255, 255, 0.025);
        box-shadow: var(--og-specular);
        color: var(--og-text-primary);
        min-height: 50px;
        padding: 6px 2px;
        border-radius: 13px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        cursor: pointer;
        font-family: inherit;
        transition:
          transform 160ms var(--og-ease-out),
          opacity 160ms var(--og-ease-out);
      }
      .og-pill-btn:active {
        transform: scale(0.97);
      }
      .og-pill-btn .og-ico {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: var(--og-text-primary);
      }
      .og-pill-btn .og-lbl {
        font-size: 10px;
        font-weight: 500;
        color: var(--og-text-secondary);
        letter-spacing: -0.01em;
        white-space: nowrap;
      }
      .og-pill-btn.scan-pill {
        background: rgba(94, 106, 210, 0.12);
        border-color: rgba(94, 106, 210, 0.32);
      }
      .og-pill-btn.scan-pill .og-lbl {
        color: var(--og-text-primary);
      }
      .og-pill-btn.tools-pill.active,
      .og-pill-btn.trackpad-pill.active,
      .og-pill-btn.edge-pill.active {
        background: var(--og-accent-soft);
        border-color: var(--og-accent);
        box-shadow: var(--og-specular), 0 0 20px rgba(94, 106, 210, 0.28);
      }
      .og-pill-btn.tools-pill.active .og-ico,
      .og-pill-btn.tools-pill.active .og-lbl,
      .og-pill-btn.trackpad-pill.active .og-ico,
      .og-pill-btn.edge-pill.active .og-ico,
      .og-pill-btn.trackpad-pill.active .og-lbl,
      .og-pill-btn.edge-pill.active .og-lbl {
        color: var(--og-text-primary);
      }
      .og-pill-btn.camera-pill {
        background: rgba(94, 106, 210, 0.12);
        border-color: rgba(94, 106, 210, 0.32);
      }
      .og-pill-btn.camera-pill .og-lbl {
        color: var(--og-text-primary);
      }

      /* 120Hz Full-Screen Obsidian Matte Glass Trackpad & Laser Surface */
      #og-trackpad-modal {
        position: fixed;
        inset: 0;
        z-index: 80;
        background: var(--og-surface);
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding:
          max(14px, calc(var(--og-safe-top) + 10px))
          max(14px, calc(var(--og-safe-right) + 12px))
          max(16px, calc(var(--og-safe-bottom) + 12px))
          max(14px, calc(var(--og-safe-left) + 12px));
        opacity: 0;
        pointer-events: none;
        transform: translate3d(0, 14px, 0) scale(0.985);
        transition:
          transform 240ms var(--og-ease-out),
          opacity 200ms var(--og-ease-out);
      }
      #og-trackpad-modal.open {
        opacity: 1;
        pointer-events: auto;
        transform: translate3d(0, 0, 0) scale(1);
      }

      .og-tp-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        z-index: 2;
      }
      .og-tp-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        background: var(--og-surface-elevated);
        border: 1px solid var(--og-border);
        box-shadow: var(--og-specular);
        font-size: 11.5px;
        font-weight: 500;
        color: var(--og-text-primary);
        letter-spacing: -0.01em;
      }
      .og-tp-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--og-accent);
        box-shadow: 0 0 8px var(--og-accent);
      }
      #og-trackpad-modal.laser-on .og-tp-dot {
        background: var(--og-laser-red);
        box-shadow: 0 0 10px var(--og-laser-red);
      }

      .og-tp-close {
        appearance: none;
        -webkit-appearance: none;
        border: 1px solid var(--og-border);
        background: var(--og-surface-elevated);
        box-shadow: var(--og-specular);
        color: var(--og-text-primary);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 11.5px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        font-family: inherit;
        transition:
          transform 160ms var(--og-ease-out),
          opacity 160ms var(--og-ease-out);
      }
      .og-tp-close:active {
        transform: scale(0.97);
      }

      #og-tp-surface {
        position: relative;
        flex: 1;
        margin: 12px 0;
        border-radius: 20px;
        border: 1px solid var(--og-border);
        background:
          radial-gradient(circle at 50% 50%, rgba(94, 106, 210, 0.06), rgba(11, 12, 15, 0.96));
        box-shadow:
          var(--og-specular),
          0 24px 60px rgba(0, 0, 0, 0.65);
        overflow: hidden;
        touch-action: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      #og-trackpad-modal.laser-on #og-tp-surface {
        border-color: rgba(229, 72, 77, 0.45);
        box-shadow:
          var(--og-specular),
          inset 0 0 32px rgba(229, 72, 77, 0.12),
          0 24px 60px rgba(0, 0, 0, 0.7);
      }

      #og-tp-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .og-tp-telemetry {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        pointer-events: none;
        z-index: 2;
      }
      .og-tp-coord-pill {
        font-family: 'SF Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-variant-numeric: tabular-nums;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.02em;
        color: var(--og-text-primary);
        background: rgba(11, 12, 15, 0.84);
        border: 1px solid var(--og-border);
        box-shadow: var(--og-specular);
        padding: 4px 9px;
        border-radius: 6px;
      }
      .og-tp-mode-tag {
        font-family: 'SF Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-variant-numeric: tabular-nums;
        font-size: 10.5px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--og-text-secondary);
        background: rgba(11, 12, 15, 0.84);
        border: 1px solid var(--og-border);
        padding: 4px 8px;
        border-radius: 6px;
      }
      #og-trackpad-modal.laser-on .og-tp-mode-tag {
        color: var(--og-text-primary);
        border-color: rgba(229, 72, 77, 0.5);
        background: rgba(229, 72, 77, 0.16);
      }

      .og-tp-watermark {
        pointer-events: none;
        text-align: center;
        padding: 0 24px;
        z-index: 1;
        transition: opacity 180ms var(--og-ease-out);
      }
      .og-tp-watermark h3 {
        margin: 0 0 6px;
        font-size: 14.5px;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--og-text-primary);
      }
      .og-tp-watermark p {
        margin: 0;
        font-size: 12px;
        color: var(--og-text-secondary);
        line-height: 1.45;
      }

      .og-tp-controls {
        display: grid;
        grid-template-columns: 1fr 1.35fr 1fr;
        gap: 8px;
        z-index: 2;
      }
      .og-tp-btn {
        appearance: none;
        -webkit-appearance: none;
        min-height: 50px;
        border-radius: 13px;
        border: 1px solid var(--og-border);
        background: var(--og-surface-elevated);
        box-shadow: var(--og-specular);
        color: var(--og-text-primary);
        font-size: 12.5px;
        font-weight: 500;
        letter-spacing: -0.01em;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        cursor: pointer;
        font-family: inherit;
        touch-action: none;
        transition:
          transform 160ms var(--og-ease-out),
          opacity 160ms var(--og-ease-out);
      }
      .og-tp-btn:active {
        transform: scale(0.97);
      }
      .og-tp-btn.laser-hold-btn {
        background: rgba(94, 106, 210, 0.14);
        border-color: rgba(94, 106, 210, 0.42);
      }
      .og-tp-btn.laser-hold-btn.active {
        background: var(--og-accent);
        border-color: rgba(255, 255, 255, 0.24);
        box-shadow: var(--og-specular), 0 0 24px rgba(94, 106, 210, 0.55);
        transform: scale(0.97);
      }

      /* Edge Alignment Bottom Sheet */
      #og-edge-backdrop {
        position: fixed;
        inset: 0;
        z-index: 59;
        background: rgba(5, 6, 8, 0.68);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 220ms var(--og-ease-out);
      }
      #og-edge-backdrop.open {
        opacity: 1;
        pointer-events: auto;
      }

      #og-edge-sheet {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 60;
        background: var(--og-surface);
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
        border-top: 1px solid var(--og-border);
        box-shadow:
          var(--og-specular),
          0 -24px 64px rgba(0, 0, 0, 0.78);
        border-radius: 22px 22px 0 0;
        padding:
          12px
          max(18px, calc(var(--og-safe-right) + 16px))
          max(22px, calc(var(--og-safe-bottom) + 16px))
          max(18px, calc(var(--og-safe-left) + 16px));
        transform: translate3d(0, 105%, 0);
        transition:
          transform 280ms var(--og-ease-out),
          opacity 220ms var(--og-ease-out);
        pointer-events: auto;
      }
      #og-edge-sheet.open {
        transform: translate3d(0, 0, 0);
      }
      /* OneGlass Mobile Flagship Tools Bottom Sheet — Linear Surface */
      #og-tools-backdrop {
        position: fixed;
        inset: 0;
        z-index: 64;
        background: rgba(5, 6, 8, 0.68);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 220ms var(--og-ease-out);
      }
      #og-tools-backdrop.open {
        opacity: 1;
        pointer-events: auto;
      }

      #og-mobile-tools-sheet {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 65;
        background: var(--og-surface);
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
        border-top: 1px solid var(--og-border);
        box-shadow:
          var(--og-specular),
          0 -24px 64px rgba(0, 0, 0, 0.78);
        border-radius: 22px 22px 0 0;
        padding:
          12px
          max(16px, calc(var(--og-safe-right) + 14px))
          max(22px, calc(var(--og-safe-bottom) + 16px))
          max(16px, calc(var(--og-safe-left) + 14px));
        transform: translate3d(0, 105%, 0);
        transition:
          transform 280ms var(--og-ease-out),
          opacity 220ms var(--og-ease-out);
        pointer-events: auto;
      }
      #og-mobile-tools-sheet.open {
        transform: translate3d(0, 0, 0);
      }

      .og-tools-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin-top: 12px;
      }
      @media (max-width: 340px) {
        .og-tools-grid {
          grid-template-columns: 1fr;
        }
      }
      .og-tool-btn {
        appearance: none;
        -webkit-appearance: none;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--og-border);
        border-radius: 14px;
        padding: 10px 11px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        gap: 6px;
        cursor: pointer;
        color: var(--og-text-primary);
        font-family: inherit;
        box-shadow: var(--og-specular);
        transition:
          transform 160ms var(--og-ease-out),
          background 160ms var(--og-ease-out),
          border-color 160ms var(--og-ease-out);
      }
      .og-tool-btn:active {
        transform: scale(0.97);
        background: rgba(94, 106, 210, 0.14);
        border-color: rgba(94, 106, 210, 0.4);
      }
      .og-tool-btn-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 6px;
      }
      .og-tool-icon-wrap {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(94, 106, 210, 0.15);
        border: 1px solid rgba(94, 106, 210, 0.32);
        color: #7b88ee;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        flex-shrink: 0;
      }
      .og-tool-badge {
        font-size: 9.5px;
        font-weight: 500;
        padding: 1.5px 5.5px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: var(--og-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .og-tool-title {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--og-text-primary);
      }
      .og-tool-desc {
        font-size: 10.5px;
        color: var(--og-text-secondary);
        line-height: 1.3;
      }

      .og-sheet-handle {
        width: 36px;
        height: 4px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
        margin: 0 auto 14px;
      }
      .og-sheet-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .og-sheet-title-wrap {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--og-text-primary);
      }
      .og-sheet-head h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--og-text-primary);
        letter-spacing: -0.02em;
      }
      .og-sheet-sub {
        margin: 0 0 16px;
        font-size: 12px;
        color: var(--og-text-secondary);
        line-height: 1.45;
      }

      .og-edge-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin-bottom: 14px;
      }
      .og-edge-option {
        appearance: none;
        -webkit-appearance: none;
        border: 1px solid var(--og-border);
        background: rgba(255, 255, 255, 0.025);
        box-shadow: var(--og-specular);
        color: var(--og-text-primary);
        border-radius: 13px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        text-align: left;
        font-family: inherit;
        transition:
          transform 160ms var(--og-ease-out),
          opacity 160ms var(--og-ease-out);
      }
      .og-edge-option:active {
        transform: scale(0.97);
      }
      .og-edge-option.selected {
        border-color: var(--og-accent);
        background: var(--og-accent-soft);
        box-shadow: var(--og-specular), 0 0 20px rgba(94, 106, 210, 0.24);
      }
      .og-edge-option .og-edge-arrow {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--og-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--og-text-primary);
        flex-shrink: 0;
      }
      .og-edge-option.selected .og-edge-arrow {
        background: var(--og-accent);
        border-color: rgba(255, 255, 255, 0.22);
      }
      .og-edge-option .og-edge-title {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--og-text-primary);
        display: block;
        letter-spacing: -0.01em;
      }
      .og-edge-option .og-edge-desc {
        font-size: 11px;
        color: var(--og-text-secondary);
        display: block;
        margin-top: 1px;
      }

      .og-ratio-row {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid var(--og-border);
        box-shadow: var(--og-specular);
        border-radius: 13px;
        padding: 10px 14px;
      }
      .og-ratio-row label {
        font-size: 12px;
        font-weight: 500;
        color: var(--og-text-secondary);
        white-space: nowrap;
      }
      .og-ratio-row input[type="range"] {
        flex: 1;
        accent-color: var(--og-accent);
      }
      .og-ratio-val {
        font-family: 'SF Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-variant-numeric: tabular-nums;
        font-size: 11.5px;
        color: var(--og-text-primary);
        font-weight: 500;
        min-width: 36px;
        text-align: right;
      }

      /* Laptop-Side Remote Cursor & Glowing Laser Layer */
      #og-remote-cursor-layer {
        position: fixed;
        inset: 0;
        z-index: 85;
        pointer-events: none;
        overflow: hidden;
      }
      #og-remote-trail-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      #og-remote-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 24px;
        height: 24px;
        margin-left: -12px;
        margin-top: -12px;
        pointer-events: none;
        will-change: transform, opacity;
        opacity: 0;
        transition: opacity 220ms var(--og-ease-out);
      }
      #og-remote-cursor.visible {
        opacity: 1;
      }
      .og-cursor-core {
        width: 16px;
        height: 16px;
        margin: 4px;
        border-radius: 50%;
        background: var(--og-accent);
        border: 1.5px solid var(--og-text-primary);
        box-shadow:
          0 0 16px rgba(94, 106, 210, 0.85),
          0 4px 12px rgba(0, 0, 0, 0.5);
        transition:
          transform 140ms var(--og-ease-out),
          opacity 140ms var(--og-ease-out);
      }
      #og-remote-cursor.laser-active .og-cursor-core {
        background: var(--og-laser-red);
        border-color: #ffffff;
        transform: scale(1.22);
        box-shadow:
          0 0 16px var(--og-laser-red),
          0 0 32px var(--og-laser-red),
          0 0 56px rgba(94, 106, 210, 0.65);
      }
      #og-remote-cursor.clicking .og-cursor-core {
        transform: scale(0.78);
      }
      .og-cursor-tag {
        position: absolute;
        left: 22px;
        top: 14px;
        background: var(--og-surface);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--og-border);
        box-shadow: var(--og-specular), 0 6px 18px rgba(0, 0, 0, 0.45);
        color: var(--og-text-primary);
        font-size: 10.5px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 999px;
        white-space: nowrap;
      }
      #og-remote-cursor.laser-active .og-cursor-tag {
        border-color: rgba(229, 72, 77, 0.55);
        color: var(--og-text-primary);
      }

      /* Remote Tap Highlight & Click Ripple on Laptop */
      .og-click-ripple {
        position: fixed;
        top: 0;
        left: 0;
        width: 44px;
        height: 44px;
        margin-left: -22px;
        margin-top: -22px;
        border-radius: 50%;
        border: 1.5px solid var(--og-accent);
        box-shadow: 0 0 24px rgba(94, 106, 210, 0.65);
        pointer-events: none;
        z-index: 86;
        transform: translate3d(var(--rx, 0px), var(--ry, 0px), 0) scale(0.35);
        opacity: 0.95;
        transition:
          transform 380ms var(--og-ease-out),
          opacity 380ms var(--og-ease-out);
      }
      .og-remote-target-highlight {
        outline: 1.5px solid var(--og-accent) !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 28px rgba(94, 106, 210, 0.5) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // 2. Build Thumb-First Mobile DOM (Inputs, Bottom Bar, Trackpad, Edge Sheet)
  // ==========================================================================
  injectStyles();

  // Hidden Camera Input (`capture="environment"`)
  const cameraInput = document.createElement('input');
  cameraInput.type = 'file';
  cameraInput.accept = 'image/*,video/*';
  cameraInput.setAttribute('capture', 'environment');
  cameraInput.style.display = 'none';
  cameraInput.addEventListener('change', () => {
    if (cameraInput.files && cameraInput.files.length > 0) {
      onFilesPicked(cameraInput.files);
      showToast('Captured. Flick it up to send.');
      cameraInput.value = '';
    }
  });
  document.body.appendChild(cameraInput);

  // Hidden Universal Files Input (`multiple accept="*/*"`)
  const filesInput = document.createElement('input');
  filesInput.type = 'file';
  filesInput.multiple = true;
  filesInput.accept = '*/*';
  filesInput.style.display = 'none';
  filesInput.addEventListener('change', () => {
    if (filesInput.files && filesInput.files.length > 0) {
      onFilesPicked(filesInput.files);
      showToast('Ready. Flick it up to send.');
      filesInput.value = '';
    }
  });
  document.body.appendChild(filesInput);

  // Thumb-Zone Bottom Bar with 4 Large Tactile Pill Buttons
  const thumbBar = document.createElement('div');
  thumbBar.id = 'og-thumb-bar';
  thumbBar.innerHTML = `
    <div class="og-thumb-subbar" hidden>
      <button type="button" class="og-mini-pill" id="og-quick-note-btn">
        ${ICONS.note}
        <span>Quick Note</span>
      </button>
      <button type="button" class="og-mini-pill" id="og-quick-canvas-btn">
        ${ICONS.sketch}
        <span>Live Sketch</span>
      </button>
      <button type="button" class="og-mini-pill" id="og-quick-wave-btn">
        ${ICONS.namedrop}
        <span>NameDrop</span>
      </button>
    </div>
    <div class="og-thumb-dock" role="toolbar" aria-label="OneGlass Mobile Actions">
      <button type="button" class="og-pill-btn camera-pill" id="og-btn-camera">
        <span class="og-ico">${ICONS.camera}</span>
        <span class="og-lbl">Camera</span>
      </button>
      <button type="button" class="og-pill-btn scan-pill" id="og-btn-scan" hidden>
        <span class="og-ico">${ICONS.scan}</span>
        <span class="og-lbl">Scan</span>
      </button>
      <button type="button" class="og-pill-btn files-pill" id="og-btn-files">
        <span class="og-ico">${ICONS.files}</span>
        <span class="og-lbl">Send</span>
      </button>
      <button type="button" class="og-pill-btn trackpad-pill" id="og-btn-trackpad">
        <span class="og-ico">${ICONS.trackpad}</span>
        <span class="og-lbl">Trackpad</span>
      </button>
      <button type="button" class="og-pill-btn edge-pill" id="og-btn-edge" hidden>
        <span class="og-ico">${ICONS.edge}</span>
        <span class="og-lbl">Edge</span>
      </button>
      <button type="button" class="og-pill-btn tools-pill" id="og-btn-tools">
        <span class="og-ico">${ICONS.apps}</span>
        <span class="og-lbl">More</span>
      </button>
    </div>
  `;
  document.body.appendChild(thumbBar);

  // Wire up the 6 primary thumb buttons + mini utility pills
  thumbBar.querySelector('#og-btn-camera').addEventListener('click', () => {
    haptic(12);
    cameraInput.click();
  });

  thumbBar.querySelector('#og-btn-scan').addEventListener('click', () => {
    haptic(14);
    if (window.oneGlassCameraScanner && typeof window.oneGlassCameraScanner.openCameraScanner === 'function') {
      window.oneGlassCameraScanner.openCameraScanner();
    } else if (typeof window.openCameraScanner === 'function') {
      window.openCameraScanner();
    } else {
      cameraInput.click();
    }
  });

  thumbBar.querySelector('#og-btn-files').addEventListener('click', () => {
    haptic(12);
    filesInput.click();
  });

  thumbBar.querySelector('#og-btn-trackpad').addEventListener('click', () => {
    haptic(14);
    toggleTrackpadMode();
  });

  thumbBar.querySelector('#og-btn-edge').addEventListener('click', () => {
    haptic(14);
    openEdgeSheet();
  });

  thumbBar.querySelector('#og-btn-tools').addEventListener('click', () => {
    haptic(14);
    openToolsSheet();
  });

  // ==========================================================================
  // Mobile Flagship Tools Sheet (#og-mobile-tools-sheet, z-index 65)
  // ==========================================================================
  let toolsSheetOpen = false;

  const toolsBackdrop = document.createElement('div');
  toolsBackdrop.id = 'og-tools-backdrop';
  document.body.appendChild(toolsBackdrop);

  const toolsSheet = document.createElement('div');
  toolsSheet.id = 'og-mobile-tools-sheet';
  toolsSheet.innerHTML = `
    <div class="og-sheet-handle"></div>
    <div class="og-sheet-head">
      <div class="og-sheet-title-wrap">
        ${ICONS.apps}
        <h3>More tools</h3>
      </div>
      <button type="button" class="og-tp-close" id="og-tools-close-btn">
        ${ICONS.close}
        <span>Done</span>
      </button>
    </div>
    <p class="og-sheet-sub">Everything else OneGlass can do with your phone and laptop.</p>
    <div class="og-tools-grid">
      <button type="button" class="og-tool-btn" data-action="scanner">
        <div class="og-tool-btn-head">
          <span class="og-tool-icon-wrap">${ICONS.scan}</span>
          <span class="og-tool-badge">4K Warp</span>
        </div>
        <div class="og-tool-title">Scan a document</div>
        <div class="og-tool-desc">Straighten pages and save them as a PDF</div>
      </button>

      <button type="button" class="og-tool-btn" data-action="portal">
        <div class="og-tool-btn-head">
          <span class="og-tool-icon-wrap">${ICONS.portal}</span>
          <span class="og-tool-badge">Sidecar</span>
        </div>
        <div class="og-tool-title">Show a window</div>
        <div class="og-tool-desc">Watch a laptop window on this phone</div>
      </button>

      <button type="button" class="og-tool-btn" data-action="teleprompter">
        <div class="og-tool-btn-head">
          <span class="og-tool-icon-wrap">${ICONS.teleprompter}</span>
          <span class="og-tool-badge">Top Notch</span>
        </div>
        <div class="og-tool-title">Teleprompter</div>
        <div class="og-tool-desc">Scrolling script near the laptop camera</div>
      </button>

      <button type="button" class="og-tool-btn" data-action="wall">
        <div class="og-tool-btn-head">
          <span class="og-tool-icon-wrap">${ICONS.panoramic}</span>
          <span class="og-tool-badge">Multi-Screen</span>
        </div>
        <div class="og-tool-title">Panorama</div>
        <div class="og-tool-desc">One picture across every screen</div>
      </button>

      <button type="button" class="og-tool-btn" data-action="synth">
        <div class="og-tool-btn-head">
          <span class="og-tool-icon-wrap">${ICONS.synth}</span>
          <span class="og-tool-badge">XY WebAudio</span>
        </div>
        <div class="og-tool-title">Synth</div>
        <div class="og-tool-desc">Play sounds across both screens</div>
      </button>

      <button type="button" class="og-tool-btn" data-action="history">
        <div class="og-tool-btn-head">
          <span class="og-tool-icon-wrap">${ICONS.history}</span>
          <span class="og-tool-badge">Transfers</span>
        </div>
        <div class="og-tool-title">History</div>
        <div class="og-tool-desc">Everything sent this session</div>
      </button>
      <button type="button" class="og-tool-btn" data-action="sharesheet">
        <div class="og-tool-btn-head">
          <span class="og-tool-icon-wrap">${ICONS.sharesheet}</span>
          <span class="og-tool-badge">OS Share</span>
        </div>
        <div class="og-tool-title">Share sheet</div>
        <div class="og-tool-desc">Send from Photos or Files on this phone</div>
      </button>
    </div>
  `;
  document.body.appendChild(toolsSheet);

  function openToolsSheet(forceState) {
    toolsSheetOpen = typeof forceState === 'boolean' ? forceState : !toolsSheetOpen;
    toolsBackdrop.classList.toggle('open', toolsSheetOpen);
    toolsSheet.classList.toggle('open', toolsSheetOpen);
    const btn = thumbBar.querySelector('#og-btn-tools');
    if (btn) btn.classList.toggle('active', toolsSheetOpen);
    return toolsSheetOpen;
  }

  toolsBackdrop.addEventListener('click', () => openToolsSheet(false));
  toolsSheet.querySelector('#og-tools-close-btn').addEventListener('click', () => openToolsSheet(false));

  toolsSheet.querySelectorAll('.og-tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic(14);
      const action = btn.getAttribute('data-action');
      openToolsSheet(false);
      setTimeout(() => {
        if (action === 'scanner') {
          if (window.oneGlassCameraScanner && typeof window.oneGlassCameraScanner.openCameraScanner === 'function') {
            window.oneGlassCameraScanner.openCameraScanner();
          } else if (typeof window.openCameraScanner === 'function') {
            window.openCameraScanner();
          } else {
            cameraInput.click();
          }
        } else if (action === 'portal') {
          if (window.oneGlassScreenPortal && typeof window.oneGlassScreenPortal.openScreenPortal === 'function') {
            window.oneGlassScreenPortal.openScreenPortal();
          } else if (typeof window.openScreenPortal === 'function') {
            window.openScreenPortal();
          }
        } else if (action === 'teleprompter') {
          if (window.oneGlassDisplayModes && typeof window.oneGlassDisplayModes.openTeleprompter === 'function') {
            window.oneGlassDisplayModes.openTeleprompter();
          } else if (window.oneGlassDisplayModes && typeof window.oneGlassDisplayModes.openNotchTeleprompter === 'function') {
            window.oneGlassDisplayModes.openNotchTeleprompter();
          }
        } else if (action === 'wall') {
          if (window.oneGlassDisplayModes && typeof window.oneGlassDisplayModes.openPanoramicWall === 'function') {
            window.oneGlassDisplayModes.openPanoramicWall();
          } else if (typeof window.openPanoramicWall === 'function') {
            window.openPanoramicWall();
          }
        } else if (action === 'synth') {
          if (window.oneGlassDisplayModes && typeof window.oneGlassDisplayModes.openContinuumSynth === 'function') {
            window.oneGlassDisplayModes.openContinuumSynth();
          } else if (typeof window.openContinuumSynth === 'function') {
            window.openContinuumSynth();
          }
        } else if (action === 'history') {
          if (window.oneGlassContinuity && typeof window.oneGlassContinuity.toggleHistoryDrawer === 'function') {
            window.oneGlassContinuity.toggleHistoryDrawer();
          } else if (typeof window.oneGlassHistory === 'function') {
            window.oneGlassHistory();
          }
        } else if (action === 'sharesheet') {
          if (typeof window.openShareSheetSetupModal === 'function') {
            window.openShareSheetSetupModal();
          } else {
            openShareSheetSetupModalLocal();
          }
        }
      }, 100);
    });
  });
  thumbBar.querySelector('#og-quick-note-btn').addEventListener('click', () => {
    haptic(10);
    if (typeof window.pasteFromClipboard === 'function') {
      window.pasteFromClipboard();
    } else {
      const txt = prompt('Enter note or URL to beam to laptop:');
      if (txt && txt.trim()) onSpawnTextCard(txt.trim());
    }
  });

  thumbBar.querySelector('#og-quick-canvas-btn').addEventListener('click', () => {
    haptic(10);
    window.spawnSpanningCanvasCard?.();
  });

  thumbBar.querySelector('#og-quick-wave-btn').addEventListener('click', () => {
    haptic([12, 20, 35]);
    onTriggerNameDrop();
  });

  // ==========================================================================
  // 3. Full-Screen 120Hz Glass Trackpad & Keynote Laser Pointer Surface
  // ==========================================================================
  const trackpadModal = document.createElement('div');
  trackpadModal.id = 'og-trackpad-modal';
  trackpadModal.innerHTML = `
    <div class="og-tp-header">
      <div class="og-tp-badge">
        <span class="og-tp-dot"></span>
        <span id="og-tp-status">120Hz Glass Trackpad · 60fps Stream</span>
      </div>
      <button type="button" class="og-tp-close" id="og-tp-close-btn">
        ${ICONS.close}
        <span>Done</span>
      </button>
    </div>

    <div id="og-tp-surface">
      <canvas id="og-tp-canvas"></canvas>
      <div class="og-tp-telemetry">
        <span class="og-tp-coord-pill" id="og-tp-coords">X 0.50 · Y 0.50 · 120Hz</span>
        <span class="og-tp-mode-tag" id="og-tp-mode-readout">Ballistic</span>
      </div>
      <div class="og-tp-watermark" id="og-tp-watermark">
        <h3>Precision Trackpad Surface</h3>
        <p>Glide with one finger to steer cursor · Tap to click · Hold Laser for direct 1:1 projection</p>
      </div>
    </div>

    <div class="og-tp-controls">
      <button type="button" class="og-tp-btn" id="og-tp-click-btn">
        ${ICONS.trackpad}
        <span>Click</span>
      </button>
      <button type="button" class="og-tp-btn laser-hold-btn" id="og-tp-laser-btn">
        ${ICONS.laser}
        <span>Laser Hold</span>
      </button>
      <button type="button" class="og-tp-btn" id="og-tp-color-btn">
        ${ICONS.spectrum}
        <span id="og-tp-color-label">Indigo / Crimson</span>
      </button>
    </div>
  `;
  document.body.appendChild(trackpadModal);

  const tpSurface = trackpadModal.querySelector('#og-tp-surface');
  const tpCanvas = trackpadModal.querySelector('#og-tp-canvas');
  const tpCtx = tpCanvas.getContext('2d');
  const tpStatus = trackpadModal.querySelector('#og-tp-status');
  const tpCoords = trackpadModal.querySelector('#og-tp-coords');
  const tpModeReadout = trackpadModal.querySelector('#og-tp-mode-readout');
  const laserBtn = trackpadModal.querySelector('#og-tp-laser-btn');
  const colorBtn = trackpadModal.querySelector('#og-tp-color-btn');
  const colorBtnLabel = trackpadModal.querySelector('#og-tp-color-label');
  const localTrail = [];

  function syncCoordReadout() {
    if (tpCoords) {
      tpCoords.textContent = formatCoordReadout(cursorXRatio, cursorYRatio);
    }
  }

  function emitRemoteCursor({ clicking = false, force = false } = {}) {
    syncCoordReadout();
    const now = performance.now();
    // Throttle continuous movement to ~60fps (16ms), never drop click or state transitions
    if (!force && !clicking && now - lastStreamTs < 15.5) return;
    lastStreamTs = now;
    const pkt = {
      type: 'remote_cursor',
      xRatio: Number(cursorXRatio.toFixed(4)),
      yRatio: Number(cursorYRatio.toFixed(4)),
      clicking: Boolean(clicking),
      laser: Boolean(laserHeld),
      color: laserColorMode,
    };
    if (typeof window !== 'undefined' && typeof window.sendOneGlassFast === 'function') {
      window.sendOneGlassFast(pkt);
    } else {
      const sock = typeof getWs === 'function' ? getWs() : (typeof window !== 'undefined' ? window.ws : null);
      if (sock && sock.readyState === 1) {
        sock.send(JSON.stringify(pkt));
      } else {
        sendWs(pkt);
      }
    }
  }

  function setLaserActive(active) {
    laserHeld = Boolean(active);
    laserBtn.classList.toggle('active', laserHeld);
    trackpadModal.classList.toggle('laser-on', laserHeld);
    tpStatus.textContent = laserHeld
      ? `Keynote Laser Active · ${laserColorMode.toUpperCase()}`
      : '120Hz Glass Trackpad · 60fps Stream';
    if (tpModeReadout) {
      tpModeReadout.textContent = laserHeld ? 'Absolute 1:1' : 'Ballistic';
    }
    emitRemoteCursor({ clicking: false, force: true });
  }

  // Laser Hold button: works as push-to-hold AND tap-to-toggle for convenience
  let laserPressTs = 0;
  let laserToggledLatched = false;
  laserBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    haptic(15);
    laserPressTs = performance.now();
    laserBtn.setPointerCapture(e.pointerId);
    setLaserActive(true);
  });

  const endLaserHold = (e) => {
    if (!laserPressTs) return;
    e.preventDefault();
    const heldMs = performance.now() - laserPressTs;
    laserPressTs = 0;
    if (heldMs < 240 && !laserToggledLatched) {
      // Quick tap latches laser on until tapped again
      laserToggledLatched = true;
      setLaserActive(true);
    } else {
      laserToggledLatched = false;
      setLaserActive(false);
    }
  };
  laserBtn.addEventListener('pointerup', endLaserHold);
  laserBtn.addEventListener('pointercancel', endLaserHold);

  // Switch between Red & Cyan laser beam
  colorBtn.addEventListener('click', () => {
    haptic(10);
    laserColorMode = laserColorMode === 'red' ? 'cyan' : 'red';
    if (colorBtnLabel) {
      colorBtnLabel.textContent = laserColorMode === 'red' ? 'Indigo / Crimson' : 'Crimson / Indigo';
    }
    if (laserHeld) setLaserActive(true);
  });

  // Dedicated Left-Click button
  trackpadModal.querySelector('#og-tp-click-btn').addEventListener('click', () => {
    haptic(12);
    emitRemoteCursor({ clicking: true, force: true });
  });

  trackpadModal.querySelector('#og-tp-close-btn').addEventListener('click', () => {
    haptic(10);
    toggleTrackpadMode(false);
  });

  // 1-Finger Trackpad Surface Interaction
  tpSurface.addEventListener('pointerdown', (e) => {
    if (padPointerId !== null) return;
    padPointerId = e.pointerId;
    tpSurface.setPointerCapture(e.pointerId);

    const rect = tpSurface.getBoundingClientRect();
    padStartX = e.clientX;
    padStartY = e.clientY;
    padLastX = e.clientX;
    padLastY = e.clientY;
    padDownTs = performance.now();
    padLastMoveTs = padDownTs;
    padMovedDistance = 0;

    // If Laser is active, jumping directly or sliding smoothly both feel responsive
    if (laserHeld) {
      cursorXRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
      cursorYRatio = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
    }

    localTrail.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      ts: padDownTs,
    });
    emitRemoteCursor({ clicking: false, force: true });
  });

  tpSurface.addEventListener('pointermove', (e) => {
    if (e.pointerId !== padPointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - padLastMoveTs);
    const rect = tpSurface.getBoundingClientRect();

    const dx = e.clientX - padLastX;
    const dy = e.clientY - padLastY;
    padMovedDistance += Math.hypot(dx, dy);

    if (laserHeld) {
      // Direct 1:1 absolute screen projection when beaming laser pointer
      cursorXRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
      cursorYRatio = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
    } else {
      // Apple Magic Trackpad ballistic relative velocity curve
      const speed = Math.hypot(dx, dy) / dt; // px/ms
      const gain = 1.15 + Math.min(1.6, speed * 0.65);
      cursorXRatio = Math.max(0, Math.min(1, cursorXRatio + (dx * gain) / Math.max(220, rect.width)));
      cursorYRatio = Math.max(0, Math.min(1, cursorYRatio + (dy * gain) / Math.max(220, rect.height)));
    }

    padLastX = e.clientX;
    padLastY = e.clientY;
    padLastMoveTs = now;

    localTrail.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      ts: now,
    });
    if (localTrail.length > 36) localTrail.shift();

    emitRemoteCursor({ clicking: false, force: false });
  });

  function finishPadTouch(e) {
    if (e.pointerId !== padPointerId) return;
    padPointerId = null;
    const now = performance.now();
    const duration = now - padDownTs;

    // Quick 1-finger tap clicks on the laptop
    if (duration < 260 && padMovedDistance < 12) {
      haptic(12);
      const rect = tpSurface.getBoundingClientRect();
      localRipples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        ts: now,
      });
      emitRemoteCursor({ clicking: true, force: true });
    } else {
      emitRemoteCursor({ clicking: false, force: true });
    }
  }

  tpSurface.addEventListener('pointerup', finishPadTouch);
  tpSurface.addEventListener('pointercancel', finishPadTouch);

  // Local 120Hz Visual Feedback Loop on the Phone Trackpad Surface
  function renderLocalTrackpadLoop(now) {
    if (trackpadOpen) {
      const rect = tpSurface.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 2;
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (tpCanvas.width !== targetW || tpCanvas.height !== targetH) {
        tpCanvas.width = targetW;
        tpCanvas.height = targetH;
      }

      tpCtx.save();
      tpCtx.scale(dpr, dpr);
      tpCtx.clearRect(0, 0, rect.width, rect.height);

      // Precision micro-grid
      tpCtx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      tpCtx.lineWidth = 1;
      const step = 32;
      for (let x = step; x < rect.width; x += step) {
        tpCtx.beginPath();
        tpCtx.moveTo(x, 0);
        tpCtx.lineTo(x, rect.height);
        tpCtx.stroke();
      }
      for (let y = step; y < rect.height; y += step) {
        tpCtx.beginPath();
        tpCtx.moveTo(0, y);
        tpCtx.lineTo(rect.width, y);
        tpCtx.stroke();
      }

      // Prune & draw finger trail
      while (localTrail.length > 0 && now - localTrail[0].ts > 260) {
        localTrail.shift();
      }
      if (localTrail.length > 1) {
        for (let i = 1; i < localTrail.length; i++) {
          const p0 = localTrail[i - 1];
          const p1 = localTrail[i];
          const age = (now - p1.ts) / 260;
          const alpha = Math.max(0, 1 - age);
          tpCtx.beginPath();
          tpCtx.moveTo(p0.x, p0.y);
          tpCtx.lineTo(p1.x, p1.y);
          tpCtx.strokeStyle = laserHeld
            ? laserColorMode === 'cyan'
              ? `rgba(94, 106, 210, ${alpha * 0.9})`
              : `rgba(229, 72, 77, ${alpha * 0.9})`
            : `rgba(94, 106, 210, ${alpha * 0.7})`;
          tpCtx.lineWidth = (1 - age) * (laserHeld ? 7 : 4.5) + 1.5;
          tpCtx.lineCap = 'round';
          tpCtx.stroke();
        }
      }

      // Draw precision crosshair + mapped cursor node on pad
      const cx = cursorXRatio * rect.width;
      const cy = cursorYRatio * rect.height;

      tpCtx.strokeStyle = laserHeld
        ? 'rgba(229, 72, 77, 0.24)'
        : 'rgba(94, 106, 210, 0.22)';
      tpCtx.lineWidth = 1;
      tpCtx.beginPath();
      tpCtx.moveTo(cx, 0);
      tpCtx.lineTo(cx, rect.height);
      tpCtx.moveTo(0, cy);
      tpCtx.lineTo(rect.width, cy);
      tpCtx.stroke();

      tpCtx.beginPath();
      tpCtx.arc(cx, cy, laserHeld ? 13 : 10, 0, Math.PI * 2);
      tpCtx.strokeStyle = laserHeld
        ? 'rgba(229, 72, 77, 0.55)'
        : 'rgba(94, 106, 210, 0.55)';
      tpCtx.lineWidth = 1.25;
      tpCtx.stroke();

      tpCtx.beginPath();
      tpCtx.arc(cx, cy, laserHeld ? 5 : 4, 0, Math.PI * 2);
      tpCtx.fillStyle = laserHeld
        ? laserColorMode === 'cyan'
          ? '#5e6ad2'
          : '#e5484d'
        : '#f2f3f5';
      tpCtx.fill();

      // Draw tap ripples
      for (let i = localRipples.length - 1; i >= 0; i--) {
        const rp = localRipples[i];
        const age = (now - rp.ts) / 340;
        if (age >= 1) {
          localRipples.splice(i, 1);
          continue;
        }
        tpCtx.beginPath();
        tpCtx.arc(rp.x, rp.y, 8 + age * 34, 0, Math.PI * 2);
        tpCtx.strokeStyle = `rgba(94, 106, 210, ${1 - age})`;
        tpCtx.lineWidth = 1.5;
        tpCtx.stroke();
      }

      tpCtx.restore();
    }
    requestAnimationFrame(renderLocalTrackpadLoop);
  }
  requestAnimationFrame(renderLocalTrackpadLoop);

  function toggleTrackpadMode(forceState) {
    trackpadOpen = typeof forceState === 'boolean' ? forceState : !trackpadOpen;
    trackpadModal.classList.toggle('open', trackpadOpen);
    const btn = thumbBar.querySelector('#og-btn-trackpad');
    if (btn) btn.classList.toggle('active', trackpadOpen);
    if (!trackpadOpen && laserHeld) {
      laserToggledLatched = false;
      setLaserActive(false);
    }
    if (trackpadOpen) {
      syncCoordReadout();
      emitRemoteCursor({ clicking: false, force: true });
    }
    return trackpadOpen;
  }

  // ==========================================================================
  // 4. Bezel Edge Selector Bottom Sheet (`transform: translate3d(0,0,0)`)
  // ==========================================================================
  const edgeBackdrop = document.createElement('div');
  edgeBackdrop.id = 'og-edge-backdrop';
  document.body.appendChild(edgeBackdrop);

  const edgeSheet = document.createElement('div');
  edgeSheet.id = 'og-edge-sheet';
  edgeSheet.innerHTML = `
    <div class="og-sheet-handle"></div>
    <div class="og-sheet-head">
      <div class="og-sheet-title-wrap">
        ${ICONS.edge}
        <h3>Dock Phone to Laptop Bezel</h3>
      </div>
      <button type="button" class="og-tp-close" id="og-sheet-close-btn">
        ${ICONS.close}
        <span>Done</span>
      </button>
    </div>
    <p class="og-sheet-sub">Select which MacBook display edge this device is resting against to align your NameDrop portal.</p>
    <div class="og-edge-grid">
      <button type="button" class="og-edge-option og-edge-btn" data-edge="top">
        <span class="og-edge-arrow">${ICONS.edgeTop}</span>
        <span>
          <span class="og-edge-title">Top Bezel</span>
          <span class="og-edge-desc">Above MacBook camera</span>
        </span>
      </button>
      <button type="button" class="og-edge-option og-edge-btn selected active" data-edge="right">
        <span class="og-edge-arrow">${ICONS.edgeRight}</span>
        <span>
          <span class="og-edge-title">Right Bezel</span>
          <span class="og-edge-desc">Right side of display</span>
        </span>
      </button>
      <button type="button" class="og-edge-option og-edge-btn" data-edge="left">
        <span class="og-edge-arrow">${ICONS.edgeLeft}</span>
        <span>
          <span class="og-edge-title">Left Bezel</span>
          <span class="og-edge-desc">Left side of display</span>
        </span>
      </button>
      <button type="button" class="og-edge-option og-edge-btn" data-edge="bottom">
        <span class="og-edge-arrow">${ICONS.edgeBottom}</span>
        <span>
          <span class="og-edge-title">Bottom Bezel</span>
          <span class="og-edge-desc">Below trackpad chin</span>
        </span>
      </button>
    </div>
    <div class="og-ratio-row">
      <label for="og-edge-ratio-slider">Bezel Offset</label>
      <input id="og-edge-ratio-slider" type="range" min="0.15" max="0.85" step="0.01" value="0.50">
      <span id="og-edge-ratio-val" class="og-ratio-val">50%</span>
    </div>
    <div class="og-auto-detect-row" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--og-border, rgba(255,255,255,0.08));">
      <button type="button" class="og-edge-btn og-auto-edge-btn" id="og-btn-auto-edge" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-weight: 500; font-size: 12px; background: rgba(94,106,210,0.18); border: 1px solid rgba(94,106,210,0.5); color: #e0e7ff; cursor: pointer;">
        ${ICONS.namedrop}
        <span>Auto-Detect Edge (Stereo Sonar / Gyro)</span>
      </button>
      <div style="font-size: 11px; color: var(--og-text-secondary, #8a8f98); text-align: center; margin-top: 6px;">
        1-Flick Auto-Detect: flick any card toward the docked edge
      </div>
    </div>
  `;
  document.body.appendChild(edgeSheet);

  const ratioSlider = edgeSheet.querySelector('#og-edge-ratio-slider');
  const ratioVal = edgeSheet.querySelector('#og-edge-ratio-val');

  function syncPhonePortalBar(laptopEdge) {
    const portal = document.getElementById('phone-top-portal');
    if (!portal) return;

    // Map laptop bezel edge to phone screen edge:
    // When phone is at laptop 'top', the bottom edge of the phone touches the laptop -> phone 'bottom'
    // When phone is at laptop 'bottom', the top edge of the phone touches the laptop -> phone 'top'
    // When phone is at laptop 'right', the left edge of the phone touches the laptop -> phone 'left'
    // When phone is at laptop 'left', the right edge of the phone touches the laptop -> phone 'right'
    let phoneSide = 'left';
    if (laptopEdge === 'top') phoneSide = 'bottom';
    else if (laptopEdge === 'bottom') phoneSide = 'top';
    else if (laptopEdge === 'left') phoneSide = 'right';
    else if (laptopEdge === 'right') phoneSide = 'left';

    portal.classList.remove('portal-side-top', 'portal-side-bottom', 'portal-side-left', 'portal-side-right');
    portal.classList.add(`portal-side-${phoneSide}`);

    if (phoneSide === 'bottom') {
      portal.style.top = 'auto';
      portal.style.bottom = '0';
      portal.style.left = '8%';
      portal.style.right = 'auto';
      portal.style.width = '84%';
      portal.style.height = '3px';
      portal.style.borderRadius = '99px 99px 0 0';
      portal.style.background = 'linear-gradient(90deg, transparent, var(--indigo, #5e6ad2), var(--cyan, #00e5ff), var(--amber, #f59e0b), transparent)';
      portal.style.boxShadow = '0 -2px 24px rgba(94, 106, 210, 0.75)';
    } else if (phoneSide === 'top') {
      portal.style.top = '0';
      portal.style.bottom = 'auto';
      portal.style.left = '8%';
      portal.style.right = 'auto';
      portal.style.width = '84%';
      portal.style.height = '3px';
      portal.style.borderRadius = '0 0 99px 99px';
      portal.style.background = 'linear-gradient(90deg, transparent, var(--indigo, #5e6ad2), var(--cyan, #00e5ff), var(--amber, #f59e0b), transparent)';
      portal.style.boxShadow = '0 2px 24px rgba(94, 106, 210, 0.75)';
    } else if (phoneSide === 'left') {
      portal.style.top = '8%';
      portal.style.bottom = 'auto';
      portal.style.left = '0';
      portal.style.right = 'auto';
      portal.style.width = '3px';
      portal.style.height = '84%';
      portal.style.borderRadius = '0 99px 99px 0';
      portal.style.background = 'linear-gradient(180deg, transparent, var(--indigo, #5e6ad2), var(--cyan, #00e5ff), var(--amber, #f59e0b), transparent)';
      portal.style.boxShadow = '2px 0 24px rgba(94, 106, 210, 0.75)';
    } else if (phoneSide === 'right') {
      portal.style.top = '8%';
      portal.style.bottom = 'auto';
      portal.style.left = 'auto';
      portal.style.right = '0';
      portal.style.width = '3px';
      portal.style.height = '84%';
      portal.style.borderRadius = '99px 0 0 99px';
      portal.style.background = 'linear-gradient(180deg, transparent, var(--indigo, #5e6ad2), var(--cyan, #00e5ff), var(--amber, #f59e0b), transparent)';
      portal.style.boxShadow = '-2px 0 24px rgba(94, 106, 210, 0.75)';
    }
  }

  function applyEdgeSync(edge, centerRatio) {
    if (!edge) return;
    currentEdge = edge;
    if (typeof centerRatio === 'number') {
      currentCenterRatio = centerRatio;
      if (ratioSlider) ratioSlider.value = String(centerRatio);
      if (ratioVal) ratioVal.textContent = `${Math.round(centerRatio * 100)}%`;
    }

    edgeSheet.querySelectorAll('.og-edge-option, .og-edge-btn').forEach((btn) => {
      const match = btn.getAttribute('data-edge') === edge;
      btn.classList.toggle('selected', match);
      btn.classList.toggle('active', match);
    });

    const peerLabel = document.getElementById('peer-label');
    if (peerLabel && isMobileContext()) {
      peerLabel.textContent = `Docked · ${edge.toUpperCase()} Bezel`;
    }

    syncPhonePortalBar(edge);
  }

  function selectEdge(edge, centerRatio = 0.5, closeAfter = false) {
    applyEdgeSync(edge, centerRatio);

    sendWs({
      type: 'update_strip',
      peerId: getSelfId(),
      edge,
      centerRatio,
    });

    if (closeAfter) {
      showToast(`Using the ${edge} edge`);
      setTimeout(() => openEdgeSheet(false), 140);
    }
  }

  edgeSheet.querySelectorAll('.og-edge-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic(14);
      const edge = btn.getAttribute('data-edge') || 'right';
      selectEdge(edge, 0.5, true);
    });
  });

  ratioSlider.addEventListener('input', () => {
    const val = parseFloat(ratioSlider.value) || 0.5;
    currentCenterRatio = val;
    ratioVal.textContent = `${Math.round(val * 100)}%`;
    sendWs({
      type: 'update_strip',
      peerId: getSelfId(),
      edge: currentEdge,
      centerRatio: val,
    });
  });
  function triggerAutoEdgeDetection() {
    haptic([18, 50, 18]);
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const actx = new AC();
        if (actx.state === 'suspended') actx.resume();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        const panner = actx.createStereoPanner ? actx.createStereoPanner() : null;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, actx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.0001, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, actx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.22);
        if (panner) {
          panner.pan.setValueAtTime(-1, actx.currentTime);
          panner.pan.linearRampToValueAtTime(1, actx.currentTime + 0.22);
          osc.connect(gain);
          gain.connect(panner);
          panner.connect(actx.destination);
        } else {
          osc.connect(gain);
          gain.connect(actx.destination);
        }
        osc.start();
        osc.stop(actx.currentTime + 0.25);
      }
    } catch {}

    let detectedEdge = 'right';
    if (window.DeviceOrientationEvent) {
      const orientHandler = (ev) => {
        window.removeEventListener('deviceorientation', orientHandler);
        const gamma = ev.gamma;
        const beta = ev.beta;
        if (typeof gamma === 'number') {
          if (gamma > 18) detectedEdge = 'right';
          else if (gamma < -18) detectedEdge = 'left';
          else if (typeof beta === 'number' && beta < 20) detectedEdge = 'top';
          else if (typeof beta === 'number' && beta > 65) detectedEdge = 'bottom';
        }
        selectEdge(detectedEdge, 0.5, true);
        showToast(`Using the ${detectedEdge} edge`);
      };
      window.addEventListener('deviceorientation', orientHandler, { once: true });
      setTimeout(() => {
        window.removeEventListener('deviceorientation', orientHandler);
        selectEdge(detectedEdge, 0.5, true);
        showToast(`Using the ${detectedEdge} edge`);
      }, 250);
    } else {
      selectEdge(detectedEdge, 0.5, true);
      showToast(`Using the ${detectedEdge} edge`);
    }

    sendWs({
      type: 'auto_edge_detected',
      edge: detectedEdge,
      source: 'Stereo Sonar / Gyro',
    });
  }

  const autoEdgeBtn = edgeSheet.querySelector('#og-btn-auto-edge');
  if (autoEdgeBtn) {
    autoEdgeBtn.addEventListener('click', triggerAutoEdgeDetection);
  }

  function handleCardFlickAutoEdge(phoneFlickDir) {
    let laptopEdge = 'right';
    if (phoneFlickDir === 'top') laptopEdge = 'bottom';
    else if (phoneFlickDir === 'bottom') laptopEdge = 'top';
    else if (phoneFlickDir === 'left') laptopEdge = 'right';
    else if (phoneFlickDir === 'right') laptopEdge = 'left';

    if (currentEdge !== laptopEdge) {
      selectEdge(laptopEdge, currentCenterRatio, false);
      showToast(`Set to the ${laptopEdge} edge`);
    }
  }

  function openEdgeSheet(forceState) {
    edgeSheetOpen = typeof forceState === 'boolean' ? forceState : !edgeSheetOpen;
    edgeBackdrop.classList.toggle('open', edgeSheetOpen);
    edgeSheet.classList.toggle('open', edgeSheetOpen);
    const btn = thumbBar.querySelector('#og-btn-edge');
    if (btn) btn.classList.toggle('active', edgeSheetOpen);

    // Sync current edge from peer list if available
    if (edgeSheetOpen) {
      const peers = typeof getPeers === 'function' ? getPeers() : [];
      const me = peers.find((p) => p.id === getSelfId());
      if (me && me.edge) {
        applyEdgeSync(me.edge, me.centerRatio ?? 0.5);
      }
    }
    return edgeSheetOpen;
  }

  edgeBackdrop.addEventListener('click', () => openEdgeSheet(false));
  edgeSheet.querySelector('#og-sheet-close-btn').addEventListener('click', () => openEdgeSheet(false));

  // Allow tapping the Dynamic Island on mobile to open the Edge Alignment sheet
  const dynamicIsland = document.querySelector('.dynamic-island');
  if (dynamicIsland) {
    dynamicIsland.style.cursor = 'pointer';
    dynamicIsland.addEventListener('click', () => {
      if (isMobileContext()) {
        haptic(10);
        openEdgeSheet();
      }
    });
  }

  // ==========================================================================
  // 5. Laptop-Side Remote Cursor & Glowing Laser Renderer
  // ==========================================================================
  const remoteLayer = document.createElement('div');
  remoteLayer.id = 'og-remote-cursor-layer';
  remoteLayer.innerHTML = `
    <canvas id="og-remote-trail-canvas"></canvas>
    <div id="og-remote-cursor">
      <div class="og-cursor-core"></div>
      <div class="og-cursor-tag" id="og-remote-cursor-tag">Phone</div>
    </div>
  `;
  document.body.appendChild(remoteLayer);

  const remoteTrailCanvas = remoteLayer.querySelector('#og-remote-trail-canvas');
  const remoteTrailCtx = remoteTrailCanvas.getContext('2d');
  const remoteCursorEl = remoteLayer.querySelector('#og-remote-cursor');
  const remoteCursorTag = remoteLayer.querySelector('#og-remote-cursor-tag');

  function highlightElementAtPoint(x, y) {
    // Spawn expanding click ripple ring
    const ripple = document.createElement('div');
    ripple.className = 'og-click-ripple';
    ripple.style.setProperty('--rx', `${Math.round(x)}px`);
    ripple.style.setProperty('--ry', `${Math.round(y)}px`);
    document.body.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) scale(1.65)`;
      ripple.style.opacity = '0';
    });
    setTimeout(() => ripple.remove(), 400);

    // Find the interactive element or card under (x, y)
    const hit = document.elementFromPoint(x, y);
    if (!hit || hit === document.body || hit === document.documentElement || hit.id === 'gl-canvas') {
      return;
    }

    const target =
      hit.closest('.file-card, .btn, .chip-btn, .bezel-strip, .dynamic-island, button, a') || hit;

    target.classList.add('og-remote-target-highlight');
    clearTimeout(target._ogHighlightTimer);
    target._ogHighlightTimer = setTimeout(() => {
      target.classList.remove('og-remote-target-highlight');
    }, 520);

    // If native OS cursor control is active, oneglass_os already posts a real macOS CGEvent click.
    if (typeof window !== 'undefined' && window.oneGlassNativeActive === true) {
      return;
    }

    // If the user remotely tapped a button or action chip, trigger its click
    const clickable = hit.closest('button, a.chip-btn');
    if (clickable) {
      clickable.click();
    }
  }
  function renderRemoteCursorLoop(now) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (remoteTrailCanvas.width !== W || remoteTrailCanvas.height !== H) {
      remoteTrailCanvas.width = W;
      remoteTrailCanvas.height = H;
    }

    remoteTrailCtx.clearRect(0, 0, W, H);

    const idleMs = now - remoteState.lastPacketTs;
    if (remoteState.active && idleMs > 3600) {
      remoteState.active = false;
      remoteCursorEl.classList.remove('visible', 'laser-active', 'clicking');
    }

    if (remoteState.active) {
      const isNativeActive = typeof window !== 'undefined' && window.oneGlassNativeActive === true;
      if (isNativeActive) {
        remoteCursorEl.style.display = 'none';
        remoteCursorEl.classList.remove('visible');
      } else {
        remoteCursorEl.style.display = '';
        // Smooth spring interpolation at 120Hz
        remoteState.x += (remoteState.targetX - remoteState.x) * 0.42;
        remoteState.y += (remoteState.targetY - remoteState.y) * 0.42;
        remoteCursorEl.style.transform = `translate3d(${remoteState.x.toFixed(1)}px, ${remoteState.y.toFixed(1)}px, 0)`;
      }
      // Prune trail points older than 380ms
      const maxAge = remoteState.laser ? 420 : 220;
      while (remoteState.trail.length > 0 && now - remoteState.trail[0].ts > maxAge) {
        remoteState.trail.shift();
      }

      if (remoteState.trail.length > 1) {
        for (let i = 1; i < remoteState.trail.length; i++) {
          const p0 = remoteState.trail[i - 1];
          const p1 = remoteState.trail[i];
          const age = (now - p1.ts) / maxAge;
          const alpha = Math.max(0, 1 - age);

          remoteTrailCtx.beginPath();
          remoteTrailCtx.moveTo(p0.x, p0.y);
          remoteTrailCtx.lineTo(p1.x, p1.y);
          remoteTrailCtx.lineCap = 'round';

          if (p1.laser) {
            const isCyan = p1.color === 'cyan';
            remoteTrailCtx.strokeStyle = isCyan
              ? `rgba(94, 106, 210, ${alpha * 0.92})`
              : `rgba(229, 72, 77, ${alpha * 0.92})`;
            remoteTrailCtx.lineWidth = (1 - age) * 9 + 2;
            remoteTrailCtx.shadowColor = isCyan ? '#5e6ad2' : '#e5484d';
            remoteTrailCtx.shadowBlur = 16;
          } else {
            remoteTrailCtx.strokeStyle = `rgba(94, 106, 210, ${alpha * 0.48})`;
            remoteTrailCtx.lineWidth = (1 - age) * 3.5 + 1;
            remoteTrailCtx.shadowBlur = 0;
          }
          remoteTrailCtx.stroke();
        }
        remoteTrailCtx.shadowBlur = 0;
      }
    }

    requestAnimationFrame(renderRemoteCursorLoop);
  }
  requestAnimationFrame(renderRemoteCursorLoop);

  async function invokeNativeShare(card) {
    if (!card) return false;
    const title = card.name || card.title || 'OneGlass File';
    const url = card.url;

    if (typeof navigator !== 'undefined' && navigator.share && url) {
      try {
        showToast?.('Getting it ready to share');
        const resp = await fetch(url);
        const blob = await resp.blob();
        const mime = blob.type || card.mime || 'application/octet-stream';
        const ext = (card.ext || (card.name ? card.name.split('.').pop() : 'bin')).toLowerCase();
        const filename = card.name || `photo.${ext}`;
        const file = new File([blob], filename, { type: mime });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title,
          });
          showToast?.('Shared');
          return true;
        }
      } catch (err) {
        if (err.name === 'AbortError') return false;
        console.warn('Native file share failed:', err);
      }
    }

    if (typeof navigator !== 'undefined' && navigator.share && (url || card.textSnippet || card.noteText)) {
      try {
        await navigator.share({
          title: title,
          text: card.textSnippet || card.noteText || title,
          url: url ? (url.startsWith('http') ? url : window.location.origin + url) : undefined,
        });
        showToast?.('Shared');
        return true;
      } catch (err) {
        if (err.name === 'AbortError') return false;
        console.warn('Native url share failed:', err);
      }
    }

    if (url) {
      const dlUrl = url.includes('?') ? `${url}&dl=1` : `${url}?dl=1`;
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = card.name || 'oneglass_download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast?.('Downloaded to device');
      return true;
    }
    return false;
  }
  if (typeof window !== 'undefined') {
    window.invokeNativeShare = invokeNativeShare;
  }

  function openShareSheetSetupModalLocal() {
    if (typeof window !== 'undefined' && typeof window.openShareSheetSetupModal === 'function') {
      window.openShareSheetSetupModal();
      return;
    }
    let localModal = document.getElementById('sharesheet-setup-modal');
    if (!localModal) {
      localModal = document.createElement('div');
      localModal.id = 'sharesheet-setup-modal';
      localModal.className = 'sharesheet-modal-backdrop';
      const origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
      const token = (typeof window !== 'undefined' && window.sessionToken) ? window.sessionToken : '';
      const beamUrl = `${origin}/api/beam${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      localModal.innerHTML = `
        <div class="sharesheet-card">
          <div class="sharesheet-head">
            <div class="sharesheet-title-wrap">
              ${ICONS.sharesheet}
              <h3>1-Tap OS Share Sheet</h3>
            </div>
            <button type="button" class="sharesheet-close-btn" id="og-local-ss-close" title="Close">
              ${ICONS.close}
            </button>
          </div>
          <p class="sharesheet-sub">Beam photos & files from your phone's native Gallery or Files directly to your computer's clipboard (⌘V / Ctrl+V).</p>
          <div class="sharesheet-sections">
            <div class="sharesheet-section-card">
              <div class="sharesheet-section-badge android-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
                <span>Android</span>
              </div>
              <p class="sharesheet-text">Tap <strong>Add to Home Screen</strong>. OneGlass then shows up in the Android share menu in Photos and Files.</p>
            </div>
            <div class="sharesheet-section-card">
              <div class="sharesheet-section-badge ios-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>
                <span>iPhone / iPad</span>
              </div>
              <p class="sharesheet-text">Use our 1-tap Share URL (<code>POST /api/beam</code>) in iOS Shortcuts or Action Button to beam photos straight from iOS Photos to your PC's clipboard (⌘V / Ctrl+V).</p>
              <div class="sharesheet-beam-row">
                <div class="sharesheet-beam-url" id="beam-endpoint-url-display">${beamUrl}</div>
                <button type="button" class="btn primary copy-beam-btn" id="og-local-copy-beam">Copy Beam Endpoint URL</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(localModal);
      localModal.querySelector('#og-local-ss-close')?.addEventListener('click', () => localModal.classList.remove('open'));
      localModal.addEventListener('click', (e) => { if (e.target === localModal) localModal.classList.remove('open'); });
      localModal.querySelector('#og-local-copy-beam')?.addEventListener('click', () => {
        navigator.clipboard?.writeText(beamUrl);
        showToast?.('Link copied');
      });
    }
    localModal.classList.add('open');
  }
  function handleMobileMessage(msg) {
    if (!msg || typeof msg !== 'object') return false;
    if (msg.type === 'card_land' || msg.type === 'card_flick') {
      if (isMobileContext() && msg.item) {
        invokeNativeShare(msg.item).catch(() => {});
      }
    }

    if (msg.type === 'strip_updated') {
      const myId = getSelfId?.() ?? (typeof window !== 'undefined' ? window.selfId : null);
      if (!msg.peerId || msg.peerId === myId) {
        applyEdgeSync(msg.edge, msg.centerRatio);
        return true;
      }
    }

    if (msg.type === 'peers' && Array.isArray(msg.peers)) {
      const myId = getSelfId?.() ?? (typeof window !== 'undefined' ? window.selfId : null);
      const me =
        msg.peers.find((p) => p.id === myId) ||
        (getRole?.() === 'phone' || (typeof window !== 'undefined' && window.ROLE === 'phone')
          ? msg.peers.find((p) => p.role === 'phone')
          : null);
      if (me && me.edge) {
        applyEdgeSync(me.edge, me.centerRatio);
      }
    }

    if (msg.type === 'remote_cursor') {
      const isNativeActive = typeof window !== 'undefined' && window.oneGlassNativeActive === true;
      const now = performance.now();
      const xRatio = Math.max(0, Math.min(1, Number(msg.xRatio ?? 0.5)));
      const yRatio = Math.max(0, Math.min(1, Number(msg.yRatio ?? 0.5)));
      const targetX = xRatio * window.innerWidth;
      const targetY = yRatio * window.innerHeight;

      if (!remoteState.active) {
        remoteState.x = targetX;
        remoteState.y = targetY;
      }
      remoteState.active = true;
      remoteState.targetX = targetX;
      remoteState.targetY = targetY;
      remoteState.laser = Boolean(msg.laser);
      remoteState.color = msg.color || 'red';
      remoteState.lastPacketTs = now;

      if (msg.fromName) {
        remoteState.peerName = msg.fromName;
      }

      remoteState.trail.push({
        x: targetX,
        y: targetY,
        laser: remoteState.laser,
        color: remoteState.color,
        ts: now,
      });
      if (remoteState.trail.length > 48) remoteState.trail.shift();

      if (isNativeActive) {
        remoteCursorEl.style.display = 'none';
        remoteCursorEl.classList.remove('visible');
      } else {
        remoteCursorEl.style.display = '';
        remoteCursorEl.classList.add('visible');
        remoteCursorEl.classList.toggle('laser-active', remoteState.laser);
        remoteCursorTag.textContent = remoteState.laser
          ? `${remoteState.peerName} · Laser`
          : `${remoteState.peerName}`;
      }

      if (msg.clicking) {
        if (!isNativeActive) {
          remoteCursorEl.classList.add('clicking');
          clearTimeout(remoteCursorEl._clickTimer);
          remoteCursorEl._clickTimer = setTimeout(() => {
            remoteCursorEl.classList.remove('clicking');
          }, 160);
        }
        highlightElementAtPoint(targetX, targetY);
      }
      return true;
    }

    return false;
  }

  // ==========================================================================
  // 6. Responsive Viewport & Role Sync
  // ==========================================================================
  function syncResponsiveMode() {
    const mobile = isMobileContext();
    document.body.classList.toggle('og-mobile-mode', mobile);
  }

  syncResponsiveMode();
  syncPhonePortalBar(currentEdge);
  window.addEventListener('resize', syncResponsiveMode);

  // ==========================================================================
  // Background Lifecycle Resilience: Audio Keep-Alive, WakeLock & Fast Reconnect
  // ==========================================================================
  let wakeLockSentinel = null;
  let keepAliveAudio = null;

  function acquireWakeLock() {
    navigator.wakeLock?.request('screen')
      .then((wl) => {
        wakeLockSentinel = wl;
        wl.addEventListener('release', () => {
          wakeLockSentinel = null;
        });
      })
      .catch(() => {});
  }

  function startKeepAliveAudio() {
    if (keepAliveAudio) {
      if (keepAliveAudio.ctx && keepAliveAudio.ctx.state === 'suspended') {
        keepAliveAudio.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.00001, ctx.currentTime);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(32, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      keepAliveAudio = { ctx, gain, osc };
    } catch {}
  }

  function persistMobileSession() {
    try {
      const existingRaw = localStorage.getItem('oneglass_session_state');
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const updated = {
        ...existing,
        currentEdge,
        centerRatio: currentCenterRatio,
        savedAt: Date.now(),
      };
      localStorage.setItem('oneglass_session_state', JSON.stringify(updated));
    } catch {}
  }

  function restoreMobileSession() {
    try {
      const raw = localStorage.getItem('oneglass_session_state');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.currentEdge) {
        applyEdgeSync(data.currentEdge, typeof data.centerRatio === 'number' ? data.centerRatio : 0.5);
      }
    } catch {}
  }

  restoreMobileSession();

  function onResume() {
    acquireWakeLock();
    startKeepAliveAudio();
    const sock = typeof getWs === 'function' ? getWs() : null;
    if (!sock || sock.readyState === WebSocket.CLOSED || sock.readyState === WebSocket.CLOSING) {
      window.connectWS?.();
    } else if (sock.readyState === WebSocket.OPEN) {
      sendWs({
        type: 'update_strip',
        peerId: getSelfId(),
        edge: currentEdge,
        centerRatio: currentCenterRatio,
      });
    }
    window.flushQueuedTransfers?.();
    window.oneGlassWebRTC?.reconnect?.();
  }

  const onFirstGesture = () => {
    acquireWakeLock();
    startKeepAliveAudio();
    window.removeEventListener('touchstart', onFirstGesture);
    window.removeEventListener('pointerdown', onFirstGesture);
  };
  window.addEventListener('touchstart', onFirstGesture, { passive: true });
  window.addEventListener('pointerdown', onFirstGesture, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      onResume();
    } else {
      persistMobileSession();
    }
  });
  window.addEventListener('pageshow', onResume);
  window.addEventListener('focus', onResume);

  return {
    handleMobileMessage,
    toggleTrackpadMode,
    openEdgeSheet,
    openToolsSheet,
    syncPhonePortalBar,
    applyEdgeSync,
    handleCardFlickAutoEdge,
    persistMobileSession,
    triggerAutoEdgeDetection,
    invokeNativeShare,
    openShareSheetSetupModal: openShareSheetSetupModalLocal,
    openShareSheetSetupModalLocal,
  };
}
