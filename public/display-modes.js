// ============================================================================
// OneGlass — Cross-Device Live Display Modes (Zero-Dependency ES Module)
// Linear Studio Design Engineering Edition
// 1. Panoramic Multi-Screen Shader / Video Wall (openPanoramicWall)
// 2. Top-Notch Webcam Teleprompter & Speaker HUD (openNotchTeleprompter)
// 3. Cross-Screen Continuum XY Harmonic Synth (openContinuumSynth)
// Follows Emil Kowalski UI rules: explicit transitions (never `transition: all`),
// `transform: scale(0.97)` on `:active`, and `cubic-bezier(0.23, 1, 0.32, 1)`.
// ============================================================================

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';

const ICONS = {
  wall: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5"></rect><path d="M5.2 2.5v9M8.8 2.5v9"></path></svg>`,
  span: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 2.5H2.5V5M9 2.5h2.5V5M5 11.5H2.5V9M9 11.5h2.5V9"></path><circle cx="7" cy="7" r="1.4"></circle></svg>`,
  prompter: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="1.5"></rect><path d="M4.5 5h5M4.5 7.5h5M4.5 10h3"></path></svg>`,
  eye: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 7s2.2-3.5 5.5-3.5S12.5 7 12.5 7s-2.2 3.5-5.5 3.5S1.5 7 1.5 7z"></path><circle cx="7" cy="7" r="1.5"></circle></svg>`,
  play: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="4,2.8 11,7 4,11.2"></polygon></svg>`,
  pause: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3v8M9 3v8"></path></svg>`,
  reset: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5A4.5 4.5 0 1 1 4 10.2"></path><polyline points="2.5,3 2.5,6.5 6,6.5"></polyline></svg>`,
  mirror: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2v10"></path><polyline points="4.5,4.5 2,7 4.5,9.5"></polyline><polyline points="9.5,4.5 12,7 9.5,9.5"></polyline></svg>`,
  dockTop: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 2.5h9"></path><path d="M7 11.5V5"></path><polyline points="4.5,7.5 7,5 9.5,7.5"></polyline></svg>`,
  synth: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 7h2l1.5-4 2 8 2-6 1.5 2h2"></path></svg>`,
  close: `<svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7"></path></svg>`,
};

const DEFAULT_TELEPROMPTER_SCRIPT = `Welcome to OneGlass Studio.

Right now my phone is docked on the top bezel of my MacBook, directly beside the camera lens.

Because this teleprompter streams immediately below the phone's top edge, I can read my entire script while maintaining direct eye contact with the lens.

Drag any file across a calibrated bezel strip to beam it, or tap the bezel to trigger a synchronized shockwave across every connected display.`;

function injectStylesOnce() {
  if (document.getElementById('oneglass-display-modes-css')) return;
  const style = document.createElement('style');
  style.id = 'oneglass-display-modes-css';
  style.textContent = `
    .dm-window {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 34;
      background: #0b0c0e;
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      color: #f4f5f8;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Text", sans-serif;
      font-variant-numeric: tabular-nums;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      pointer-events: auto;
      touch-action: none;
      will-change: transform, opacity;
      transform-origin: center center;
      transition: opacity 200ms ${EASE_OUT}, border-color 180ms ${EASE_OUT}, box-shadow 180ms ${EASE_OUT};
    }
    .dm-window.dm-entering {
      opacity: 0;
    }
    .dm-window.dm-spanning-active {
      border-color: rgba(94, 106, 210, 0.45);
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.82), 0 0 0 1px rgba(56, 189, 248, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    .dm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      height: 36px;
      padding: 0 12px;
      font-size: 12px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
    }
    .dm-header:active {
      cursor: grabbing;
    }
    .dm-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .dm-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #8a8f98;
      flex-shrink: 0;
    }
    .dm-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.75);
      flex-shrink: 0;
    }
    .dm-dot.indigo {
      background: #5e6ad2;
      box-shadow: 0 0 8px rgba(94, 106, 210, 0.8);
    }
    .dm-title {
      font-size: 12px;
      font-weight: 500;
      color: #f4f5f8;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dm-badge {
      font: 500 10px/1 "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.03em;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.24);
      padding: 3px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .dm-badge.indigo {
      color: #a5b4fc;
      background: rgba(94, 106, 210, 0.16);
      border-color: rgba(94, 106, 210, 0.36);
    }
    .dm-close {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      color: #8a8f98;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
      transition: transform 140ms ${EASE_OUT}, background-color 150ms ${EASE_OUT}, color 150ms ${EASE_OUT}, border-color 150ms ${EASE_OUT};
    }
    @media (hover: hover) and (pointer: fine) {
      .dm-close:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.16);
        color: #f4f5f8;
      }
    }
    .dm-close:active {
      transform: scale(0.97);
    }
    .dm-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
      color: #d0d6e0;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      transition: transform 140ms ${EASE_OUT}, background-color 160ms ${EASE_OUT}, border-color 160ms ${EASE_OUT}, color 160ms ${EASE_OUT}, box-shadow 160ms ${EASE_OUT};
    }
    @media (hover: hover) and (pointer: fine) {
      .dm-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.16);
        color: #ffffff;
      }
    }
    .dm-btn:active {
      transform: scale(0.97);
    }
    .dm-btn.active {
      background: rgba(94, 106, 210, 0.22);
      border-color: rgba(94, 106, 210, 0.55);
      color: #ffffff;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 14px rgba(94, 106, 210, 0.24);
    }
    .dm-btn.cyan.active {
      background: rgba(56, 189, 248, 0.16);
      border-color: rgba(56, 189, 248, 0.5);
      color: #e0f2fe;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 14px rgba(56, 189, 248, 0.2);
    }
    .dm-controls-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 8px 12px;
      background: #0b0c0e;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
    }
    .dm-pill-group {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: rgba(255, 255, 255, 0.03);
      padding: 2px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .dm-pill {
      background: transparent;
      border: none;
      color: #8a8f98;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: transform 140ms ${EASE_OUT}, background-color 150ms ${EASE_OUT}, color 150ms ${EASE_OUT};
    }
    @media (hover: hover) and (pointer: fine) {
      .dm-pill:hover {
        color: #f4f5f8;
      }
    }
    .dm-pill:active {
      transform: scale(0.97);
    }
    .dm-pill.active {
      background: rgba(94, 106, 210, 0.28);
      color: #ffffff;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    .dm-textarea {
      width: 100%;
      height: 88px;
      resize: none;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      color: #f4f5f8;
      padding: 8px 10px;
      font: 12px/1.45 -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Text", sans-serif;
      outline: none;
      user-select: text;
      -webkit-user-select: text;
      touch-action: pan-y;
      transition: border-color 150ms ${EASE_OUT};
    }
    .dm-textarea:focus {
      border-color: #5e6ad2;
    }
    .dm-eye-banner {
      background: linear-gradient(90deg, rgba(94, 106, 210, 0.14), rgba(56, 189, 248, 0.14), rgba(94, 106, 210, 0.14));
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: #38bdf8;
      font: 600 10px/1.2 "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-align: center;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .dm-prompter-viewport {
      position: relative;
      width: 100%;
      height: 158px;
      overflow: hidden;
      background: radial-gradient(circle at 50% 0%, rgba(94, 106, 210, 0.12), #07080a 75%);
    }
    .dm-prompter-guide {
      position: absolute;
      top: 34%;
      left: 0;
      right: 0;
      height: 36px;
      transform: translateY(-50%);
      background: rgba(56, 189, 248, 0.06);
      border-top: 1px solid rgba(56, 189, 248, 0.32);
      border-bottom: 1px solid rgba(56, 189, 248, 0.32);
      pointer-events: none;
      z-index: 2;
    }
    .dm-prompter-scroll {
      padding: 52px 18px 110px;
      font-size: 19px;
      font-weight: 600;
      line-height: 1.48;
      letter-spacing: -0.015em;
      color: #ffffff;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
      will-change: transform;
    }
    .dm-prompter-scroll.mirrored {
      transform-origin: center center;
    }
    .dm-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 82px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      outline: none;
    }
    .dm-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #5e6ad2;
      border: 1px solid #38bdf8;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(94, 106, 210, 0.8);
      transition: transform 140ms ${EASE_OUT};
    }
    .dm-slider::-webkit-slider-thumb:active {
      transform: scale(0.97);
    }
  `;
  document.head.appendChild(style);
}

