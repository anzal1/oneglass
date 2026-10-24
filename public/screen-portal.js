/**
 * OneGlass — Live Screen Portal & Wireless Second Monitor (Linear Studio Edition)
 * Standalone browser ES module with zero external dependencies.
 *
 * Exports:
 *   initScreenPortal({ getWs, getRole, getPeers, getSelfId, showToast })
 *   -> { openScreenPortal, handleScreenPortalMessage }
 *
 * Design Engineering (Linear Studio + Emil Kowalski Motion Rules):
 *   - Obsidian surface (#0b0c0e), 1px solid rgba(255, 255, 255, 0.08) borders
 *   - Zero emojis; crisp 14x14 stroke-width="1.5" inline SVG iconography
 *   - tabular-nums telemetry readouts (FPS, Bitrate, Resolution, Latency)
 *   - Explicit property transitions only (no `transition: all`)
 *   - Tactile press feedback `:active { transform: scale(0.97) }`
 *   - Motion curve `cubic-bezier(0.23, 1, 0.32, 1)`
 */

const STYLE_ID = 'og-screen-portal-styles';
const MODAL_ID = 'og-screen-portal';
const PHONE_HUD_ID = 'og-screen-portal-phone-hud';
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

const ICONS = {
  portal: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="2.25" width="11" height="7.75" rx="1.5"/><path d="M4.75 12h4.5M7 10v2"/><path d="M4.25 5.25h5.5M4.25 7.25h3.25"/></svg>`,
  capture: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 2H2.75A.75.75 0 0 0 2 2.75V4.5M9.5 2h1.75a.75.75 0 0 1 .75.75V4.5M2 9.5v1.75c0 .414.336.75.75.75H4.5M12 9.5v1.75a.75.75 0 0 1-.75.75H9.5"/><rect x="4.5" y="4.5" width="5" height="5" rx="1"/></svg>`,
  crop: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.75 1.5v7.75a1 1 0 0 0 1 1H12.5"/><path d="M1.5 3.75h7.75a1 1 0 0 1 1 1V12.5"/></svg>`,
  broadcast: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="1.5"/><path d="M4.35 9.65a3.75 3.75 0 0 1 0-5.3M9.65 4.35a3.75 3.75 0 0 1 0 5.3M2.25 11.75a6.75 6.75 0 0 1 0-9.5M11.75 2.25a6.75 6.75 0 0 1 0 9.5"/></svg>`,
  stop: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.25" y="3.25" width="7.5" height="7.5" rx="1.25"/></svg>`,
  phone: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.75" y="1.5" width="6.5" height="11" rx="1.5"/><path d="M6.25 10.5h1.5"/></svg>`,
  pip: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="2.25" width="11" height="9.5" rx="1.5"/><rect x="7" y="6.75" width="4.25" height="3.5" rx="0.75"/></svg>`,
  expand: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 2H12v3.5M12 2L8 6M5.5 12H2V8.5M2 12l4-4"/></svg>`,
  reset: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5A4.5 4.5 0 1 1 4 10.2"/><polyline points="2.5,3 2.5,6.5 6,6.5"/></svg>`,
  radar: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="5.25"/><circle cx="7" cy="7" r="2.25"/><path d="M7 7l3.7-3.7"/></svg>`,
  fit: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="10" height="8" rx="1.25"/><path d="M4.5 5.5h5v3h-5z"/></svg>`,
  pause: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3.25v7.5M9 3.25v7.5"/></svg>`,
  play: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="4.25,2.75 11.25,7 4.25,11.25"/></svg>`,
  close: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7"/></svg>`,
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
let activeScreenPortalInstance = null;

function injectScreenPortalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${MODAL_ID} {
      position: fixed;
      inset: 0;
      z-index: 70;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(5, 6, 8, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 220ms ${EASE_OUT};
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      color: #f2f3f5;
      user-select: none;
      -webkit-user-select: none;
    }

    #${MODAL_ID}.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    .og-sp-dialog {
      width: min(920px, calc(100vw - 32px));
      max-height: calc(100vh - 36px);
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        0 28px 72px rgba(0, 0, 0, 0.82);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translate3d(0, 10px, 0) scale(0.985);
      transition:
        transform 240ms ${EASE_OUT},
        border-color 200ms ${EASE_OUT},
        box-shadow 200ms ${EASE_OUT};
    }

    #${MODAL_ID}.is-open .og-sp-dialog {
      transform: translate3d(0, 0, 0) scale(1);
    }

    .og-sp-dialog.is-streaming {
      border-color: rgba(94, 106, 210, 0.42);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 0 0 1px rgba(56, 189, 248, 0.14),
        0 28px 72px rgba(0, 0, 0, 0.86);
    }

    .og-sp-header {
      height: 44px;
      padding: 0 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.015);
      flex-shrink: 0;
    }

    .og-sp-brand {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
    }

    .og-sp-brand-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: rgba(94, 106, 210, 0.14);
      border: 1px solid rgba(94, 106, 210, 0.34);
      color: #a5b4fc;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .og-sp-title {
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #f4f5f8;
      white-space: nowrap;
    }

    .og-sp-subtitle {
      font-size: 11.5px;
      color: #8a8f98;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .og-sp-telemetry {
      display: flex;
      align-items: center;
      gap: 8px;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .og-sp-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 24px;
      padding: 0 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font: 500 11px/1 "JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace;
      font-variant-numeric: tabular-nums;
      color: #c9ced8;
      white-space: nowrap;
    }

    .og-sp-pill.is-live {
      background: rgba(56, 189, 248, 0.1);
      border-color: rgba(56, 189, 248, 0.3);
      color: #7dd3fc;
    }

    .og-sp-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #636872;
      transition: background-color 180ms ${EASE_OUT}, box-shadow 180ms ${EASE_OUT};
    }

    .og-sp-pill.is-live .og-sp-dot {
      background: #38bdf8;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
    }

    .og-sp-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: #0b0c0e;
      flex-shrink: 0;
    }

    .og-sp-group {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }

    .og-sp-label {
      font-size: 11px;
      font-weight: 500;
      color: #8a8f98;
      letter-spacing: -0.01em;
      margin-right: 2px;
    }

    .og-sp-btn {
      appearance: none;
      height: 28px;
      padding: 0 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.035);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
      color: #d6dae1;
      font-family: inherit;
      font-size: 11.5px;
      font-weight: 500;
      letter-spacing: -0.01em;
      font-variant-numeric: tabular-nums;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition:
        transform 150ms ${EASE_OUT},
        background-color 160ms ${EASE_OUT},
        border-color 160ms ${EASE_OUT},
        color 160ms ${EASE_OUT},
        box-shadow 160ms ${EASE_OUT};
    }

    @media (hover: hover) and (pointer: fine) {
      .og-sp-btn:hover {
        background: rgba(255, 255, 255, 0.075);
        border-color: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
    }

    .og-sp-btn:active {
      transform: scale(0.97);
    }

    .og-sp-btn.is-active {
      background: rgba(94, 106, 210, 0.2);
      border-color: rgba(94, 106, 210, 0.55);
      color: #ffffff;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        0 0 14px rgba(94, 106, 210, 0.22);
    }

    .og-sp-btn.is-primary {
      background: #5e6ad2;
      border-color: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }

    @media (hover: hover) and (pointer: fine) {
      .og-sp-btn.is-primary:hover {
        background: #6b76df;
      }
    }

    .og-sp-btn.is-danger {
      background: rgba(239, 68, 68, 0.14);
      border-color: rgba(239, 68, 68, 0.36);
      color: #fca5a5;
    }

    .og-sp-select {
      appearance: none;
      height: 28px;
      padding: 0 24px 0 9px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background-color: rgba(255, 255, 255, 0.035);
      background-image: linear-gradient(45deg, transparent 50%, #8a8f98 50%), linear-gradient(135deg, #8a8f98 50%, transparent 50%);
      background-position: calc(100% - 12px) 11px, calc(100% - 8px) 11px;
      background-size: 4px 4px, 4px 4px;
      background-repeat: no-repeat;
      color: #e2e5ec;
      font-family: inherit;
      font-size: 11.5px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      outline: none;
      transition:
        transform 150ms ${EASE_OUT},
        border-color 160ms ${EASE_OUT},
        background-color 160ms ${EASE_OUT};
    }

    .og-sp-select:active {
      transform: scale(0.97);
    }

    .og-sp-icon-btn {
      width: 26px;
      height: 26px;
      padding: 0;
      justify-content: center;
    }

    .og-sp-stage-wrap {
      position: relative;
      height: min(500px, 58vh);
      background:
        radial-gradient(circle at 50% 50%, rgba(94, 106, 210, 0.08), transparent 70%),
        #07080a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 18px;
    }

    .og-sp-viewport {
      position: relative;
      max-width: 100%;
      max-height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: #0b0c0e;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.65);
      overflow: hidden;
      touch-action: none;
    }

    .og-sp-video {
      display: block;
      max-width: min(860px, calc(100vw - 80px));
      max-height: calc(min(500px, 58vh) - 38px);
      width: auto;
      height: auto;
      object-fit: contain;
      pointer-events: none;
      background: #090a0c;
    }

    .og-sp-crop-layer {
      position: absolute;
      inset: 0;
      pointer-events: auto;
      touch-action: none;
    }

    .og-sp-crop-box {
      position: absolute;
      border: 1.5px solid #38bdf8;
      box-shadow:
        0 0 0 9999px rgba(6, 7, 9, 0.66),
        0 0 18px rgba(56, 189, 248, 0.25),
        inset 0 0 0 1px rgba(255, 255, 255, 0.14);
      cursor: move;
      touch-action: none;
    }

    .og-sp-crop-grid {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
      background-size: 33.333% 33.333%;
      opacity: 0.65;
    }

    .og-sp-crop-badge {
      position: absolute;
      left: 8px;
      top: 8px;
      padding: 3px 7px;
      border-radius: 5px;
      background: rgba(11, 12, 14, 0.88);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #e0f2fe;
      font: 500 10.5px/1.2 "JetBrains Mono", "SF Mono", ui-monospace, monospace;
      font-variant-numeric: tabular-nums;
      pointer-events: none;
      white-space: nowrap;
    }

    .og-sp-handle {
      position: absolute;
      width: 11px;
      height: 11px;
      border-radius: 3px;
      background: #0b0c0e;
      border: 1.5px solid #38bdf8;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
      transition: transform 140ms ${EASE_OUT}, background-color 140ms ${EASE_OUT};
    }

    .og-sp-handle:hover {
      background: #38bdf8;
      transform: scale(1.15);
    }

    .og-sp-handle:active {
      transform: scale(0.97);
    }

    .og-sp-handle[data-handle="nw"] { top: -6px; left: -6px; cursor: nwse-resize; }
    .og-sp-handle[data-handle="n"]  { top: -6px; left: calc(50% - 5.5px); cursor: ns-resize; }
    .og-sp-handle[data-handle="ne"] { top: -6px; right: -6px; cursor: nesw-resize; }
    .og-sp-handle[data-handle="e"]  { top: calc(50% - 5.5px); right: -6px; cursor: ew-resize; }
    .og-sp-handle[data-handle="se"] { bottom: -6px; right: -6px; cursor: nwse-resize; }
    .og-sp-handle[data-handle="s"]  { bottom: -6px; left: calc(50% - 5.5px); cursor: ns-resize; }
    .og-sp-handle[data-handle="sw"] { bottom: -6px; left: -6px; cursor: nesw-resize; }
    .og-sp-handle[data-handle="w"]  { top: calc(50% - 5.5px); left: -6px; cursor: ew-resize; }

    .og-sp-radar-overlay {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 4;
    }

    .og-sp-footer {
      height: 40px;
      padding: 0 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.015);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 11.5px;
      color: #8a8f98;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .og-sp-footer-hint {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ======================================================================
       Phone side: second screen view
       ====================================================================== */
    #${PHONE_HUD_ID} {
      position: fixed;
      inset: 0;
      z-index: 70;
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f2f3f5;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      font-variant-numeric: tabular-nums;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translate3d(0, 12px, 0) scale(0.985);
      transition:
        opacity 220ms ${EASE_OUT},
        transform 240ms ${EASE_OUT},
        border-radius 220ms ${EASE_OUT},
        box-shadow 220ms ${EASE_OUT};
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }

    #${PHONE_HUD_ID}.is-visible {
      opacity: 1;
      pointer-events: auto;
      transform: translate3d(0, 0, 0) scale(1);
    }

    #${PHONE_HUD_ID}.is-pip {
      inset: auto;
      right: 14px;
      bottom: max(18px, env(safe-area-inset-bottom, 14px));
      width: min(320px, calc(100vw - 28px));
      height: 214px;
      border-radius: 12px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 24px 60px rgba(0, 0, 0, 0.85);
    }

    .og-pm-topbar {
      height: 42px;
      padding: max(0px, env(safe-area-inset-top, 0px)) 12px 0 12px;
      min-height: 42px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      background: rgba(11, 12, 14, 0.92);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 3;
      flex-shrink: 0;
    }

    .og-pm-canvas-stage {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #060709;
      touch-action: none;
      cursor: crosshair;
    }

    .og-pm-transform-layer {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      max-height: 100%;
      transform-origin: center center;
      will-change: transform;
    }

    .og-pm-image {
      display: block;
      max-width: 100vw;
      max-height: calc(100vh - 84px);
      width: auto;
      height: auto;
      object-fit: contain;
      pointer-events: none;
      border-radius: 4px;
    }

    #${PHONE_HUD_ID}.is-pip .og-pm-image {
      max-width: 100%;
      max-height: 168px;
    }

    #${PHONE_HUD_ID}.is-cover .og-pm-image {
      width: 100vw;
      height: calc(100vh - 84px);
      object-fit: cover;
    }

    .og-pm-ping {
      position: absolute;
      width: 28px;
      height: 28px;
      margin-left: -14px;
      margin-top: -14px;
      border-radius: 50%;
      border: 1.5px solid #38bdf8;
      background: rgba(56, 189, 248, 0.22);
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.75);
      pointer-events: none;
      transform: scale(0.25);
      opacity: 1;
      transition:
        transform 520ms ${EASE_OUT},
        opacity 520ms ${EASE_OUT};
    }

    .og-pm-ping.is-expanding {
      transform: scale(2.35);
      opacity: 0;
    }

    .og-pm-bottombar {
      height: 40px;
      padding: 0 12px max(0px, env(safe-area-inset-bottom, 0px)) 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      background: rgba(11, 12, 14, 0.92);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      color: #8a8f98;
      z-index: 3;
      flex-shrink: 0;
    }

    #${PHONE_HUD_ID}.is-pip .og-pm-bottombar {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

export function initScreenPortal({
  getWs = () => null,
  getRole = () => 'laptop',
  getPeers = () => [],
  getSelfId = () => null,
  showToast = () => {},
} = {}) {
  injectScreenPortalStyles();

  // ==========================================================================
  // Shared State
  // ==========================================================================
  let modalEl = null;
  let videoEl = null;
  let mediaStream = null;
  let usingSyntheticStream = false;
  let syntheticCanvas = null;
  let syntheticCtx = null;

  // Normalized crop rectangle [0..1]
  const crop = { x: 0, y: 0, w: 1, h: 1 };
  let activePreset = 'full';
  let targetPeerId = 'all';
  let targetFps = 18;
  let jpegQuality = 0.68;
  let isStreaming = false;
  let streamTimer = null;
  let radarRafId = null;

  // Encoder canvas for low-latency JPEG frames
  const captureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const captureCtx = captureCanvas ? captureCanvas.getContext('2d', { alpha: false }) : null;

  // Telemetry state (laptop)
  let framesSentWindow = [];
  let bytesSentWindow = [];
  let lastStreamWidth = 0;
  let lastStreamHeight = 0;

  // Remote radar pings on the laptop preview
  const remoteTapPings = [];

  // Phone Wireless Second Monitor HUD state
  let phoneHudEl = null;
  let phoneImgEl = null;
  let phoneStatusPill = null;
  let phoneFpsPill = null;
  let phoneResLabel = null;
  let phoneTransformLayer = null;
  let phoneIsPip = false;
  let phoneIsCover = false;
  let phoneIsFrozen = false;
  let phoneZoom = 1;
  let phonePanX = 0;
  let phonePanY = 0;
  let phoneFrameTimes = [];
  let phoneLastLatencyMs = 0;

  function sendWsMessage(payload) {
    if (!payload || typeof payload !== 'object') return false;

    // Route screen_portal_frame and screen_portal_tap through WebRTC P2P fast-telemetry if connected
    if (payload.type === 'screen_portal_frame' || payload.type === 'screen_portal_tap') {
      try {
        if (
          typeof window !== 'undefined' &&
          window.oneGlassP2P &&
          typeof window.oneGlassP2P.isConnected === 'function' &&
          window.oneGlassP2P.isConnected()
        ) {
          const sent = window.oneGlassP2P.sendP2P(payload, 'fast-telemetry');
          if (sent) return true;
        }
      } catch {}
    }

    const ws = typeof getWs === 'function' ? getWs() : null;
    if (!ws || ws.readyState !== 1) return false;
    // Prevent socket buffer build-up on slow links
    if (typeof ws.bufferedAmount === 'number' && ws.bufferedAmount > 512 * 1024 && payload.type === 'screen_portal_frame') {
      return false;
    }
    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // Synthetic Studio Test Surface (Fallback if getDisplayMedia is denied/headless)
  // ==========================================================================
  function ensureSyntheticSurface() {
    if (!syntheticCanvas) {
      syntheticCanvas = document.createElement('canvas');
      syntheticCanvas.width = 1280;
      syntheticCanvas.height = 720;
      syntheticCtx = syntheticCanvas.getContext('2d');
    }
  }

  function renderSyntheticSurfaceFrame(now = performance.now()) {
    ensureSyntheticSurface();
    const ctx = syntheticCtx;
    const W = syntheticCanvas.width;
    const H = syntheticCanvas.height;
    const t = now * 0.001;

    ctx.fillStyle = '#0b0c0e';
    ctx.fillRect(0, 0, W, H);

    // Subtle engineering grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Animated telemetry waveform
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 80; x <= W - 80; x += 8) {
      const u = (x - 80) / (W - 160);
      const y = H * 0.52 + Math.sin(u * 10 + t * 3.2) * 74 * Math.cos(u * 4 - t * 1.4);
      if (x === 80) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Secondary harmonic
    ctx.strokeStyle = '#5e6ad2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 80; x <= W - 80; x += 8) {
      const u = (x - 80) / (W - 160);
      const y = H * 0.52 + Math.cos(u * 8 - t * 2.4) * 48;
      if (x === 80) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Header frame HUD
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Inter", monospace';
    ctx.fillText('ONEGLASS STUDIO · LIVE PORTAL SURFACE', 80, 92);

    ctx.fillStyle = '#8a8f98';
    ctx.font = '500 15px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(
      `CROP [${Math.round(crop.x * 100)}%, ${Math.round(crop.y * 100)}% · ${Math.round(crop.w * 100)}%×${Math.round(crop.h * 100)}%]   TS ${Date.now()}`,
      80,
      124,
    );
  }

  // ==========================================================================
  // 1. Laptop Side — Live Screen/Window Capture & Region Cropper
  // ==========================================================================
  function ensureLaptopModal() {
    if (modalEl && document.body.contains(modalEl)) {
      refreshPeerDropdown();
      return modalEl;
    }

    modalEl = document.createElement('div');
    modalEl.id = MODAL_ID;
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-label', 'OneGlass Screen Portal');

    modalEl.innerHTML = `
      <div class="og-sp-dialog" data-role="dialog">
        <div class="og-sp-header">
          <div class="og-sp-brand">
            <span class="og-sp-brand-icon">${ICONS.portal}</span>
            <span class="og-sp-title">Show a window</span>
            <span class="og-sp-subtitle" data-role="source-label">Live Region Streamer &amp; Remote Touch Radar</span>
          </div>
          <div class="og-sp-telemetry">
            <span class="og-sp-pill" data-role="live-pill">
              <span class="og-sp-dot"></span>
              <span data-role="fps-readout">0 FPS</span>
            </span>
            <span class="og-sp-pill" data-role="bitrate-readout">0 kbps</span>
            <span class="og-sp-pill" data-role="res-readout">0×0</span>
            <button type="button" class="og-sp-btn og-sp-icon-btn" data-action="close" title="Close Screen Portal">
              ${ICONS.close}
            </button>
          </div>
        </div>

        <div class="og-sp-toolbar">
          <div class="og-sp-group">
            <button type="button" class="og-sp-btn is-primary" data-action="pick-source">
              ${ICONS.capture}
              <span>Choose a window</span>
            </button>
            <button type="button" class="og-sp-btn" data-action="toggle-stream">
              ${ICONS.broadcast}
              <span data-role="stream-btn-text">Showing now</span>
            </button>
          </div>

          <div class="og-sp-group">
            <span class="og-sp-label">Crop</span>
            <button type="button" class="og-sp-btn is-active" data-preset="full">Full 1:1</button>
            <button type="button" class="og-sp-btn" data-preset="phone">Phone 9:16</button>
            <button type="button" class="og-sp-btn" data-preset="left">Left 50%</button>
            <button type="button" class="og-sp-btn" data-preset="right">Right 50%</button>
            <button type="button" class="og-sp-btn" data-preset="center">Center Focus</button>
          </div>

          <div class="og-sp-group">
            <span class="og-sp-label">Target</span>
            <select class="og-sp-select" data-role="target-select" aria-label="Target Phone">
              <option value="all">All paired phones</option>
            </select>
            <select class="og-sp-select" data-role="fps-select" aria-label="Target Frame Rate">
              <option value="18" selected>18 FPS · 0.68 JPEG</option>
              <option value="20">20 FPS · Ultra</option>
              <option value="15">15 FPS · Eco</option>
            </select>
          </div>
        </div>

        <div class="og-sp-stage-wrap">
          <div class="og-sp-viewport" data-role="viewport">
            <video class="og-sp-video" data-role="video" autoplay muted playsinline></video>
            <div class="og-sp-crop-layer" data-role="crop-layer">
              <div class="og-sp-crop-box" data-role="crop-box">
                <div class="og-sp-crop-grid"></div>
                <div class="og-sp-crop-badge" data-role="crop-badge">100% × 100%</div>
                <div class="og-sp-handle" data-handle="nw"></div>
                <div class="og-sp-handle" data-handle="n"></div>
                <div class="og-sp-handle" data-handle="ne"></div>
                <div class="og-sp-handle" data-handle="e"></div>
                <div class="og-sp-handle" data-handle="se"></div>
                <div class="og-sp-handle" data-handle="s"></div>
                <div class="og-sp-handle" data-handle="sw"></div>
                <div class="og-sp-handle" data-handle="w"></div>
              </div>
            </div>
            <canvas class="og-sp-radar-overlay" data-role="radar-canvas"></canvas>
          </div>
        </div>

        <div class="og-sp-footer">
          <div class="og-sp-footer-hint">
            ${ICONS.crop}
            <span data-role="footer-status">Drag handles to crop any terminal, chart, Figma frame, or mobile preview. Phone taps ping live radar.</span>
          </div>
          <div class="og-sp-telemetry">
            <span data-role="tap-readout">Last tap: none yet</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);
    videoEl = modalEl.querySelector('[data-role="video"]');

    wireLaptopModalEvents();
    refreshPeerDropdown();
    updateCropBoxStyle();
    return modalEl;
  }

  function refreshPeerDropdown() {
    if (!modalEl) return;
    const select = modalEl.querySelector('[data-role="target-select"]');
    if (!select) return;
    const peers = (typeof getPeers === 'function' ? getPeers() : []) || [];
    const phones = peers.filter((p) => p && p.role === 'phone');

    const prevValue = select.value || targetPeerId || 'all';
    select.innerHTML = `<option value="all">All Docked Phones (${phones.length})</option>`;
    for (const p of phones) {
      const edgeTag = p.edge ? ` · ${String(p.edge).toUpperCase()}` : '';
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name || 'Phone'}${edgeTag}`;
      select.appendChild(opt);
    }
    if ([...select.options].some((o) => o.value === prevValue)) {
      select.value = prevValue;
    } else {
      select.value = 'all';
      targetPeerId = 'all';
    }
  }

  function getSourceDimensions() {
    if (!usingSyntheticStream && videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
      return { width: videoEl.videoWidth, height: videoEl.videoHeight };
    }
    ensureSyntheticSurface();
    return { width: syntheticCanvas.width, height: syntheticCanvas.height };
  }

  function updateCropBoxStyle() {
    if (!modalEl) return;
    const box = modalEl.querySelector('[data-role="crop-box"]');
    const badge = modalEl.querySelector('[data-role="crop-badge"]');
    if (!box) return;

    box.style.left = `${(crop.x * 100).toFixed(2)}%`;
    box.style.top = `${(crop.y * 100).toFixed(2)}%`;
    box.style.width = `${(crop.w * 100).toFixed(2)}%`;
    box.style.height = `${(crop.h * 100).toFixed(2)}%`;

    const src = getSourceDimensions();
    const cw = Math.max(1, Math.round(src.width * crop.w));
    const ch = Math.max(1, Math.round(src.height * crop.h));
    if (badge) {
      badge.textContent = `${cw}×${ch} · ${Math.round(crop.w * 100)}%×${Math.round(crop.h * 100)}%`;
    }

    const presetBtns = modalEl.querySelectorAll('[data-preset]');
    presetBtns.forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-preset') === activePreset);
    });
  }

  function applyCropPreset(preset) {
    activePreset = preset;
    if (preset === 'full') {
      crop.x = 0;
      crop.y = 0;
      crop.w = 1;
      crop.h = 1;
    } else if (preset === 'phone') {
      const src = getSourceDimensions();
      const targetAspect = 9 / 16;
      const srcAspect = src.width / Math.max(1, src.height);
      const wRatio = clamp(targetAspect / srcAspect, 0.22, 0.9);
      crop.w = wRatio;
      crop.h = 0.92;
      crop.x = (1 - crop.w) * 0.5;
      crop.y = 0.04;
    } else if (preset === 'left') {
      crop.x = 0;
      crop.y = 0;
      crop.w = 0.5;
      crop.h = 1;
    } else if (preset === 'right') {
      crop.x = 0.5;
      crop.y = 0;
      crop.w = 0.5;
      crop.h = 1;
    } else if (preset === 'center') {
      crop.x = 0.15;
      crop.y = 0.12;
      crop.w = 0.7;
      crop.h = 0.76;
    }
    updateCropBoxStyle();
  }

  function wireLaptopModalEvents() {
    if (!modalEl) return;

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) {
        closeLaptopModal();
      }
    });

    const closeBtn = modalEl.querySelector('[data-action="close"]');
    closeBtn?.addEventListener('click', () => closeLaptopModal());

    const pickBtn = modalEl.querySelector('[data-action="pick-source"]');
    pickBtn?.addEventListener('click', () => {
      startDisplayMediaCapture();
    });

    const toggleStreamBtn = modalEl.querySelector('[data-action="toggle-stream"]');
    toggleStreamBtn?.addEventListener('click', () => {
      if (isStreaming) {
        pauseFrameStreaming();
      } else {
        startFrameStreaming();
      }
    });

    modalEl.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyCropPreset(btn.getAttribute('data-preset') || 'full');
      });
    });

    const targetSelect = modalEl.querySelector('[data-role="target-select"]');
    targetSelect?.addEventListener('change', () => {
      targetPeerId = targetSelect.value || 'all';
    });

    const fpsSelect = modalEl.querySelector('[data-role="fps-select"]');
    fpsSelect?.addEventListener('change', () => {
      targetFps = clamp(Number(fpsSelect.value) || 18, 10, 24);
      if (isStreaming) {
        restartStreamInterval();
      }
    });

    // Interactive Crop Region Drag & Resize Handles
    const cropLayer = modalEl.querySelector('[data-role="crop-layer"]');
    const cropBox = modalEl.querySelector('[data-role="crop-box"]');
    let dragState = null;

    cropBox?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const handleEl = e.target.closest('[data-handle]');
      const mode = handleEl ? handleEl.getAttribute('data-handle') : 'move';
      const rect = cropLayer.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      dragState = {
        pointerId: e.pointerId,
        mode,
        startX: e.clientX,
        startY: e.clientY,
        layerW: rect.width,
        layerH: rect.height,
        orig: { ...crop },
      };
      cropBox.setPointerCapture?.(e.pointerId);
    });

    cropBox?.addEventListener('pointermove', (e) => {
      if (!dragState || e.pointerId !== dragState.pointerId) return;
      const dx = (e.clientX - dragState.startX) / dragState.layerW;
      const dy = (e.clientY - dragState.startY) / dragState.layerH;
      const minSize = 0.1;
      const o = dragState.orig;

      activePreset = 'custom';

      if (dragState.mode === 'move') {
        crop.x = clamp(o.x + dx, 0, 1 - o.w);
        crop.y = clamp(o.y + dy, 0, 1 - o.h);
      } else {
        let x0 = o.x;
        let y0 = o.y;
        let x1 = o.x + o.w;
        let y1 = o.y + o.h;

        if (dragState.mode.includes('w')) x0 = clamp(o.x + dx, 0, x1 - minSize);
        if (dragState.mode.includes('e')) x1 = clamp(o.x + o.w + dx, x0 + minSize, 1);
        if (dragState.mode.includes('n')) y0 = clamp(o.y + dy, 0, y1 - minSize);
        if (dragState.mode.includes('s')) y1 = clamp(o.y + o.h + dy, y0 + minSize, 1);

        crop.x = x0;
        crop.y = y0;
        crop.w = x1 - x0;
        crop.h = y1 - y0;
      }

      updateCropBoxStyle();
    });

    const endCropDrag = (e) => {
      if (!dragState || (e && e.pointerId !== dragState.pointerId)) return;
      dragState = null;
    };
    cropBox?.addEventListener('pointerup', endCropDrag);
    cropBox?.addEventListener('pointercancel', endCropDrag);
  }

  async function startDisplayMediaCapture() {
    ensureLaptopModal();
    const sourceLabel = modalEl?.querySelector('[data-role="source-label"]');

    if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 24 },
          audio: false,
        });

        stopCurrentMediaStream();
        mediaStream = stream;
        usingSyntheticStream = false;

        if (videoEl) {
          videoEl.srcObject = stream;
          await videoEl.play().catch(() => {});
        }

        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings?.() || {};
        if (sourceLabel) {
          sourceLabel.textContent = track?.label
            ? `Capturing: ${track.label}`
            : `Live Capture (${settings.width || 1280}×${settings.height || 720})`;
        }

        if (track) {
          track.addEventListener('ended', () => {
            showToast?.('Screen capture ended');
            stopScreenPortalSession();
          });
        }

        updateCropBoxStyle();
        startFrameStreaming();
        showToast?.('Showing your window on the phone');
        return true;
      } catch {
        // Fall through to synthetic live surface so crop & streaming remain usable
      }
    }

    // Fallback: bind synthetic live telemetry stream to video/preview
    usingSyntheticStream = true;
    ensureSyntheticSurface();
    renderSyntheticSurfaceFrame();
    if (videoEl && typeof syntheticCanvas.captureStream === 'function') {
      try {
        const synStream = syntheticCanvas.captureStream(24);
        videoEl.srcObject = synStream;
        await videoEl.play().catch(() => {});
      } catch {}
    }
    if (sourceLabel) {
      sourceLabel.textContent = 'Studio Test Surface (Click Select Window / Screen to capture desktop)';
    }
    updateCropBoxStyle();
    startFrameStreaming();
    return false;
  }

  function stopCurrentMediaStream() {
    if (mediaStream) {
      for (const track of mediaStream.getTracks()) {
        try {
          track.stop();
        } catch {}
      }
      mediaStream = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
    }
  }

  function startFrameStreaming() {
    isStreaming = true;
    restartStreamInterval();
    updateStreamingIndicators();
    startRadarOverlayLoop();
  }

  function pauseFrameStreaming() {
    isStreaming = false;
    if (streamTimer) {
      clearInterval(streamTimer);
      streamTimer = null;
    }
    updateStreamingIndicators();
  }

  function restartStreamInterval() {
    if (streamTimer) clearInterval(streamTimer);
    const intervalMs = Math.round(1000 / clamp(targetFps, 15, 20));
    streamTimer = setInterval(captureAndSendCroppedFrame, intervalMs);
  }

  function updateStreamingIndicators() {
    if (!modalEl) return;
    const dialog = modalEl.querySelector('[data-role="dialog"]');
    const livePill = modalEl.querySelector('[data-role="live-pill"]');
    const streamBtn = modalEl.querySelector('[data-action="toggle-stream"]');
    const streamBtnText = modalEl.querySelector('[data-role="stream-btn-text"]');

    dialog?.classList.toggle('is-streaming', isStreaming);
    livePill?.classList.toggle('is-live', isStreaming);
    streamBtn?.classList.toggle('is-active', isStreaming);
    if (streamBtnText) {
      streamBtnText.textContent = isStreaming ? 'Streaming Live' : 'Paused';
    }
  }

  function captureAndSendCroppedFrame() {
    if (!isStreaming || !captureCanvas || !captureCtx) return;

    let sourceEl = null;
    let srcW = 0;
    let srcH = 0;

    if (!usingSyntheticStream && videoEl && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
      sourceEl = videoEl;
      srcW = videoEl.videoWidth;
      srcH = videoEl.videoHeight;
    } else {
      renderSyntheticSurfaceFrame();
      sourceEl = syntheticCanvas;
      srcW = syntheticCanvas.width;
      srcH = syntheticCanvas.height;
    }

    if (!sourceEl || srcW <= 0 || srcH <= 0) return;

    const sx = Math.round(clamp(crop.x, 0, 0.95) * srcW);
    const sy = Math.round(clamp(crop.y, 0, 0.95) * srcH);
    const sw = Math.max(32, Math.min(srcW - sx, Math.round(crop.w * srcW)));
    const sh = Math.max(32, Math.min(srcH - sy, Math.round(crop.h * srcH)));

    // Cap max transmitted dimension to 960px for ultra-low latency over WebSocket
    const maxDim = 960;
    const scale = Math.min(1, maxDim / Math.max(sw, sh));
    const outW = Math.max(16, Math.round(sw * scale));
    const outH = Math.max(16, Math.round(sh * scale));

    if (captureCanvas.width !== outW || captureCanvas.height !== outH) {
      captureCanvas.width = outW;
      captureCanvas.height = outH;
    }

    captureCtx.drawImage(sourceEl, sx, sy, sw, sh, 0, 0, outW, outH);
    const dataUrl = captureCanvas.toDataURL('image/jpeg', jpegQuality);
    const now = Date.now();
    const aspect = Number((outW / outH).toFixed(4));

    const sent = sendWsMessage({
      type: 'screen_portal_frame',
      dataUrl,
      width: outW,
      height: outH,
      aspect,
      targetId: targetPeerId,
      ts: now,
    });

    lastStreamWidth = outW;
    lastStreamHeight = outH;

    if (sent || !getWs?.()) {
      framesSentWindow.push(now);
      bytesSentWindow.push({ ts: now, bytes: dataUrl.length * 0.75 });
    }
    updateLaptopTelemetry(now);
  }

  function updateLaptopTelemetry(now = Date.now()) {
    if (!modalEl) return;
    const cutoff = now - 1000;
    framesSentWindow = framesSentWindow.filter((t) => t > cutoff);
    bytesSentWindow = bytesSentWindow.filter((b) => b.ts > cutoff);

    const fps = framesSentWindow.length;
    const totalBytes = bytesSentWindow.reduce((acc, item) => acc + item.bytes, 0);
    const kbps = Math.round((totalBytes * 8) / 1000);

    const fpsEl = modalEl.querySelector('[data-role="fps-readout"]');
    const bitEl = modalEl.querySelector('[data-role="bitrate-readout"]');
    const resEl = modalEl.querySelector('[data-role="res-readout"]');

    if (fpsEl) fpsEl.textContent = `${fps} FPS`;
    if (bitEl) {
      bitEl.textContent = kbps >= 1000 ? `${(kbps / 1000).toFixed(1)} Mbps` : `${kbps} kbps`;
    }
    if (resEl && lastStreamWidth > 0) {
      resEl.textContent = `${lastStreamWidth}×${lastStreamHeight}`;
    }
  }

  function startRadarOverlayLoop() {
    if (radarRafId) return;

    const renderRadar = () => {
      if (!modalEl || !modalEl.classList.contains('is-open')) {
        radarRafId = null;
        return;
      }

      if (usingSyntheticStream) {
        renderSyntheticSurfaceFrame();
      }

      const canvas = modalEl.querySelector('[data-role="radar-canvas"]');
      const viewport = modalEl.querySelector('[data-role="viewport"]');
      if (canvas && viewport) {
        const rect = viewport.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const W = Math.max(1, Math.round(rect.width * dpr));
        const H = Math.max(1, Math.round(rect.height * dpr));
        if (canvas.width !== W || canvas.height !== H) {
          canvas.width = W;
          canvas.height = H;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, W, H);

        const now = performance.now();
        for (let i = remoteTapPings.length - 1; i >= 0; i--) {
          const ping = remoteTapPings[i];
          const elapsed = now - ping.born;
          if (elapsed > 1350) {
            remoteTapPings.splice(i, 1);
            continue;
          }

          const progress = elapsed / 1350;
          const alpha = Math.pow(1 - progress, 1.5);

          // Map normalized tap coordinates inside the active crop region
          const normX = clamp(crop.x + ping.xRatio * crop.w, 0, 1);
          const normY = clamp(crop.y + ping.yRatio * crop.h, 0, 1);
          const cx = normX * W;
          const cy = normY * H;

          ctx.save();
          // Outer expanding radar ring
          ctx.strokeStyle = ping.color || '#38bdf8';
          ctx.globalAlpha = alpha * 0.9;
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.arc(cx, cy, (10 + progress * 48) * dpr, 0, Math.PI * 2);
          ctx.stroke();

          // Secondary harmonic ring
          if (progress > 0.15) {
            const p2 = (progress - 0.15) / 0.85;
            ctx.globalAlpha = (1 - p2) * 0.65;
            ctx.lineWidth = 1.5 * dpr;
            ctx.beginPath();
            ctx.arc(cx, cy, (6 + p2 * 30) * dpr, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Glowing center beacon
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5 * dpr, 0, Math.PI * 2);
          ctx.fill();

          // Coordinate tag
          ctx.font = `600 ${Math.round(10 * dpr)}px "JetBrains Mono", ui-monospace, monospace`;
          ctx.fillStyle = '#e0f2fe';
          ctx.fillText(
            `${ping.fromName || 'Phone'} (${Math.round(ping.xRatio * 100)}%, ${Math.round(ping.yRatio * 100)}%)`,
            cx + 10 * dpr,
            cy - 8 * dpr,
          );
          ctx.restore();
        }
      }

      radarRafId = requestAnimationFrame(renderRadar);
    };

    radarRafId = requestAnimationFrame(renderRadar);
  }

  function stopScreenPortalSession() {
    pauseFrameStreaming();
    stopCurrentMediaStream();
    sendWsMessage({ type: 'screen_portal_stop', ts: Date.now() });
  }

  function closeLaptopModal() {
    stopScreenPortalSession();
    if (modalEl) {
      modalEl.classList.remove('is-open');
    }
    if (radarRafId) {
      cancelAnimationFrame(radarRafId);
      radarRafId = null;
    }
  }

  function closeScreenPortal() {
    closeLaptopModal();
    if (phoneHudEl) {
      phoneHudEl.classList.remove('is-visible');
    }
  }
  // ==========================================================================
  // 2. Phone Side — Live Wireless Second-Monitor HUD
  // ==========================================================================
  function ensurePhoneHud() {
    if (phoneHudEl && document.body.contains(phoneHudEl)) {
      return phoneHudEl;
    }

    phoneHudEl = document.createElement('div');
    phoneHudEl.id = PHONE_HUD_ID;
    phoneHudEl.innerHTML = `
      <div class="og-pm-topbar" data-role="pm-topbar">
        <div class="og-sp-brand">
          <span class="og-sp-brand-icon">${ICONS.phone}</span>
          <span class="og-sp-title" data-role="pm-title">Second screen</span>
        </div>
        <div class="og-sp-telemetry">
          <span class="og-sp-pill is-live" data-role="pm-fps-pill">
            <span class="og-sp-dot"></span>
            <span data-role="pm-fps-text">LIVE</span>
          </span>
          <span class="og-sp-pill" data-role="pm-latency-pill">0 ms</span>
          <button type="button" class="og-sp-btn og-sp-icon-btn" data-action="pm-fit" title="Toggle Fit / Fill">
            ${ICONS.fit}
          </button>
          <button type="button" class="og-sp-btn og-sp-icon-btn" data-action="pm-freeze" title="Freeze / Resume Frame">
            ${ICONS.pause}
          </button>
          <button type="button" class="og-sp-btn og-sp-icon-btn" data-action="pm-pip" title="Toggle Picture-in-Picture">
            ${ICONS.pip}
          </button>
          <button type="button" class="og-sp-btn og-sp-icon-btn" data-action="pm-reset-zoom" title="Reset Zoom (1x)">
            ${ICONS.reset}
          </button>
          <button type="button" class="og-sp-btn og-sp-icon-btn" data-action="pm-close" title="Close Monitor HUD">
            ${ICONS.close}
          </button>
        </div>
      </div>

      <div class="og-pm-canvas-stage" data-role="pm-stage">
        <div class="og-pm-transform-layer" data-role="pm-transform">
          <img class="og-pm-image" data-role="pm-img" alt="Live Laptop Screen Portal" draggable="false" />
        </div>
      </div>

      <div class="og-pm-bottombar">
        <span data-role="pm-res">Waiting for the laptop</span>
        <span>Pinch to zoom. Tap to point at the laptop screen.</span>
      </div>
    `;

    document.body.appendChild(phoneHudEl);
    phoneImgEl = phoneHudEl.querySelector('[data-role="pm-img"]');
    phoneStatusPill = phoneHudEl.querySelector('[data-role="pm-latency-pill"]');
    phoneFpsPill = phoneHudEl.querySelector('[data-role="pm-fps-text"]');
    phoneResLabel = phoneHudEl.querySelector('[data-role="pm-res"]');
    phoneTransformLayer = phoneHudEl.querySelector('[data-role="pm-transform"]');

    wirePhoneHudInteractions();
    return phoneHudEl;
  }

  function applyPhoneTransform() {
    if (!phoneTransformLayer) return;
    phoneTransformLayer.style.transform = `translate3d(${phonePanX.toFixed(1)}px, ${phonePanY.toFixed(1)}px, 0) scale(${phoneZoom.toFixed(3)})`;
  }

  function resetPhoneZoom() {
    phoneZoom = 1;
    phonePanX = 0;
    phonePanY = 0;
    applyPhoneTransform();
  }

  function wirePhoneHudInteractions() {
    if (!phoneHudEl) return;

    const closeBtn = phoneHudEl.querySelector('[data-action="pm-close"]');
    closeBtn?.addEventListener('click', () => {
      phoneHudEl.classList.remove('is-visible');
    });

    const pipBtn = phoneHudEl.querySelector('[data-action="pm-pip"]');
    pipBtn?.addEventListener('click', () => {
      phoneIsPip = !phoneIsPip;
      phoneHudEl.classList.toggle('is-pip', phoneIsPip);
      pipBtn.classList.toggle('is-active', phoneIsPip);
      resetPhoneZoom();
    });

    const fitBtn = phoneHudEl.querySelector('[data-action="pm-fit"]');
    fitBtn?.addEventListener('click', () => {
      phoneIsCover = !phoneIsCover;
      phoneHudEl.classList.toggle('is-cover', phoneIsCover);
      fitBtn.classList.toggle('is-active', phoneIsCover);
    });

    const freezeBtn = phoneHudEl.querySelector('[data-action="pm-freeze"]');
    freezeBtn?.addEventListener('click', () => {
      phoneIsFrozen = !phoneIsFrozen;
      freezeBtn.classList.toggle('is-active', phoneIsFrozen);
      freezeBtn.innerHTML = phoneIsFrozen ? ICONS.play : ICONS.pause;
    });

    const resetBtn = phoneHudEl.querySelector('[data-action="pm-reset-zoom"]');
    resetBtn?.addEventListener('click', () => {
      resetPhoneZoom();
    });

    // Multi-touch Pinch-to-Zoom + Pan + Tap-to-Ping
    const stage = phoneHudEl.querySelector('[data-role="pm-stage"]');
    const activePointers = new Map();
    let initialPinchDist = 0;
    let initialPinchZoom = 1;
    let tapCandidate = null;

    function getDistance(p1, p2) {
      return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }

    stage?.addEventListener('pointerdown', (e) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      stage.setPointerCapture?.(e.pointerId);

      if (activePointers.size === 1) {
        tapCandidate = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          panStartX: phonePanX,
          panStartY: phonePanY,
          ts: performance.now(),
          moved: false,
        };
      } else if (activePointers.size === 2) {
        tapCandidate = null;
        const pts = [...activePointers.values()];
        initialPinchDist = Math.max(10, getDistance(pts[0], pts[1]));
        initialPinchZoom = phoneZoom;
      }
    });

    stage?.addEventListener('pointermove', (e) => {
      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 2) {
        const pts = [...activePointers.values()];
        const dist = getDistance(pts[0], pts[1]);
        phoneZoom = clamp(initialPinchZoom * (dist / initialPinchDist), 1, 4);
        if (phoneZoom <= 1.02) {
          phonePanX = 0;
          phonePanY = 0;
        }
        applyPhoneTransform();
      } else if (activePointers.size === 1 && tapCandidate && tapCandidate.pointerId === e.pointerId) {
        const dx = e.clientX - tapCandidate.startX;
        const dy = e.clientY - tapCandidate.startY;
        if (Math.hypot(dx, dy) > 8) {
          tapCandidate.moved = true;
        }
        if (phoneZoom > 1.02 && tapCandidate.moved) {
          phonePanX = clamp(tapCandidate.panStartX + dx, -360, 360);
          phonePanY = clamp(tapCandidate.panStartY + dy, -360, 360);
          applyPhoneTransform();
        }
      }
    });

    const onPointerEnd = (e) => {
      activePointers.delete(e.pointerId);

      if (
        tapCandidate &&
        tapCandidate.pointerId === e.pointerId &&
        !tapCandidate.moved &&
        performance.now() - tapCandidate.ts < 420 &&
        phoneImgEl
      ) {
        const rect = phoneImgEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const xRatio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
          const yRatio = clamp((e.clientY - rect.top) / rect.height, 0, 1);

          spawnPhoneLocalTapPing(e.clientX, e.clientY, stage);
          sendWsMessage({
            type: 'screen_portal_tap',
            xRatio: Number(xRatio.toFixed(4)),
            yRatio: Number(yRatio.toFixed(4)),
            ts: Date.now(),
          });
        }
      }

      if (activePointers.size === 0) {
        tapCandidate = null;
      }
    };

    stage?.addEventListener('pointerup', onPointerEnd);
    stage?.addEventListener('pointercancel', onPointerEnd);

    // Wheel zoom support on desktop/trackpad testing
    stage?.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        phoneZoom = clamp(phoneZoom * factor, 1, 4);
        if (phoneZoom <= 1.02) {
          phonePanX = 0;
          phonePanY = 0;
        }
        applyPhoneTransform();
      },
      { passive: false },
    );
  }

  function spawnPhoneLocalTapPing(clientX, clientY, stageEl) {
    if (!stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    const ping = document.createElement('div');
    ping.className = 'og-pm-ping';
    ping.style.left = `${clientX - rect.left}px`;
    ping.style.top = `${clientY - rect.top}px`;
    stageEl.appendChild(ping);

    requestAnimationFrame(() => {
      ping.classList.add('is-expanding');
    });
    setTimeout(() => {
      ping.remove();
    }, 550);
  }

  // ==========================================================================
  // Public API: `openScreenPortal` & `handleScreenPortalMessage`
  // ==========================================================================
  async function openScreenPortal(options = {}) {
    const role = typeof getRole === 'function' ? getRole() : 'laptop';

    if (role === 'phone' && !options.forceCaptureModal) {
      const hud = ensurePhoneHud();
      hud.classList.add('is-visible');
      return hud;
    }

    const modal = ensureLaptopModal();
    refreshPeerDropdown();
    modal.classList.add('is-open');

    if (!options.skipAutoPrompt) {
      await startDisplayMediaCapture();
    } else {
      startRadarOverlayLoop();
    }

    return modal;
  }

  function handleScreenPortalMessage(msg) {
    if (!msg || typeof msg !== 'object') return false;

    // 1. Incoming live cropped frame on Phone (Wireless Second Monitor HUD)
    if (msg.type === 'screen_portal_frame') {
      const myId = typeof getSelfId === 'function' ? getSelfId() : null;
      if (msg.targetId && msg.targetId !== 'all' && myId && msg.targetId !== myId) {
        return false;
      }

      const hud = ensurePhoneHud();
      if (!hud.classList.contains('is-visible')) {
        hud.classList.add('is-visible');
      }

      const now = Date.now();
      phoneFrameTimes.push(now);
      phoneFrameTimes = phoneFrameTimes.filter((t) => t > now - 1000);
      const fps = phoneFrameTimes.length;
      phoneLastLatencyMs = msg.ts ? clamp(now - Number(msg.ts), 1, 9999) : 12;

      if (!phoneIsFrozen && phoneImgEl && typeof msg.dataUrl === 'string') {
        phoneImgEl.src = msg.dataUrl;
      }

      if (phoneFpsPill) {
        phoneFpsPill.textContent = `${fps} FPS`;
      }
      if (phoneStatusPill) {
        phoneStatusPill.textContent = `${phoneLastLatencyMs} ms`;
      }
      if (phoneResLabel) {
        const sender = escapeHtml(msg.fromName || 'Laptop');
        const w = Number(msg.width) || 0;
        const h = Number(msg.height) || 0;
        phoneResLabel.innerHTML = `${sender} &middot; ${w}&times;${h} &middot; Tap to ping radar`;
      }
      return true;
    }

    // 2. Incoming remote touch tap from Phone -> Render glowing radar ping on Laptop preview
    if (msg.type === 'screen_portal_tap') {
      const xRatio = clamp(Number(msg.xRatio) || 0.5, 0, 1);
      const yRatio = clamp(Number(msg.yRatio) || 0.5, 0, 1);

      remoteTapPings.push({
        xRatio,
        yRatio,
        fromName: msg.fromName || 'Phone',
        color: msg.fromColor || '#38bdf8',
        born: performance.now(),
      });

      if (modalEl) {
        const tapReadout = modalEl.querySelector('[data-role="tap-readout"]');
        if (tapReadout) {
          tapReadout.textContent = `Last Remote Tap: ${msg.fromName || 'Phone'} @ ${Math.round(xRatio * 100)}%, ${Math.round(yRatio * 100)}%`;
        }
        startRadarOverlayLoop();
      }
      return true;
    }

    // 3. Stream stopped notification
    if (msg.type === 'screen_portal_stop') {
      if (phoneHudEl && phoneHudEl.classList.contains('is-visible')) {
        if (phoneFpsPill) phoneFpsPill.textContent = 'STANDBY';
        if (phoneResLabel) phoneResLabel.textContent = 'Stream paused by host';
      }
      return true;
    }

    return false;
  }

  const api = {
    openScreenPortal,
    closeScreenPortal,
    handleScreenPortalMessage,
  };

  activeScreenPortalInstance = api;

  if (typeof window !== 'undefined') {
    window.oneGlassScreenPortal = api;
    window.openScreenPortal = openScreenPortal;
    window.closeScreenPortal = closeScreenPortal;
  }

  return api;
}

export function openScreenPortal(options) {
  if (!activeScreenPortalInstance) {
    activeScreenPortalInstance = initScreenPortal();
  }
  return activeScreenPortalInstance.openScreenPortal(options);
}

export function closeScreenPortal() {
  if (activeScreenPortalInstance) {
    activeScreenPortalInstance.closeScreenPortal();
  }
}

export function handleScreenPortalMessage(msg) {
  if (activeScreenPortalInstance) {
    return activeScreenPortalInstance.handleScreenPortalMessage(msg);
  }
  return false;
}

export default {
  initScreenPortal,
  openScreenPortal,
  closeScreenPortal,
  handleScreenPortalMessage,
};