const MIN_WINDOW_Z = 45;
const MAX_WINDOW_Z = 58;
let topZIndex = MIN_WINDOW_Z;
let activeDisplayModesInstance = null;
let latestDispatcher = null;

function elevateWindowZ(winEl) {
  if (!winEl) return topZIndex;
  topZIndex++;
  if (topZIndex > MAX_WINDOW_Z) {
    const allWindows = Array.from(document.querySelectorAll('.dm-window'));
    allWindows.sort(
      (a, b) => (parseInt(a.style.zIndex, 10) || MIN_WINDOW_Z) - (parseInt(b.style.zIndex, 10) || MIN_WINDOW_Z),
    );
    let normalizedZ = MIN_WINDOW_Z;
    for (const w of allWindows) {
      if (w !== winEl) {
        w.style.zIndex = String(normalizedZ++);
      }
    }
    topZIndex = Math.min(normalizedZ, MAX_WINDOW_Z);
  }
  winEl.style.zIndex = String(topZIndex);
  return topZIndex;
}

function makeWindowDraggable(winEl, handleEl, initialX, initialY) {
  const state = { x: initialX, y: initialY };
  winEl.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(0.95)`;
  winEl.classList.add('dm-entering');
  requestAnimationFrame(() => {
    winEl.style.transition = `transform 240ms ${EASE_DRAWER}, opacity 180ms ${EASE_OUT}, border-color 180ms ${EASE_OUT}, box-shadow 180ms ${EASE_OUT}`;
    winEl.classList.remove('dm-entering');
    winEl.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(1)`;
  });

  let dragging = false;
  let activePointerId = null;
  let offsetX = 0;
  let offsetY = 0;

  winEl.addEventListener('pointerdown', () => {
    elevateWindowZ(winEl);
  });

  handleEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, input, textarea')) return;
    if (dragging) return;
    dragging = true;
    activePointerId = e.pointerId;
    handleEl.setPointerCapture(e.pointerId);
    winEl.style.transition = `border-color 180ms ${EASE_OUT}, box-shadow 180ms ${EASE_OUT}`;
    offsetX = e.clientX - state.x;
    offsetY = e.clientY - state.y;
    elevateWindowZ(winEl);
  });

  handleEl.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== activePointerId) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const rect = winEl.getBoundingClientRect();
    state.x = Math.max(8, Math.min(W - rect.width - 8, e.clientX - offsetX));
    state.y = Math.max(8, Math.min(H - rect.height - 8, e.clientY - offsetY));
    winEl.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(1)`;
  });

  const endDrag = (e) => {
    if (!dragging || (e && e.pointerId !== activePointerId)) return;
    dragging = false;
    activePointerId = null;
  };
  handleEl.addEventListener('pointerup', endDrag);
  handleEl.addEventListener('pointercancel', endDrag);

  return state;
}

export function handleDisplayModeMessage(msg) {
  if (typeof latestDispatcher === 'function') {
    return latestDispatcher(msg);
  }
  return false;
}

export function initDisplayModes({ getWs, getRole, getPeers, getSelfId, showToast } = {}) {
  injectStylesOnce();

  const role = () => (typeof getRole === 'function' ? getRole() : 'laptop');
  const peers = () => (typeof getPeers === 'function' ? getPeers() || [] : []);
  const selfId = () => (typeof getSelfId === 'function' ? getSelfId() : null);
  const toast = (msg) => {
    if (typeof showToast === 'function') showToast(msg);
  };

  function sendSync(payload) {
    const ws = typeof getWs === 'function' ? getWs() : null;
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'display_mode_sync', ...payload }));
    }
  }

  function sendRaw(payload) {
    const ws = typeof getWs === 'function' ? getWs() : null;
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(payload));
    }
  }

  let panoramicInstance = null;
  let teleprompterInstance = null;
  let synthInstance = null;

  // ==========================================================================
  // MODE 1: Panoramic Multi-Screen Shader / Video Wall
  // ==========================================================================
  function openPanoramicWall(initialState = {}) {
    if (panoramicInstance) {
      panoramicInstance.applyRemoteState(initialState);
      elevateWindowZ(panoramicInstance.el);
      return panoramicInstance;
    }

    const isPhone = role() === 'phone';
    const winW = isPhone ? Math.min(window.innerWidth - 20, 420) : 440;
    const winH = 260;
    const startX = isPhone
      ? Math.round((window.innerWidth - winW) / 2)
      : Math.round(window.innerWidth * 0.5 - winW / 2 - 40);
    const startY = isPhone ? 68 : Math.round(window.innerHeight * 0.44 - winH / 2);

    const el = document.createElement('div');
    el.className = 'dm-window dm-spanning-active';
    el.style.width = `${winW}px`;
    el.style.height = `${winH}px`;
    elevateWindowZ(el);

    let currentTheme = initialState.theme || 'aurora';
    let spanAll = initialState.active !== undefined ? Boolean(initialState.active) : true;
    let rafId = null;

    el.innerHTML = `
      <div class="dm-header">
        <div class="dm-title-group">
          <span class="dm-dot"></span>
          <span class="dm-icon">${ICONS.wall}</span>
          <span class="dm-title">Panorama across screens</span>
          <span class="dm-badge" data-role="viewport-badge">60 FPS · SYNCED</span>
        </div>
        <button class="dm-close" title="Close" aria-label="Close">${ICONS.close}</button>
      </div>
      <div style="position:relative;flex:1;width:100%;overflow:hidden;background:#07080a">
        <canvas data-role="pano-canvas" style="width:100%;height:100%;display:block"></canvas>
      </div>
      <div class="dm-controls-bar">
        <div class="dm-pill-group">
          <button class="dm-pill ${currentTheme === 'aurora' ? 'active' : ''}" data-theme="aurora">Aurora</button>
          <button class="dm-pill ${currentTheme === 'cyber' ? 'active' : ''}" data-theme="cyber">Cyber-Wave</button>
          <button class="dm-pill ${currentTheme === 'audio' ? 'active' : ''}" data-theme="audio">Harmonic</button>
        </div>
        <button class="dm-btn ${spanAll ? 'active' : ''}" data-role="span-btn">
          ${ICONS.span}
          <span>Use every paired screen</span>
        </button>
      </div>
    `;

    document.body.appendChild(el);
    const headerEl = el.querySelector('.dm-header');
    makeWindowDraggable(el, headerEl, startX, startY);

    const canvas = el.querySelector('[data-role="pano-canvas"]');
    const ctx = canvas.getContext('2d');
    const badgeEl = el.querySelector('[data-role="viewport-badge"]');
    const spanBtn = el.querySelector('[data-role="span-btn"]');
    const themeBtns = el.querySelectorAll('[data-theme]');

    function updateUI() {
      spanBtn.classList.toggle('active', spanAll);
      el.classList.toggle('dm-spanning-active', spanAll);
      themeBtns.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-theme') === currentTheme);
      });
    }

    function broadcastPanoramic() {
      sendSync({
        mode: 'panoramic',
        active: spanAll,
        theme: currentTheme,
      });
    }

    themeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentTheme = btn.getAttribute('data-theme') || 'aurora';
        updateUI();
        broadcastPanoramic();
      });
    });

    spanBtn.addEventListener('click', () => {
      spanAll = !spanAll;
      updateUI();
      broadcastPanoramic();
      toast(
        spanAll
          ? 'Spanning shader across all docked displays'
          : 'Panoramic wall locked to local viewport',
      );
    });

    function getCameraViewport() {
      if (!spanAll || role() !== 'phone') {
        return { u0: 0, u1: 1, v0: 0, v1: 1, label: '60 FPS · SYNCED' };
      }
      const myPeer = peers().find((p) => p.id === selfId()) || {
        edge: 'right',
        centerRatio: 0.5,
        spanRatio: 0.28,
      };
      const edge = myPeer.edge || 'right';
      const c = myPeer.centerRatio ?? 0.5;
      const span = myPeer.spanRatio ?? 0.28;
      const half = span * 0.5;

      if (edge === 'right') {
        return { u0: 1.0, u1: 1.0 + span, v0: c - half, v1: c + half, label: `60 FPS · RIGHT +${Math.round(c * 100)}%` };
      }
      if (edge === 'left') {
        return { u0: -span, u1: 0.0, v0: c - half, v1: c + half, label: `60 FPS · LEFT +${Math.round(c * 100)}%` };
      }
      if (edge === 'top') {
        return { u0: c - half, u1: c + half, v0: -span, v1: 0.0, label: `60 FPS · TOP +${Math.round(c * 100)}%` };
      }
      return { u0: c - half, u1: c + half, v0: 1.0, v1: 1.0 + span, label: `60 FPS · BOTTOM +${Math.round(c * 100)}%` };
    }

    function renderFrame() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.max(1, Math.round(rect.width * dpr));
      const H = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      const t = (Date.now() % 3600000) / 1000.0;
      const vp = getCameraViewport();
      badgeEl.textContent = vp.label;

      ctx.save();
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      if (currentTheme === 'aurora') {
        bg.addColorStop(0, '#07080a');
        bg.addColorStop(0.55, '#0b101d');
        bg.addColorStop(1, '#0b0c0e');
      } else if (currentTheme === 'cyber') {
        bg.addColorStop(0, '#090812');
        bg.addColorStop(0.5, '#131129');
        bg.addColorStop(1, '#07080a');
      } else {
        bg.addColorStop(0, '#07080d');
        bg.addColorStop(0.5, '#0d1322');
        bg.addColorStop(1, '#07080a');
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const mapWorldToScreenX = (wx) => ((wx - vp.u0) / (vp.u1 - vp.u0)) * W;
      const mapWorldToScreenY = (wy) => ((wy - vp.v0) / (vp.v1 - vp.v0)) * H;

      if (currentTheme === 'aurora') {
        const ribbons = [
          { color: 'rgba(94, 106, 210, 0.42)', glow: '#5e6ad2', amp: 0.14, freq: 3.2, speed: 1.15, yBase: 0.36 },
          { color: 'rgba(56, 189, 248, 0.40)', glow: '#38bdf8', amp: 0.16, freq: 2.6, speed: -0.95, yBase: 0.50 },
          { color: 'rgba(52, 211, 153, 0.34)', glow: '#34d399', amp: 0.12, freq: 4.1, speed: 1.45, yBase: 0.64 },
          { color: 'rgba(129, 140, 248, 0.28)', glow: '#818cf8', amp: 0.10, freq: 5.0, speed: -1.3, yBase: 0.44 },
        ];

        ctx.globalCompositeOperation = 'lighter';
        for (const r of ribbons) {
          ctx.beginPath();
          const steps = 64;
          for (let i = 0; i <= steps; i++) {
            const u = vp.u0 + (i / steps) * (vp.u1 - vp.u0);
            const wy =
              r.yBase +
              Math.sin(u * r.freq + t * r.speed) * r.amp +
              Math.cos(u * (r.freq * 1.7) - t * 0.8) * (r.amp * 0.45);
            const sx = (i / steps) * W;
            const sy = mapWorldToScreenY(wy);
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = r.glow;
          ctx.lineWidth = 3.5 * dpr;
          ctx.stroke();

          ctx.lineTo(W, H);
          ctx.lineTo(0, H);
          ctx.closePath();
          ctx.fillStyle = r.color;
          ctx.fill();
        }
      } else if (currentTheme === 'cyber') {
        ctx.globalCompositeOperation = 'lighter';
        const sunX = mapWorldToScreenX(0.5 + Math.sin(t * 0.4) * 0.18);
        const sunY = mapWorldToScreenY(0.32);
        const sunR = (0.22 / (vp.u1 - vp.u0)) * W;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.1, sunX, sunY, sunR);
        sunGrad.addColorStop(0, 'rgba(56, 189, 248, 0.92)');
        sunGrad.addColorStop(0.48, 'rgba(94, 106, 210, 0.65)');
        sunGrad.addColorStop(1, 'rgba(94, 106, 210, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        const horizonY = mapWorldToScreenY(0.54);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5 * dpr;

        for (let gx = -2.0; gx <= 3.0; gx += 0.14) {
          const shift = (t * 0.22) % 0.14;
          const wx = gx + shift;
          ctx.beginPath();
          ctx.moveTo(mapWorldToScreenX(0.5), horizonY);
          ctx.lineTo(mapWorldToScreenX(wx), mapWorldToScreenY(1.35));
          ctx.stroke();
        }
        for (let i = 1; i <= 10; i++) {
          const prog = (i / 10 + (t * 0.35) % 0.1) % 1;
          const wy = 0.54 + Math.pow(prog, 1.7) * 0.75;
          const sy = mapWorldToScreenY(wy);
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(W, sy);
          ctx.strokeStyle = `rgba(94, 106, 210, ${(0.18 + prog * 0.55).toFixed(2)})`;
          ctx.stroke();
        }
      } else {
        ctx.globalCompositeOperation = 'lighter';
        const totalBars = 56;
        for (let i = 0; i < totalBars; i++) {
          const wx = -0.35 + (i / totalBars) * 1.7;
          if (wx < vp.u0 - 0.08 || wx > vp.u1 + 0.08) continue;
          const sx = mapWorldToScreenX(wx);
          const barW = Math.max(3 * dpr, (0.018 / (vp.u1 - vp.u0)) * W);
          const energy =
            0.22 +
            0.38 * Math.pow(0.5 + 0.5 * Math.sin(wx * 9.0 - t * 3.8), 2) +
            0.28 * Math.pow(0.5 + 0.5 * Math.cos(wx * 15.0 + t * 5.2), 2);
          const topY = mapWorldToScreenY(0.5 - energy * 0.42);
          const botY = mapWorldToScreenY(0.5 + energy * 0.42);
          const hue = Math.round(195 + wx * 65 + Math.sin(t) * 18);
          ctx.fillStyle = `hsla(${hue}, 88%, 62%, 0.78)`;
          ctx.beginPath();
          ctx.roundRect(sx - barW / 2, topY, barW, Math.max(4, botY - topY), 3 * dpr);
          ctx.fill();
        }
      }

      if (role() !== 'phone' && spanAll) {
        const dockedPhones = peers().filter((p) => p.id !== selfId() && p.role === 'phone');
        ctx.globalCompositeOperation = 'source-over';
        for (const p of dockedPhones) {
          ctx.strokeStyle = p.color || '#38bdf8';
          ctx.lineWidth = 3 * dpr;
          const c = p.centerRatio ?? 0.5;
          const span = p.spanRatio ?? 0.28;
          ctx.beginPath();
          if (p.edge === 'right') {
            ctx.moveTo(W - 2, (c - span / 2) * H);
            ctx.lineTo(W - 2, (c + span / 2) * H);
          } else if (p.edge === 'left') {
            ctx.moveTo(2, (c - span / 2) * H);
            ctx.lineTo(2, (c + span / 2) * H);
          } else if (p.edge === 'top') {
            ctx.moveTo((c - span / 2) * W, 2);
            ctx.lineTo((c + span / 2) * W, 2);
          } else if (p.edge === 'bottom') {
            ctx.moveTo((c - span / 2) * W, H - 2);
            ctx.lineTo((c + span / 2) * W, H - 2);
          }
          ctx.stroke();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(renderFrame);
    }

    rafId = requestAnimationFrame(renderFrame);

    function close() {
      if (rafId) cancelAnimationFrame(rafId);
      el.remove();
      panoramicInstance = null;
    }

    el.querySelector('.dm-close').addEventListener('click', () => {
      spanAll = false;
      broadcastPanoramic();
      close();
    });

    panoramicInstance = {
      el,
      close,
      applyRemoteState(msg) {
        if (msg.theme) currentTheme = msg.theme;
        if (msg.active !== undefined) spanAll = Boolean(msg.active);
        updateUI();
      },
    };

    if (!initialState._fromRemote && spanAll) {
      broadcastPanoramic();
    }

    return panoramicInstance;
  }

  // ==========================================================================
  // MODE 2: Top-Notch Webcam Teleprompter & Speaker HUD
  // ==========================================================================
  function openNotchTeleprompter(initialState = {}) {
    if (teleprompterInstance) {
      teleprompterInstance.applyRemoteState(initialState);
      elevateWindowZ(teleprompterInstance.el);
      return teleprompterInstance;
    }

    const isPhone = role() === 'phone';
    const winW = isPhone ? Math.min(window.innerWidth - 16, 430) : 450;
    const startX = Math.round((window.innerWidth - winW) / 2);
    const startY = isPhone ? 10 : 72;

    const el = document.createElement('div');
    el.className = 'dm-window dm-spanning-active';
    el.style.width = `${winW}px`;
    elevateWindowZ(el);

    let scriptText = initialState.text ?? DEFAULT_TELEPROMPTER_SCRIPT;
    let scrollRatio = initialState.scrollRatio ?? 0;
    let playing = initialState.playing !== undefined ? Boolean(initialState.playing) : true;
    let speed = initialState.speed ?? 1.2;
    let mirrored = Boolean(initialState.mirrored);
    let rafId = null;
    let lastTs = performance.now();
    let lastSyncSent = 0;

    function getPlayButtonHTML(isPlaying) {
      return isPlaying
        ? `${ICONS.pause}<span>Pause</span>`
        : `${ICONS.play}<span>Play</span>`;
    }

    el.innerHTML = `
      <div class="dm-header">
        <div class="dm-title-group">
          <span class="dm-dot indigo"></span>
          <span class="dm-icon">${ICONS.prompter}</span>
          <span class="dm-title">${isPhone ? 'Top-Notch Eye-Line Teleprompter' : 'Webcam Teleprompter & Speaker HUD'}</span>
          <span class="dm-badge" data-role="speed-badge">60 FPS · ${speed.toFixed(1)}X</span>
        </div>
        <button class="dm-close" title="Close" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="dm-eye-banner">
        ${ICONS.eye}
        <span>${isPhone ? 'Phone is next to the laptop camera' : 'Put the phone at the top, next to the laptop camera'}</span>
      </div>
      <div class="dm-prompter-viewport">
        <div class="dm-prompter-guide"></div>
        <div class="dm-prompter-scroll" data-role="scroll-body"></div>
      </div>
      ${
        !isPhone
          ? `<div style="padding:8px 12px;background:#0b0c0e;border-top:1px solid rgba(255,255,255,0.08)">
              <textarea class="dm-textarea" data-role="script-input" placeholder="Paste speaker notes or keynote script..."></textarea>
             </div>`
          : ''
      }
      <div class="dm-controls-bar">
        <div style="display:flex;align-items:center;gap:6px">
          <button class="dm-btn cyan ${playing ? 'active' : ''}" data-role="play-btn">
            ${getPlayButtonHTML(playing)}
          </button>
          <button class="dm-btn" data-role="reset-btn" title="Restart Script">
            ${ICONS.reset}
            <span>Top</span>
          </button>
          <button class="dm-btn ${mirrored ? 'active' : ''}" data-role="mirror-btn" title="Mirror horizontally">
            ${ICONS.mirror}
            <span>Mirror</span>
          </button>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:11px;color:#8a8f98;font-variant-numeric:tabular-nums">Pace</span>
          <input class="dm-slider" data-role="speed-slider" type="range" min="0.5" max="3.0" step="0.1" value="${speed}">
          ${
            !isPhone
              ? `<button class="dm-btn" data-role="dock-top-btn" title="Snap docked phone strip to Top Notch">
                  ${ICONS.dockTop}
                  <span>Dock Top</span>
                </button>`
              : ''
          }
        </div>
      </div>
    `;

    document.body.appendChild(el);
    makeWindowDraggable(el, el.querySelector('.dm-header'), startX, startY);

    const scrollBody = el.querySelector('[data-role="scroll-body"]');
    const playBtn = el.querySelector('[data-role="play-btn"]');
    const resetBtn = el.querySelector('[data-role="reset-btn"]');
    const mirrorBtn = el.querySelector('[data-role="mirror-btn"]');
    const speedSlider = el.querySelector('[data-role="speed-slider"]');
    const speedBadge = el.querySelector('[data-role="speed-badge"]');
    const scriptInput = el.querySelector('[data-role="script-input"]');
    const dockTopBtn = el.querySelector('[data-role="dock-top-btn"]');

    function renderScriptText() {
      scrollBody.textContent = scriptText;
      scrollBody.style.whiteSpace = 'pre-wrap';
      if (scriptInput && document.activeElement !== scriptInput) {
        scriptInput.value = scriptText;
      }
    }
    renderScriptText();

    function broadcastTeleprompter(force = false) {
      const now = performance.now();
      if (!force && now - lastSyncSent < 75) return;
      lastSyncSent = now;
      sendSync({
        mode: 'teleprompter',
        text: scriptText,
        scrollRatio,
        playing,
        speed,
        mirrored,
      });
    }

    function updateControlsUI() {
      playBtn.classList.toggle('active', playing);
      playBtn.innerHTML = getPlayButtonHTML(playing);
      mirrorBtn.classList.toggle('active', mirrored);
      speedBadge.textContent = `60 FPS · ${Number(speed).toFixed(1)}X`;
      if (speedSlider) speedSlider.value = String(speed);
    }

    playBtn.addEventListener('click', () => {
      playing = !playing;
      updateControlsUI();
      broadcastTeleprompter(true);
    });

    resetBtn.addEventListener('click', () => {
      scrollRatio = 0;
      broadcastTeleprompter(true);
    });

    mirrorBtn.addEventListener('click', () => {
      mirrored = !mirrored;
      updateControlsUI();
      broadcastTeleprompter(true);
    });

    speedSlider.addEventListener('input', () => {
      speed = parseFloat(speedSlider.value) || 1.0;
      updateControlsUI();
      broadcastTeleprompter(false);
    });

    if (scriptInput) {
      scriptInput.value = scriptText;
      scriptInput.addEventListener('input', () => {
        scriptText = scriptInput.value;
        scrollBody.textContent = scriptText;
        broadcastTeleprompter(false);
      });
    }

    if (dockTopBtn) {
      dockTopBtn.addEventListener('click', () => {
        const phonePeers = peers().filter((p) => p.id !== selfId() && p.role === 'phone');
        for (const p of phonePeers) {
          p.edge = 'top';
          p.centerRatio = 0.5;
          sendRaw({ type: 'update_strip', peerId: p.id, edge: 'top', centerRatio: 0.5 });
        }
        window.dispatchEvent(new Event('resize'));
        broadcastTeleprompter(true);
        toast('Docked phone strip aligned to top webcam notch');
      });
    }

    function tick(now) {
      const dt = Math.min(0.1, (now - lastTs) / 1000);
      lastTs = now;

      const maxScroll = Math.max(1, scrollBody.scrollHeight - 130);
      if (playing) {
        const pxPerSec = 26 * speed;
        scrollRatio = Math.min(1, scrollRatio + (pxPerSec * dt) / maxScroll);
        if (scrollRatio >= 1) {
          scrollRatio = 0;
        }
        if (!isPhone) {
          broadcastTeleprompter(false);
        }
      }

      const yOffset = -scrollRatio * maxScroll;
      const scaleX = mirrored ? -1 : 1;
      scrollBody.style.transform = `translate3d(0, ${yOffset.toFixed(1)}px, 0) scaleX(${scaleX})`;

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    function close() {
      if (rafId) cancelAnimationFrame(rafId);
      el.remove();
      teleprompterInstance = null;
    }

    el.querySelector('.dm-close').addEventListener('click', close);

    teleprompterInstance = {
      el,
      close,
      applyRemoteState(msg) {
        if (typeof msg.text === 'string' && msg.text !== scriptText) {
          scriptText = msg.text;
          renderScriptText();
        }
        if (typeof msg.scrollRatio === 'number') scrollRatio = msg.scrollRatio;
        if (typeof msg.playing === 'boolean') playing = msg.playing;
        if (typeof msg.speed === 'number') speed = msg.speed;
        if (typeof msg.mirrored === 'boolean') mirrored = msg.mirrored;
        updateControlsUI();
      },
    };

    if (!initialState._fromRemote) {
      broadcastTeleprompter(true);
    }

    return teleprompterInstance;
  }

  // ==========================================================================
  // MODE 3: Cross-Screen Continuum XY Harmonic Synth
  // ==========================================================================
  let synthAudioCtx = null;
  const HARMONIC_NOTES = [130.81, 164.81, 196.0, 246.94, 293.66, 369.99, 392.0, 493.88, 587.33, 659.25];

  function createSynthVoice() {
    let active = false;
    let osc1 = null;
    let osc2 = null;
    let subOsc = null;
    let filter = null;
    let gain = null;

    function ensureStarted() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      if (!synthAudioCtx) synthAudioCtx = new AC();
      if (synthAudioCtx.state === 'suspended') synthAudioCtx.resume();
      if (active) return true;

      const now = synthAudioCtx.currentTime;
      osc1 = synthAudioCtx.createOscillator();
      osc2 = synthAudioCtx.createOscillator();
      subOsc = synthAudioCtx.createOscillator();
      filter = synthAudioCtx.createBiquadFilter();
      gain = synthAudioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      subOsc.type = 'sine';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(4.2, now);

      gain.gain.setValueAtTime(0.0001, now);

      osc1.connect(filter);
      osc2.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(synthAudioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);
      active = true;
      return true;
    }

    function update(xRatio, yRatio, isDown) {
      if (!isDown) {
        if (active && gain && synthAudioCtx) {
          gain.gain.setTargetAtTime(0.0001, synthAudioCtx.currentTime, 0.08);
        }
        return;
      }
      if (!ensureStarted()) return;
      const now = synthAudioCtx.currentTime;
      const clampedX = Math.max(0, Math.min(1, xRatio));
      const clampedY = Math.max(0, Math.min(1, yRatio));

      const idxFloat = clampedX * (HARMONIC_NOTES.length - 1);
      const i0 = Math.floor(idxFloat);
      const i1 = Math.min(HARMONIC_NOTES.length - 1, i0 + 1);
      const frac = idxFloat - i0;
      const baseFreq = HARMONIC_NOTES[i0] * (1 - frac) + HARMONIC_NOTES[i1] * frac;

      osc1.frequency.setTargetAtTime(baseFreq, now, 0.025);
      osc2.frequency.setTargetAtTime(baseFreq * 1.498, now, 0.025);
      subOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.025);

      const cutoff = 180 * Math.pow(24, 1 - clampedY);
      filter.frequency.setTargetAtTime(cutoff, now, 0.03);
      filter.Q.setTargetAtTime(2.5 + (1 - clampedY) * 6.5, now, 0.03);
      gain.gain.setTargetAtTime(0.11, now, 0.03);
    }

    function dispose() {
      try {
        if (osc1) osc1.stop();
        if (osc2) osc2.stop();
        if (subOsc) subOsc.stop();
      } catch {}
      active = false;
    }

    return { update, dispose };
  }

  function openContinuumSynth(initialState = {}) {
    if (synthInstance) {
      synthInstance.applyRemoteState(initialState);
      elevateWindowZ(synthInstance.el);
      return synthInstance;
    }

    const isPhone = role() === 'phone';
    const winW = isPhone ? Math.min(window.innerWidth - 20, 420) : 440;
    const winH = 265;
    const startX = isPhone
      ? Math.round((window.innerWidth - winW) / 2)
      : Math.round(window.innerWidth * 0.5 - winW / 2 + 40);
    const startY = isPhone ? 90 : Math.round(window.innerHeight * 0.48 - winH / 2);

    const el = document.createElement('div');
    el.className = 'dm-window dm-spanning-active';
    el.style.width = `${winW}px`;
    el.style.height = `${winH}px`;
    elevateWindowZ(el);

    el.innerHTML = `
      <div class="dm-header">
        <div class="dm-title-group">
          <span class="dm-dot indigo"></span>
          <span class="dm-icon">${ICONS.synth}</span>
          <span class="dm-title">Synth across screens</span>
          <span class="dm-badge indigo" data-role="note-badge">60 FPS · SYNCED</span>
        </div>
        <button class="dm-close" title="Close" aria-label="Close">${ICONS.close}</button>
      </div>
      <div style="position:relative;flex:1;width:100%;overflow:hidden;background:#07080a;cursor:crosshair">
        <canvas data-role="synth-canvas" style="width:100%;height:100%;display:block;touch-action:none"></canvas>
      </div>
      <div class="dm-controls-bar">
        <span style="font-size:11px;color:#8a8f98">
          <strong style="color:#f4f5f8;font-weight:500">Drag ribbon on Laptop &amp; Phone</strong> for two-handed harmonic chords
        </span>
        <span class="dm-badge" data-role="coord-badge">XY READY</span>
      </div>
    `;

    document.body.appendChild(el);
    makeWindowDraggable(el, el.querySelector('.dm-header'), startX, startY);

    const canvas = el.querySelector('[data-role="synth-canvas"]');
    const ctx = canvas.getContext('2d');
    const noteBadge = el.querySelector('[data-role="note-badge"]');
    const coordBadge = el.querySelector('[data-role="coord-badge"]');

    const localVoice = createSynthVoice();
    const remoteVoice = createSynthVoice();

    const localCursor = { x: 0.5, y: 0.5, active: false };
    const remoteCursor = {
      x: initialState.xRatio ?? 0.5,
      y: initialState.yRatio ?? 0.5,
      active: Boolean(initialState.active),
    };
    const ripples = [];
    let rafId = null;
    let activePointerId = null;

    const NOTE_LABELS = ['C3', 'E3', 'G3', 'B3', 'D4', 'F#4', 'G4', 'B4', 'D5', 'E5'];

    function pointerToXY(e) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
      return { x, y };
    }

    function updateLocalSynth(x, y, isDown) {
      localCursor.x = x;
      localCursor.y = y;
      localCursor.active = isDown;
      localVoice.update(x, y, isDown);

      const noteName = NOTE_LABELS[Math.round(x * (NOTE_LABELS.length - 1))] || 'C4';
      const cutoffHz = Math.round(180 * Math.pow(24, 1 - y));
      noteBadge.textContent = isDown ? `${noteName} · ${cutoffHz} HZ` : '60 FPS · SYNCED';
      coordBadge.textContent = isDown ? `X ${(x * 100).toFixed(0)}% · Y ${((1 - y) * 100).toFixed(0)}%` : 'XY READY';

      if (isDown) {
        ripples.push({ x, y, r: 0, alpha: 0.85, color: '#38bdf8' });
      }

      sendSync({
        mode: 'synth',
        xRatio: Number(x.toFixed(3)),
        yRatio: Number(y.toFixed(3)),
        active: isDown,
      });
    }

    canvas.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (activePointerId !== null) return;
      activePointerId = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
      const { x, y } = pointerToXY(e);
      updateLocalSynth(x, y, true);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== activePointerId) return;
      e.stopPropagation();
      const { x, y } = pointerToXY(e);
      updateLocalSynth(x, y, true);
    });

    const stopPointer = (e) => {
      if (e.pointerId !== activePointerId) return;
      activePointerId = null;
      updateLocalSynth(localCursor.x, localCursor.y, false);
    };
    canvas.addEventListener('pointerup', stopPointer);
    canvas.addEventListener('pointercancel', stopPointer);

    function renderSynth() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.max(1, Math.round(rect.width * dpr));
      const H = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      const t = performance.now() / 1000;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < NOTE_LABELS.length; i++) {
        const sx = ((i + 0.5) / NOTE_LABELS.length) * W;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, H);
        ctx.stroke();

        ctx.fillStyle = 'rgba(138, 143, 152, 0.55)';
        ctx.font = `500 ${10 * dpr}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillText(NOTE_LABELS[i], sx - 8 * dpr, H - 8 * dpr);
      }

      const cursors = [
        { ...localCursor, color: '#38bdf8', label: role() === 'phone' ? 'Phone' : 'MacBook' },
        { ...remoteCursor, color: '#5e6ad2', label: role() === 'phone' ? 'MacBook' : 'Phone' },
      ];

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (const c of cursors) {
        if (!c.active) continue;
        const cx = c.x * W;
        const cy = c.y * H;

        ctx.beginPath();
        for (let px = 0; px <= W; px += 6) {
          const dist = Math.abs(px - cx) / W;
          const env = Math.exp(-dist * 5.5);
          const wave = Math.sin(px * 0.08 - t * 28) * (1 - c.y) * 26 * dpr * env;
          const py = cy + wave;
          if (px === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 2.4 * dpr;
        ctx.stroke();

        const orb = ctx.createRadialGradient(cx, cy, 2 * dpr, cx, cy, 40 * dpr);
        orb.addColorStop(0, '#ffffff');
        orb.addColorStop(0.3, c.color);
        orb.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(cx, cy, 40 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 1.8 * dpr;
        rp.alpha *= 0.93;
        if (rp.alpha < 0.03) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = rp.color;
        ctx.globalAlpha = rp.alpha;
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.arc(rp.x * W, rp.y * H, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      rafId = requestAnimationFrame(renderSynth);
    }

    rafId = requestAnimationFrame(renderSynth);

    function close() {
      if (rafId) cancelAnimationFrame(rafId);
      localVoice.dispose();
      remoteVoice.dispose();
      el.remove();
      synthInstance = null;
    }

    el.querySelector('.dm-close').addEventListener('click', close);

    synthInstance = {
      el,
      close,
      applyRemoteState(msg) {
        if (typeof msg.xRatio === 'number') remoteCursor.x = msg.xRatio;
        if (typeof msg.yRatio === 'number') remoteCursor.y = msg.yRatio;
        if (typeof msg.active === 'boolean') remoteCursor.active = msg.active;
        remoteVoice.update(remoteCursor.x, remoteCursor.y, remoteCursor.active);
        if (remoteCursor.active) {
          ripples.push({
            x: remoteCursor.x,
            y: remoteCursor.y,
            r: 0,
            alpha: 0.75,
            color: '#5e6ad2',
          });
        }
      },
    };

    if (initialState.active) {
      synthInstance.applyRemoteState(initialState);
    }

    return synthInstance;
  }

  // ==========================================================================
  // Incoming WebSocket Dispatcher (`handleDisplayModeMessage`)
  // ==========================================================================
  function dispatchDisplayModeMessage(msg) {
    if (!msg || msg.type !== 'display_mode_sync') return false;

    if (msg.mode === 'panoramic') {
      if (msg.active === false && panoramicInstance && role() === 'phone') {
        panoramicInstance.close();
        return true;
      }
      openPanoramicWall({ ...msg, _fromRemote: true });
      return true;
    }

    if (msg.mode === 'teleprompter') {
      openNotchTeleprompter({ ...msg, _fromRemote: true });
      return true;
    }

    if (msg.mode === 'synth') {
      openContinuumSynth({ ...msg, _fromRemote: true });
      return true;
    }

    return false;
  }

  latestDispatcher = dispatchDisplayModeMessage;

  const api = {
    handleDisplayModeMessage: dispatchDisplayModeMessage,
    openTeleprompter: openNotchTeleprompter,
    openNotchTeleprompter,
    openPanoramicWall,
    openContinuumSynth,
  };

  activeDisplayModesInstance = api;

  if (typeof window !== 'undefined') {
    window.oneGlassDisplayModes = api;
    window.openTeleprompter = openNotchTeleprompter;
    window.openNotchTeleprompter = openNotchTeleprompter;
    window.openPanoramicWall = openPanoramicWall;
    window.openContinuumSynth = openContinuumSynth;
  }

  return api;
}

export function openTeleprompter(initialState) {
  if (!activeDisplayModesInstance) {
    activeDisplayModesInstance = initDisplayModes();
  }
  return activeDisplayModesInstance.openTeleprompter(initialState);
}

export function openNotchTeleprompter(initialState) {
  if (!activeDisplayModesInstance) {
    activeDisplayModesInstance = initDisplayModes();
  }
  return activeDisplayModesInstance.openNotchTeleprompter(initialState);
}

export function openPanoramicWall(initialState) {
  if (!activeDisplayModesInstance) {
    activeDisplayModesInstance = initDisplayModes();
  }
  return activeDisplayModesInstance.openPanoramicWall(initialState);
}

export function openContinuumSynth(initialState) {
  if (!activeDisplayModesInstance) {
    activeDisplayModesInstance = initDisplayModes();
  }
  return activeDisplayModesInstance.openContinuumSynth(initialState);
}

export default {
  initDisplayModes,
  openTeleprompter,
  openNotchTeleprompter,
  openPanoramicWall,
  openContinuumSynth,
  handleDisplayModeMessage,
};
