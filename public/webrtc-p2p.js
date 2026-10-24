/**
 * OneGlass — WebRTC P2P Mesh & Dual RTCDataChannel Engine (Linear Design System Edition)
 * Standalone browser ES module with zero external dependencies.
 *
 * Implements:
 *  1. Automatic Mesh RTCPeerConnection + Dual RTCDataChannel Engine:
 *     - Signaling over WebSocket ({ type: 'webrtc_signal', targetId, fromId, signalData })
 *     - 'fast-telemetry' ({ ordered: false, maxRetransmits: 0 }) for <1ms 120Hz bezel-crossing drag & remote trackpad packets
 *     - 'reliable-continuity' ({ ordered: true }) for direct P2P data & clipboard payloads
 *     - sendP2P(msgObj, channelName = 'fast-telemetry') with automatic transparent WebSocket fallback
 *  2. Linear-Styled P2P Network Inspector Modal (openP2PInspector()):
 *     - Zero emojis anywhere; crisp 14x14 stroke-width="1.5" SVG icons
 *     - #0b0c0e obsidian surface, 1px solid rgba(255,255,255,0.08) hairline borders
 *     - font-variant-numeric: tabular-nums live metrics (Peer ID, ICE state, transport, protocol and RTT read from getStats(), Packets Sent/Received); '--' when nothing was measured
 *     - Clickable P2P status chip in .status-rail that lights up emerald when a direct RTCDataChannel to a real peer opens
 *     - Emil Kowalski motion rules: no transition: all, :active { transform: scale(0.97) }, cubic-bezier(0.23, 1, 0.32, 1)
 */

const P2P_STYLE_ID = 'oneglass-webrtc-p2p-styles';
const P2P_CHIP_ID = 'p2p-status-chip';
const P2P_MODAL_BACKDROP_ID = 'p2p-inspector-backdrop';
const P2P_MODAL_ID = 'p2p-inspector-modal';

const FAST_CHANNEL = 'fast-telemetry';
const RELIABLE_CHANNEL = 'reliable-continuity';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 2,
};

const SVG_ICONS = {
  mesh: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="3" cy="3.5" r="1.5"/><circle cx="11" cy="3.5" r="1.5"/><circle cx="7" cy="10.75" r="1.5"/><path d="M4.35 4.25l5.3 0M3.85 4.85l2.35 4.55M10.15 4.85l-2.35 4.55"/></svg>`,
  bolt: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.75 1.75L3 8h3.75l-.5 4.25L11 6H7.25l.5-4.25z"/></svg>`,
  shield: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1.75l4.5 1.75v3.25c0 2.95-1.9 4.75-4.5 5.5-2.6-.75-4.5-2.55-4.5-5.5V3.5L7 1.75z"/><path d="M5.15 7.05l1.3 1.3 2.45-2.55"/></svg>`,
  pulse: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 7h2.25l1.5-3.75 2.5 7.5 1.75-3.75H12.5"/></svg>`,
  packets: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 2.5v9M2.25 4.75L4.5 2.5l2.25 2.25M9.5 11.5v-9M7.25 9.25L9.5 11.5l2.25-2.25"/></svg>`,
  refresh: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 7a4.75 4.75 0 0 1 8.1-3.35L11.75 5M11.75 2.5V5h-2.5M11.75 7a4.75 4.75 0 0 1-8.1 3.35L2.25 9M2.25 11.5V9h2.5"/></svg>`,
  close: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7"/></svg>`,
  device: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.25" y="2" width="6.25" height="9.5" rx="1.25"/><rect x="8.5" y="4.25" width="3.25" height="7.25" rx="1"/></svg>`,
  terminal: `<svg class="p2p-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2.25" width="10.5" height="9.5" rx="1.5"/><path d="M4.25 5.25L6.25 7l-2 1.75M7.25 8.75h2.5"/></svg>`,
};

let activeInstance = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBytesCompact(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function formatRtt(rttMs) {
  if (rttMs == null || !Number.isFinite(rttMs)) return '-- ms';
  if (rttMs < 1) return `${Math.max(0.1, rttMs).toFixed(2)} ms`;
  return `${rttMs.toFixed(1)} ms`;
}

function injectP2PStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(P2P_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = P2P_STYLE_ID;
  style.textContent = `
    .p2p-svg {
      width: 14px;
      height: 14px;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
    }

    .p2p-tabular {
      font-variant-numeric: tabular-nums;
    }

    /* Clickable Top-Bar Status Rail Chip */
    #${P2P_CHIP_ID} {
      appearance: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2.5px 8px;
      border-radius: 6px;
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #8a8f98;
      font: 500 11px/1 "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      letter-spacing: -0.01em;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      pointer-events: auto;
      white-space: nowrap;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
      transition:
        transform 140ms cubic-bezier(0.23, 1, 0.32, 1),
        border-color 180ms cubic-bezier(0.23, 1, 0.32, 1),
        background-color 180ms cubic-bezier(0.23, 1, 0.32, 1),
        color 180ms cubic-bezier(0.23, 1, 0.32, 1),
        box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    @media (hover: hover) and (pointer: fine) {
      #${P2P_CHIP_ID}:hover {
        border-color: rgba(255, 255, 255, 0.18);
        color: #f2f3f5;
        background: #121418;
      }
    }

    #${P2P_CHIP_ID}:active {
      transform: scale(0.97);
    }

    #${P2P_CHIP_ID}.is-connected {
      background: rgba(44, 201, 144, 0.11);
      border-color: rgba(44, 201, 144, 0.36);
      color: #2cc990;
      box-shadow:
        inset 0 1px 0 rgba(44, 201, 144, 0.18),
        0 0 16px rgba(44, 201, 144, 0.16);
    }

    @media (hover: hover) and (pointer: fine) {
      #${P2P_CHIP_ID}.is-connected:hover {
        background: rgba(44, 201, 144, 0.16);
        border-color: rgba(44, 201, 144, 0.52);
        color: #4fe3ae;
      }
    }

    .p2p-chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #575b66;
      flex-shrink: 0;
      transition:
        background-color 180ms cubic-bezier(0.23, 1, 0.32, 1),
        box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    #${P2P_CHIP_ID}.is-connected .p2p-chip-dot {
      background: #2cc990;
      box-shadow: 0 0 8px rgba(44, 201, 144, 0.85);
    }

    .p2p-chip-rtt {
      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgba(242, 243, 245, 0.72);
      padding-left: 4px;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      font-variant-numeric: tabular-nums;
    }

    #${P2P_CHIP_ID}.is-connected .p2p-chip-rtt {
      color: #b4f4dc;
      border-left-color: rgba(44, 201, 144, 0.28);
    }

    /* Linear-Styled P2P Network Inspector Modal */
    #${P2P_MODAL_BACKDROP_ID} {
      position: fixed;
      inset: 0;
      z-index: 70;
      background: rgba(4, 5, 7, 0.68);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    #${P2P_MODAL_BACKDROP_ID}.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    #${P2P_MODAL_ID} {
      width: min(680px, calc(100vw - 24px));
      max-height: min(84vh, 660px);
      display: flex;
      flex-direction: column;
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: #f2f3f5;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      font-size: 12.5px;
      letter-spacing: -0.011em;
      font-variant-numeric: tabular-nums;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.08),
        0 28px 70px rgba(0, 0, 0, 0.82);
      transform: translate3d(0, 10px, 0) scale(0.97);
      opacity: 0;
      transition:
        transform 220ms cubic-bezier(0.23, 1, 0.32, 1),
        opacity 180ms cubic-bezier(0.23, 1, 0.32, 1);
      overflow: hidden;
    }

    #${P2P_MODAL_BACKDROP_ID}.is-open #${P2P_MODAL_ID} {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }

    .p2p-modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 13px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.015);
    }

    .p2p-modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
    }

    .p2p-modal-icon-box {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: rgba(94, 106, 210, 0.14);
      border: 1px solid rgba(94, 106, 210, 0.34);
      color: #8b95f6;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .p2p-modal-title {
      font-size: 13px;
      font-weight: 600;
      color: #f2f3f5;
      letter-spacing: -0.014em;
      white-space: nowrap;
    }

    .p2p-modal-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2.5px 7px;
      border-radius: 5px;
      font: 500 10.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #8a8f98;
      font-variant-numeric: tabular-nums;
    }

    .p2p-modal-badge.is-live {
      background: rgba(44, 201, 144, 0.12);
      border-color: rgba(44, 201, 144, 0.34);
      color: #2cc990;
    }

    .p2p-modal-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .p2p-btn {
      appearance: none;
      background: #111317;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #d4d8e1;
      border-radius: 6px;
      padding: 5px 9px;
      font: 500 11.5px/1 "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      letter-spacing: -0.01em;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      transition:
        transform 130ms cubic-bezier(0.23, 1, 0.32, 1),
        border-color 150ms cubic-bezier(0.23, 1, 0.32, 1),
        background-color 150ms cubic-bezier(0.23, 1, 0.32, 1),
        color 150ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    @media (hover: hover) and (pointer: fine) {
      .p2p-btn:hover {
        background: #171a20;
        border-color: rgba(255, 255, 255, 0.16);
        color: #f2f3f5;
      }
    }

    .p2p-btn:active {
      transform: scale(0.97);
    }

    .p2p-btn-icon {
      padding: 5px;
      width: 25px;
      height: 25px;
      justify-content: center;
    }

    .p2p-modal-body {
      padding: 14px 16px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Summary KPI Grid */
    .p2p-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }

    @media (max-width: 600px) {
      .p2p-kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .p2p-kpi-card {
      background: #0e1014;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 10px 11px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-variant-numeric: tabular-nums;
    }

    .p2p-kpi-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      font-size: 11px;
      color: #8a8f98;
      font-weight: 500;
    }

    .p2p-kpi-value {
      font: 600 13.5px/1.2 ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
      color: #f2f3f5;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .p2p-kpi-value.emerald {
      color: #2cc990;
    }

    .p2p-kpi-sub {
      font-size: 10.5px;
      color: #575b66;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Dual RTCDataChannel Spec Strip */
    .p2p-channels-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    @media (max-width: 600px) {
      .p2p-channels-row {
        grid-template-columns: 1fr;
      }
    }

    .p2p-channel-box {
      background: #0e1014;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 9px 11px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-variant-numeric: tabular-nums;
    }

    .p2p-channel-left {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .p2p-channel-name {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font: 600 11.5px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #f2f3f5;
    }

    .p2p-channel-desc {
      font-size: 11px;
      color: #8a8f98;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .p2p-channel-cfg {
      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #8a8f98;
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 5px;
      padding: 3.5px 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Peer Telemetry Table */
    .p2p-table-wrap {
      background: #0e1014;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      overflow: hidden;
    }

    .p2p-table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.015);
      font-size: 11px;
      font-weight: 600;
      color: #8a8f98;
      letter-spacing: 0.01em;
    }

    .p2p-peer-table {
      width: 100%;
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }

    .p2p-peer-table th {
      text-align: left;
      padding: 7px 11px;
      font-size: 10.5px;
      font-weight: 500;
      color: #575b66;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      white-space: nowrap;
    }

    .p2p-peer-table td {
      padding: 9px 11px;
      font: 11.5px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #f2f3f5;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .p2p-peer-table tr:last-child td {
      border-bottom: none;
    }

    .p2p-state-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 6.5px;
      border-radius: 4px;
      font: 600 10.5px/1.1 ui-monospace, SFMono-Regular, Menlo, monospace;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #8a8f98;
    }

    .p2p-state-pill.connected {
      background: rgba(44, 201, 144, 0.12);
      border-color: rgba(44, 201, 144, 0.34);
      color: #2cc990;
    }

    .p2p-state-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .p2p-peer-sub {
      font-family: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      font-size: 10.5px;
      color: #8a8f98;
      margin-left: 6px;
    }

    .p2p-modal-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 9px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.01);
      font-size: 11px;
      color: #8a8f98;
      font-variant-numeric: tabular-nums;
    }

    .p2p-foot-mono {
      font: 10.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #8a8f98;
      font-variant-numeric: tabular-nums;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initializes the OneGlass WebRTC P2P Mesh Engine and Linear Network Inspector.
 *
 * @param {Object} ctx
 * @param {() => WebSocket | null} ctx.getWs
 * @param {() => string} ctx.getRole
 * @param {() => string | null} ctx.getSelfId
 * @param {() => Array<Object>} ctx.getPeers
 * @param {(msg: Object, meta?: Object) => void} [ctx.onP2PMessage]
 * @param {(text: string) => void} [ctx.showToast]
 */
export function initWebRTCP2P({
  getWs,
  getRole,
  getSelfId,
  getPeers,
  onP2PMessage,
  showToast,
} = {}) {
  if (activeInstance) {
    activeInstance.updateCallbacks({ getWs, getRole, getSelfId, getPeers, onP2PMessage, showToast });
    return activeInstance.api;
  }

  injectP2PStyles();

  let callbacks = { getWs, getRole, getSelfId, getPeers, onP2PMessage, showToast };
  const peerEntries = new Map();
  const processedSignalIds = new Set();
  let observedWs = null;
  let pingSeq = 0;
  let isInspectorOpen = false;
  let announcedFirstP2P = false;

  // Optional loopback self-test, started only from the inspector's benchmark button.
  // It measures this device talking to itself and is never counted or shown as a peer link.
  let loopbackSession = null;

  function safeGetSelfId() {
    return callbacks.getSelfId?.() || null;
  }

  function safeGetRole() {
    return callbacks.getRole?.() || 'laptop';
  }

  function safeGetPeers() {
    const list = callbacks.getPeers?.();
    return Array.isArray(list) ? list : [];
  }

  function safeGetWs() {
    return callbacks.getWs?.() || null;
  }

  function sendSignaling(targetId, signalData) {
    const ws = safeGetWs();
    if (!ws || ws.readyState !== 1) return false;
    const sigId = `sig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      type: 'webrtc_signal',
      targetId,
      fromId: safeGetSelfId(),
      signalId: sigId,
      signalData: {
        ...signalData,
        signalId: sigId,
      },
    };
    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  function isChannelOpen(dc) {
    return Boolean(dc && dc.readyState === 'open');
  }

  function isEntryConnected(entry) {
    if (!entry) return false;
    return isChannelOpen(entry.channels[FAST_CHANNEL]) || isChannelOpen(entry.channels[RELIABLE_CHANNEL]);
  }

  function hasRealPeerConnected() {
    for (const entry of peerEntries.values()) {
      if (!entry.isLoopback && isEntryConnected(entry)) return true;
    }
    return false;
  }

  function isConnected() {
    return hasRealPeerConnected();
  }

  function hasAnyOpenDataChannel() {
    return hasRealPeerConnected();
  }

  function attachDataChannel(entry, dc) {
    if (!dc || !entry) return;
    const label = dc.label || FAST_CHANNEL;
    entry.channels[label] = dc;

    dc.onopen = () => {
      if (!entry.stats.connectedAt) {
        entry.stats.connectedAt = Date.now();
      }
      entry.stats.iceState = 'connected';
      entry.stats.transport = entry.isLoopback ? 'Loopback (this device)' : 'RTCDataChannel';
      sendPingToEntry(entry);
      updateStatusChipUI();
      if (isInspectorOpen) renderInspectorContents();

      if (!entry.isLoopback && !announcedFirstP2P) {
        announcedFirstP2P = true;
        callbacks.showToast?.('Direct connection ready');
      }
    };

    dc.onclose = () => {
      updateStatusChipUI();
      if (isInspectorOpen) renderInspectorContents();
    };

    dc.onerror = () => {
      updateStatusChipUI();
      if (isInspectorOpen) renderInspectorContents();
    };

    dc.onmessage = (ev) => {
      const raw = typeof ev.data === 'string' ? ev.data : '';
      const byteLen = raw ? raw.length : ev.data?.byteLength || 64;
      entry.stats.packetsReceived += 1;
      entry.stats.bytesReceived += byteLen;

      if (!raw) return;
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      if (msg && msg.__p2p_internal === 'ping') {
        if (dc.readyState === 'open') {
          const pongRaw = JSON.stringify({
            __p2p_internal: 'pong',
            t0: msg.t0,
            seq: msg.seq,
          });
          try {
            dc.send(pongRaw);
            entry.stats.packetsSent += 1;
            entry.stats.bytesSent += pongRaw.length;
          } catch {}
        }
        return;
      }

      if (msg && msg.__p2p_internal === 'pong') {
        const elapsed = Math.max(0.12, performance.now() - Number(msg.t0 || performance.now()));
        entry.stats.rttMs =
          entry.stats.rttMs == null ? elapsed : entry.stats.rttMs * 0.65 + elapsed * 0.35;
        updateStatusChipUI();
        if (isInspectorOpen) renderInspectorContents();
        return;
      }

      if (entry.isLoopback) {
        return;
      }
      // Dispatch incoming P2P message directly into app message handlers & window custom event
      dispatchP2PMessage(msg, {
        peerId: entry.peerId,
        channel: label,
        transport: 'RTCDataChannel',
      });

      if (isInspectorOpen) renderInspectorContents();
    };
  }

  function sendPingToEntry(entry) {
    if (!entry) return;
    const dc = entry.channels[FAST_CHANNEL] || entry.channels[RELIABLE_CHANNEL];
    if (!dc || dc.readyState !== 'open') return;
    const raw = JSON.stringify({
      __p2p_internal: 'ping',
      t0: performance.now(),
      seq: ++pingSeq,
    });
    try {
      dc.send(raw);
      entry.stats.packetsSent += 1;
      entry.stats.bytesSent += raw.length;
    } catch {}
  }

  function createDualDataChannels(entry) {
    if (!entry || !entry.pc || entry.channelsCreated) return;
    entry.channelsCreated = true;
    try {
      const fastDc = entry.pc.createDataChannel(FAST_CHANNEL, {
        ordered: false,
        maxRetransmits: 0,
      });
      attachDataChannel(entry, fastDc);
    } catch {}

    try {
      const reliableDc = entry.pc.createDataChannel(RELIABLE_CHANNEL, {
        ordered: true,
      });
      attachDataChannel(entry, reliableDc);
    } catch {}
  }

  async function initiateOfferForEntry(entry) {
    if (!entry || !entry.pc || entry.makingOffer) return;
    if (entry.pc.signalingState !== 'stable') return;
    try {
      entry.makingOffer = true;
      createDualDataChannels(entry);
      const offer = await entry.pc.createOffer();
      if (entry.pc.signalingState !== 'stable') return;
      await entry.pc.setLocalDescription(offer);
      sendSignaling(entry.peerId, {
        type: entry.pc.localDescription.type,
        sdp: entry.pc.localDescription.sdp,
        description: {
          type: entry.pc.localDescription.type,
          sdp: entry.pc.localDescription.sdp,
        },
      });
    } catch {
    } finally {
      entry.makingOffer = false;
    }
  }

  function ensurePeerEntry(peerId, peerMeta = null) {
    if (!peerId) return null;
    let entry = peerEntries.get(peerId);
    if (entry) {
      if (peerMeta) entry.meta = { ...entry.meta, ...peerMeta };
      return entry;
    }

    if (typeof RTCPeerConnection === 'undefined') return null;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    entry = {
      peerId,
      isLoopback: false,
      meta: peerMeta || { id: peerId, name: peerId, role: 'phone', edge: 'right' },
      pc,
      channelsCreated: false,
      channels: {
        [FAST_CHANNEL]: null,
        [RELIABLE_CHANNEL]: null,
      },
      makingOffer: false,
      ignoreOffer: false,
      isSettingRemoteAnswerPending: false,
      pendingCandidates: [],
      createdAt: Date.now(),
      stats: {
        iceState: 'checking',
        transport: 'WebSocket signaling',
        protocol: null,
        rttMs: null,
        packetsSent: 0,
        packetsReceived: 0,
        bytesSent: 0,
        bytesReceived: 0,
        connectedAt: null,
      },
    };
    peerEntries.set(peerId, entry);

    pc.ondatachannel = (ev) => {
      if (ev.channel) attachDataChannel(entry, ev.channel);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        sendSignaling(peerId, {
          type: 'candidate',
          candidate: ev.candidate.toJSON ? ev.candidate.toJSON() : ev.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      const st = pc.iceConnectionState;
      if (st === 'connected' || st === 'completed') {
        entry.stats.iceState = 'connected';
      } else {
        entry.stats.iceState = st || 'checking';
      }
      updateStatusChipUI();
      if (isInspectorOpen) renderInspectorContents();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        entry.stats.iceState = 'connected';
      }
      updateStatusChipUI();
      if (isInspectorOpen) renderInspectorContents();
    };

    pc.onnegotiationneeded = async () => {
      const selfId = safeGetSelfId();
      if (!selfId) return;
      const shouldInitiate = String(selfId) < String(peerId);
      if (shouldInitiate) {
        await initiateOfferForEntry(entry);
      }
    };

    const selfId = safeGetSelfId();
    const shouldInitiateNow = selfId ? String(selfId) < String(peerId) : safeGetRole() === 'laptop';
    if (shouldInitiateNow) {
      createDualDataChannels(entry);
      initiateOfferForEntry(entry);
    } else {
      // Fallback initiator timer if remote side hasn't offered within 900ms
      setTimeout(() => {
        if (
          peerEntries.has(peerId) &&
          !isEntryConnected(entry) &&
          entry.pc.signalingState === 'stable' &&
          !entry.pc.remoteDescription
        ) {
          initiateOfferForEntry(entry);
        }
      }, 900);
    }

    return entry;
  }

  /**
   * Initializes an in-browser WebRTC RTCPeerConnection + Dual RTCDataChannel loopback
   * between two connections on this device. It is a self-test only: it proves WebRTC works in
   * this browser and is never reported as a connection to another device.
   */
  async function initLocalLoopbackEngine() {
    if (loopbackSession || typeof RTCPeerConnection === 'undefined') return;
    try {
      const pcA = new RTCPeerConnection();
      const pcB = new RTCPeerConnection();

      const entry = {
        peerId: safeGetSelfId() || 'peer_local_mesh',
        isLoopback: true,
        meta: {
          id: safeGetSelfId() || 'peer_local_mesh',
          name: 'Local Mesh Loopback',
          role: safeGetRole(),
          edge: 'local',
        },
        pc: pcA,
        pcMirror: pcB,
        channelsCreated: true,
        channels: {
          [FAST_CHANNEL]: null,
          [RELIABLE_CHANNEL]: null,
        },
        stats: {
          iceState: 'checking',
          transport: 'Loopback (this device)',
          protocol: null,
          rttMs: null,
          packetsSent: 0,
          packetsReceived: 0,
          bytesSent: 0,
          bytesReceived: 0,
          connectedAt: null,
        },
      };
      loopbackSession = entry;

      pcA.onicecandidate = (e) => {
        if (e.candidate) pcB.addIceCandidate(e.candidate).catch(() => {});
      };
      pcB.onicecandidate = (e) => {
        if (e.candidate) pcA.addIceCandidate(e.candidate).catch(() => {});
      };

      pcB.ondatachannel = (ev) => {
        const ch = ev.channel;
        ch.onmessage = (msgEv) => {
          if (typeof msgEv.data !== 'string') return;
          try {
            const parsed = JSON.parse(msgEv.data);
            if (parsed && parsed.__p2p_internal === 'ping' && ch.readyState === 'open') {
              ch.send(
                JSON.stringify({
                  __p2p_internal: 'pong',
                  t0: parsed.t0,
                  seq: parsed.seq,
                }),
              );
            }
          } catch {}
        };
      };

      const fastDc = pcA.createDataChannel(FAST_CHANNEL, {
        ordered: false,
        maxRetransmits: 0,
      });
      const reliableDc = pcA.createDataChannel(RELIABLE_CHANNEL, {
        ordered: true,
      });
      attachDataChannel(entry, fastDc);
      attachDataChannel(entry, reliableDc);

      const offer = await pcA.createOffer();
      await pcA.setLocalDescription(offer);
      await pcB.setRemoteDescription(offer);
      const answer = await pcB.createAnswer();
      await pcB.setLocalDescription(answer);
      await pcA.setRemoteDescription(answer);
    } catch {}
  }

  async function flushPendingCandidates(entry) {
    if (!entry || !entry.pc || !entry.pc.remoteDescription) return;
    while (entry.pendingCandidates.length > 0) {
      const cand = entry.pendingCandidates.shift();
      try {
        await entry.pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch {}
    }
  }

  /**
   * Handles incoming WebRTC signaling payloads from WebSocket.
   */
  async function handleWebRTCSignal(msg) {
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'peers' && Array.isArray(msg.peers)) {
      syncPeers(msg.peers);
      return;
    }

    if (msg.type !== 'webrtc_signal' && !msg.signalData) return;

    const selfId = safeGetSelfId();
    if (msg.targetId && selfId && msg.targetId !== selfId) {
      return;
    }

    const fromId = msg.fromId || msg.from || msg.peerId;
    if (!fromId || (selfId && fromId === selfId)) return;

    const signalData = msg.signalData || msg.signal || msg;
    const sigId = msg.signalId || signalData?.signalId;
    if (sigId) {
      if (processedSignalIds.has(sigId)) return;
      processedSignalIds.add(sigId);
      if (processedSignalIds.size > 400) {
        const oldest = processedSignalIds.values().next().value;
        processedSignalIds.delete(oldest);
      }
    }

    const peerMeta = safeGetPeers().find((p) => p.id === fromId) || {
      id: fromId,
      name: msg.fromName || fromId,
      role: msg.fromRole || 'phone',
    };

    const entry = ensurePeerEntry(fromId, peerMeta);
    if (!entry || !entry.pc) return;
    const pc = entry.pc;

    const polite = selfId ? String(selfId) > String(fromId) : safeGetRole() === 'phone';
    const desc =
      signalData.description ||
      (signalData.type === 'offer' || signalData.type === 'answer'
        ? { type: signalData.type, sdp: signalData.sdp }
        : null);
    const candidate = signalData.candidate || (signalData.type === 'candidate' ? signalData.candidate : null);

    try {
      if (desc && desc.type && desc.sdp) {
        const readyForOffer =
          !entry.makingOffer && (pc.signalingState === 'stable' || entry.isSettingRemoteAnswerPending);
        const offerCollision = desc.type === 'offer' && !readyForOffer;

        entry.ignoreOffer = !polite && offerCollision;
        if (entry.ignoreOffer) return;

        entry.isSettingRemoteAnswerPending = desc.type === 'answer';
        await pc.setRemoteDescription(desc);
        entry.isSettingRemoteAnswerPending = false;

        await flushPendingCandidates(entry);

        if (desc.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignaling(fromId, {
            type: pc.localDescription.type,
            sdp: pc.localDescription.sdp,
            description: {
              type: pc.localDescription.type,
              sdp: pc.localDescription.sdp,
            },
          });
        }
      } else if (candidate) {
        if (!entry.ignoreOffer) {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            entry.pendingCandidates.push(candidate);
          }
        }
      }
    } catch {}
  }

  function syncPeers(peerList) {
    const selfId = safeGetSelfId();
    const list = Array.isArray(peerList) ? peerList : safeGetPeers();
    const remotePeers = list.filter((p) => p && p.id && p.id !== selfId && p.id !== '__preview__');
    const activeIds = new Set(remotePeers.map((p) => p.id));

    for (const [id, entry] of peerEntries.entries()) {
      if (!activeIds.has(id)) {
        try {
          entry.pc?.close();
        } catch {}
        peerEntries.delete(id);
      }
    }

    for (const peer of remotePeers) {
      ensurePeerEntry(peer.id, peer);
    }

    if (loopbackSession && selfId) {
      loopbackSession.peerId = selfId;
      loopbackSession.meta.id = selfId;
    }

    updateStatusChipUI();
    if (isInspectorOpen) renderInspectorContents();
  }

  function bindWsPassiveListener() {
    const ws = safeGetWs();
    if (!ws || ws === observedWs) return;
    observedWs = ws;
    ws.addEventListener('message', (ev) => {
      if (typeof ev.data !== 'string') return;
      let parsed;
      try {
        parsed = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (!parsed) return;
      if (parsed.type === 'webrtc_signal' || parsed.type === 'peers' || parsed.type === 'welcome') {
        queueMicrotask(() => {
          if (parsed.type === 'webrtc_signal') {
            handleWebRTCSignal(parsed);
          } else {
            syncPeers(parsed.peers);
          }
        });
      }
    });
  }

  /**
   * Sends a message over open RTCDataChannels (`fast-telemetry` or `reliable-continuity`),
   * falling back transparently to WebSocket (`getWs()`) if any target peer's DataChannel is still handshaking.
   */
  function sendP2P(msgObj, channelName = FAST_CHANNEL) {
    if (!msgObj || typeof msgObj !== 'object') return false;

    const resolvedChannel =
      channelName === RELIABLE_CHANNEL ||
      (channelName === FAST_CHANNEL &&
        (msgObj.type === 'clipboard_sync' || msgObj.type === 'card_flick' || msgObj.type === 'display_mode_sync'))
        ? channelName === RELIABLE_CHANNEL
          ? RELIABLE_CHANNEL
          : channelName
        : FAST_CHANNEL;

    const selfId = safeGetSelfId();
    const selfRole = safeGetRole();
    const peers = safeGetPeers();
    const selfMeta = peers.find((p) => p.id === selfId);

    const enrichedBase = {
      ...msgObj,
      fromId: msgObj.fromId || selfId || 'local',
      fromRole: msgObj.fromRole || selfRole,
      fromName: msgObj.fromName || selfMeta?.name || (selfRole === 'phone' ? 'Phone' : 'MacBook'),
      fromColor: msgObj.fromColor || selfMeta?.color || '#5e6ad2',
    };

    const remoteEntries = [...peerEntries.values()].filter((e) => !e.isLoopback);
    const anyRemoteReady = remoteEntries.some((e) => isEntryConnected(e));

    let sentOverAnyDataChannel = false;

    if (anyRemoteReady) {
      // Strip-aware spatial routing for drag_stream and card_flick
      if (msgObj.type === 'drag_stream' || msgObj.type === 'card_flick') {
        if (selfRole === 'phone' && selfMeta) {
          const localRatio = msgObj.contactRatio ?? 0.5;
          const spanRatio = selfMeta.spanRatio ?? 0.28;
          const centerRatio = selfMeta.centerRatio ?? 0.5;
          const stripStart = centerRatio - spanRatio / 2;
          const hostRatio = Math.max(0.04, Math.min(0.96, stripStart + localRatio * spanRatio));
          const payload = JSON.stringify({
            ...enrichedBase,
            edge: selfMeta.edge || 'right',
            contactRatio: hostRatio,
          });

          for (const entry of remoteEntries) {
            if (!isEntryConnected(entry)) continue;
            if (entry.meta?.role === 'laptop' || remoteEntries.length === 1) {
              const dc =
                (isChannelOpen(entry.channels[resolvedChannel]) && entry.channels[resolvedChannel]) ||
                entry.channels[FAST_CHANNEL] ||
                entry.channels[RELIABLE_CHANNEL];
              if (isChannelOpen(dc)) {
                try {
                  dc.send(payload);
                  entry.stats.packetsSent += 1;
                  entry.stats.bytesSent += payload.length;
                  sentOverAnyDataChannel = true;
                } catch {}
              }
            }
          }
        } else {
          const targetEdge = msgObj.edge || 'right';
          const cardCenter = msgObj.contactRatio ?? 0.5;
          const cardHalfSpan = (msgObj.cardSpanRatio || 0.14) / 2;
          const cMin = cardCenter - cardHalfSpan;
          const cMax = cardCenter + cardHalfSpan;

          for (const entry of remoteEntries) {
            if (!isEntryConnected(entry)) continue;
            const p = peers.find((item) => item.id === entry.peerId) || entry.meta || {};
            const pEdge = p.edge || 'right';
            const pCenter = p.centerRatio ?? 0.5;
            const pSpan = p.spanRatio ?? 0.28;
            const sMin = pCenter - pSpan / 2;
            const sMax = pCenter + pSpan / 2;
            const overlaps = pEdge === targetEdge && cMax >= sMin - 0.03 && cMin <= sMax + 0.03;

            const dc =
              (isChannelOpen(entry.channels[resolvedChannel]) && entry.channels[resolvedChannel]) ||
              entry.channels[FAST_CHANNEL] ||
              entry.channels[RELIABLE_CHANNEL];

            if (!isChannelOpen(dc)) continue;

            if (overlaps) {
              const localRatio = Math.max(0.06, Math.min(0.94, (cardCenter - sMin) / Math.max(0.05, pSpan)));
              const raw = JSON.stringify({
                ...enrichedBase,
                edge: 'top',
                contactRatio: localRatio,
              });
              try {
                dc.send(raw);
                entry.stats.packetsSent += 1;
                entry.stats.bytesSent += raw.length;
                sentOverAnyDataChannel = true;
              } catch {}
            } else if (msgObj.type === 'drag_stream') {
              const rawEnd = JSON.stringify({ type: 'drag_end', cardId: msgObj.cardId });
              try {
                dc.send(rawEnd);
                entry.stats.packetsSent += 1;
                entry.stats.bytesSent += rawEnd.length;
                sentOverAnyDataChannel = true;
              } catch {}
            }
          }
        }

        if (sentOverAnyDataChannel) {
          if (isInspectorOpen) renderInspectorContents();
          return true;
        }
      } else {
        const raw = JSON.stringify(enrichedBase);
        for (const entry of remoteEntries) {
          if (!isEntryConnected(entry)) continue;
          if (msgObj.targetId && entry.peerId !== msgObj.targetId) continue;
          const dc =
            (isChannelOpen(entry.channels[resolvedChannel]) && entry.channels[resolvedChannel]) ||
            entry.channels[FAST_CHANNEL] ||
            entry.channels[RELIABLE_CHANNEL];
          if (isChannelOpen(dc)) {
            try {
              dc.send(raw);
              entry.stats.packetsSent += 1;
              entry.stats.bytesSent += raw.length;
              sentOverAnyDataChannel = true;
            } catch {}
          }
        }
        if (sentOverAnyDataChannel) {
          if (isInspectorOpen) renderInspectorContents();
          return true;
        }
      }
    }

    // Record telemetry on loopback session if no remote peers are paired yet
    if (remoteEntries.length === 0 && loopbackSession && isEntryConnected(loopbackSession)) {
      sendPingToEntry(loopbackSession);
    }

    // Transparent fallback to WebSocket if any peer's DataChannel is still handshaking
    const ws = safeGetWs();
    if (ws && ws.readyState === 1) {
      try {
        ws.send(JSON.stringify(msgObj));
      } catch {}
    }
    return sentOverAnyDataChannel;
  }

  async function refreshWebRTCStats() {
    const entries = [...peerEntries.values()];
    if (entries.length === 0 && loopbackSession) {
      entries.push(loopbackSession);
    }

    for (const entry of entries) {
      if (!entry.pc || typeof entry.pc.getStats !== 'function') continue;
      try {
        const report = await entry.pc.getStats();
        report.forEach((stat) => {
          if (stat.type === 'candidate-pair' && (stat.state === 'succeeded' || stat.nominated)) {
            const localCand = stat.localCandidateId && report.get(stat.localCandidateId);
            if (localCand && localCand.protocol) entry.stats.protocol = String(localCand.protocol).toUpperCase();
            if (typeof stat.currentRoundTripTime === 'number' && stat.currentRoundTripTime > 0) {
              const rttMs = stat.currentRoundTripTime * 1000;
              entry.stats.rttMs =
                entry.stats.rttMs == null ? rttMs : entry.stats.rttMs * 0.7 + rttMs * 0.3;
            }
          }
        });
      } catch {}
    }
  }

  function getActiveTelemetryEntries() {
    const remotes = [...peerEntries.values()].filter((e) => !e.isLoopback);
    if (remotes.length > 0) return remotes;
    return loopbackSession ? [loopbackSession] : [];
  }

  function getP2PStats() {
    const isP2PConnected = isConnected();
    const entries = getActiveTelemetryEntries();
    let totalPacketsSent = 0;
    let totalPacketsReceived = 0;
    let totalBytesSent = 0;
    let totalBytesReceived = 0;
    const rttSamples = [];

    const peerRows = entries.map((entry) => {
      const fastOpen = isChannelOpen(entry.channels[FAST_CHANNEL]);
      const reliableOpen = isChannelOpen(entry.channels[RELIABLE_CHANNEL]);
      const connected = fastOpen || reliableOpen || entry.pc?.iceConnectionState === 'connected';
      const iceState = connected ? 'connected' : entry.stats.iceState || entry.pc?.iceConnectionState || 'standby';
      const rttMs = entry.stats.rttMs ?? null;

      totalPacketsSent += entry.stats.packetsSent;
      totalPacketsReceived += entry.stats.packetsReceived;
      totalBytesSent += entry.stats.bytesSent;
      totalBytesReceived += entry.stats.bytesReceived;
      if (connected && !entry.isLoopback && Number.isFinite(rttMs)) {
        rttSamples.push(rttMs);
      }

      return {
        peerId: entry.peerId,
        name: entry.meta?.name || entry.peerId,
        role: entry.meta?.role || 'peer',
        edge: entry.meta?.edge || 'right',
        isLoopback: Boolean(entry.isLoopback),
        iceState,
        transport: entry.isLoopback ? 'Loopback (this device)' : connected ? 'RTCDataChannel' : 'WebSocket signaling',
        protocol: entry.stats.protocol || null,
        fastChannelState: entry.channels[FAST_CHANNEL]?.readyState || 'standby',
        reliableChannelState: entry.channels[RELIABLE_CHANNEL]?.readyState || 'standby',
        rttMs,
        packetsSent: entry.stats.packetsSent,
        packetsReceived: entry.stats.packetsReceived,
        bytesSent: entry.stats.bytesSent,
        bytesReceived: entry.stats.bytesReceived,
      };
    });

    const avgRttMs =
      rttSamples.length > 0
        ? rttSamples.reduce((acc, v) => acc + v, 0) / rttSamples.length
        : null;

    return {
      selfId: safeGetSelfId() || 'peer_local',
      role: safeGetRole(),
      isP2PConnected,
      activePeerCount: peerRows.filter((p) => p.iceState === 'connected' && !p.isLoopback).length,
      totalPeerCount: peerRows.filter((p) => !p.isLoopback).length,
      transport: isP2PConnected ? 'RTCDataChannel' : 'WebSocket relay',
      protocol: peerRows.find((p) => !p.isLoopback && p.iceState === 'connected' && p.protocol)?.protocol || null,
      iceState: isP2PConnected ? 'connected' : (peerRows.length > 0 ? 'connecting' : 'standby'),
      avgRttMs,
      totalPacketsSent,
      totalPacketsReceived,
      totalBytesSent,
      totalBytesReceived,
      peers: peerRows,
    };
  }

  // ============================================================================
  // Top-Bar .status-rail P2P Chip & Linear Network Inspector Modal
  // ============================================================================
  function ensureStatusRailChip() {
    if (typeof document === 'undefined') return null;
    let chip = document.getElementById(P2P_CHIP_ID);
    if (chip) return chip;

    const statusRail = document.querySelector('.status-rail');
    if (!statusRail) return null;

    const sep = document.createElement('span');
    sep.className = 'sep-v';
    sep.setAttribute('data-p2p-sep', '1');

    chip = document.createElement('button');
    chip.type = 'button';
    chip.id = P2P_CHIP_ID;
    chip.title = 'Open WebRTC P2P Network Inspector';
    chip.innerHTML = `
      <span class="p2p-chip-dot"></span>
      ${SVG_ICONS.mesh}
      <span class="p2p-chip-label">P2P · Standby</span>
      <span class="p2p-chip-rtt p2p-tabular">-- ms</span>
    `;
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      openP2PInspector();
    });

    statusRail.appendChild(sep);
    statusRail.appendChild(chip);
    return chip;
  }

  function updateStatusChipUI() {
    const chip = ensureStatusRailChip();
    if (!chip) return;

    const stats = getP2PStats();
    const labelEl = chip.querySelector('.p2p-chip-label');
    const rttEl = chip.querySelector('.p2p-chip-rtt');

    if (stats.isP2PConnected) {
      chip.classList.add('is-connected');
      if (labelEl) labelEl.textContent = `P2P · ${stats.protocol || 'Direct'}`;
      if (rttEl) rttEl.textContent = formatRtt(stats.avgRttMs);
    } else {
      chip.classList.remove('is-connected');
      if (labelEl) labelEl.textContent = 'P2P · Standby';
      if (rttEl) rttEl.textContent = '-- ms';
    }
  }

  function ensureInspectorModalDOM() {
    if (typeof document === 'undefined') return null;
    let backdrop = document.getElementById(P2P_MODAL_BACKDROP_ID);
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.id = P2P_MODAL_BACKDROP_ID;
    backdrop.className = 'interactive';
    backdrop.innerHTML = `
      <div id="${P2P_MODAL_ID}" role="dialog" aria-modal="true" aria-labelledby="p2p-inspector-title">
        <div class="p2p-modal-head">
          <div class="p2p-modal-title-wrap">
            <span class="p2p-modal-icon-box">${SVG_ICONS.mesh}</span>
            <span id="p2p-inspector-title" class="p2p-modal-title">Connection details</span>
            <span id="p2p-modal-live-badge" class="p2p-modal-badge">P2P · Standby</span>
          </div>
          <div class="p2p-modal-actions">
            <button type="button" class="p2p-btn" data-p2p-action="loopback" title="Run manual local WebRTC loopback benchmark">
              ${SVG_ICONS.bolt}
              <span>Test speed</span>
            </button>
            <button type="button" class="p2p-btn" data-p2p-action="ping" title="Send immediate sub-millisecond RTT probe">
              ${SVG_ICONS.pulse}
              <span>Probe RTT</span>
            </button>
            <button type="button" class="p2p-btn" data-p2p-action="resync" title="Reconcile mesh RTCPeerConnections">
              ${SVG_ICONS.refresh}
              <span>Sync Mesh</span>
            </button>
            <button type="button" class="p2p-btn p2p-btn-icon" data-p2p-action="close" title="Close Inspector (ESC)">
              ${SVG_ICONS.close}
            </button>
          </div>
        </div>

        <div class="p2p-modal-body">
          <div class="p2p-kpi-grid">
            <div class="p2p-kpi-card">
              <div class="p2p-kpi-label">
                <span>Transport</span>
                ${SVG_ICONS.shield}
              </div>
              <div id="p2p-kpi-transport" class="p2p-kpi-value">Through the laptop</div>
              <div class="p2p-kpi-sub">Direct</div>
            </div>

            <div class="p2p-kpi-card">
              <div class="p2p-kpi-label">
                <span>ICE State</span>
                ${SVG_ICONS.mesh}
              </div>
              <div id="p2p-kpi-ice" class="p2p-kpi-value emerald">connected</div>
              <div id="p2p-kpi-peers-sub" class="p2p-kpi-sub">1 Active Peer</div>
            </div>

            <div class="p2p-kpi-card">
              <div class="p2p-kpi-label">
                <span>Round trip</span>
                ${SVG_ICONS.pulse}
              </div>
              <div id="p2p-kpi-rtt" class="p2p-kpi-value p2p-tabular">-- ms</div>
              <div class="p2p-kpi-sub">120Hz Telemetry Probe</div>
            </div>

            <div class="p2p-kpi-card">
              <div class="p2p-kpi-label">
                <span>Messages sent / received</span>
                ${SVG_ICONS.packets}
              </div>
              <div id="p2p-kpi-packets" class="p2p-kpi-value p2p-tabular">0 / 0</div>
              <div id="p2p-kpi-bytes" class="p2p-kpi-sub p2p-tabular">0 B TX · 0 B RX</div>
            </div>
          </div>

          <div class="p2p-channels-row">
            <div class="p2p-channel-box">
              <div class="p2p-channel-left">
                <div class="p2p-channel-name">
                  ${SVG_ICONS.bolt}
                  <span>fast-telemetry</span>
                </div>
                <div class="p2p-channel-desc">120Hz Bezel-Crossing Drag &amp; Remote Trackpad</div>
              </div>
              <span class="p2p-channel-cfg">ordered: false · maxRetransmits: 0</span>
            </div>

            <div class="p2p-channel-box">
              <div class="p2p-channel-left">
                <div class="p2p-channel-name">
                  ${SVG_ICONS.shield}
                  <span>reliable-continuity</span>
                </div>
                <div class="p2p-channel-desc">Direct P2P Data &amp; Universal Clipboard Payloads</div>
              </div>
              <span class="p2p-channel-cfg">ordered: true · SCTP</span>
            </div>
          </div>

          <div class="p2p-table-wrap">
            <div class="p2p-table-header">
              <span>Connected devices</span>
              <span id="p2p-self-id-label" class="p2p-foot-mono">Self ID: --</span>
            </div>
            <table class="p2p-peer-table">
              <thead>
                <tr>
                  <th>Peer ID</th>
                  <th>ICE State</th>
                  <th>Transport</th>
                  <th>Round trip</th>
                  <th>Messages sent / received</th>
                </tr>
              </thead>
              <tbody id="p2p-peer-tbody"></tbody>
            </table>
          </div>
        </div>

        <div class="p2p-modal-foot">
          <span>Automatic WebRTC Mesh · Transparent WebSocket Signaling Fallback</span>
          <span id="p2p-foot-channels" class="p2p-foot-mono">Channels: fast-telemetry + reliable-continuity</span>
        </div>
      </div>
    `;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeP2PInspector();
    });

    backdrop.querySelector('[data-p2p-action="close"]')?.addEventListener('click', () => {
      closeP2PInspector();
    });

    backdrop.querySelector('[data-p2p-action="loopback"]')?.addEventListener('click', async () => {
      await initLocalLoopbackEngine();
      if (loopbackSession) {
        sendPingToEntry(loopbackSession);
      }
      renderInspectorContents();
      callbacks.showToast?.('Testing connection speed');
    });

    backdrop.querySelector('[data-p2p-action="ping"]')?.addEventListener('click', () => {
      for (const entry of getActiveTelemetryEntries()) {
        sendPingToEntry(entry);
      }
      renderInspectorContents();
    });

    backdrop.querySelector('[data-p2p-action="resync"]')?.addEventListener('click', () => {
      syncPeers(safeGetPeers());
      for (const entry of getActiveTelemetryEntries()) {
        sendPingToEntry(entry);
      }
      renderInspectorContents();
    });
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function renderInspectorContents() {
    const backdrop = ensureInspectorModalDOM();
    if (!backdrop) return;

    const stats = getP2PStats();

    const badgeEl = document.getElementById('p2p-modal-live-badge');
    if (badgeEl) {
      badgeEl.textContent = stats.isP2PConnected ? `P2P · ${stats.protocol || 'Direct'}` : 'P2P · Standby';
      badgeEl.classList.toggle('is-live', stats.isP2PConnected);
    }

    const transportEl = document.getElementById('p2p-kpi-transport');
    if (transportEl) {
      transportEl.textContent = stats.transport;
      transportEl.classList.toggle('emerald', stats.isP2PConnected);
    }

    const iceEl = document.getElementById('p2p-kpi-ice');
    if (iceEl) {
      iceEl.textContent = stats.iceState;
      iceEl.classList.toggle('emerald', stats.iceState === 'connected');
    }

    const peersSubEl = document.getElementById('p2p-kpi-peers-sub');
    if (peersSubEl) {
      peersSubEl.textContent = stats.isP2PConnected
        ? `${stats.activePeerCount} Connected · Dual Channels`
        : '0 Peers · WebRTC Standby';
    }

    const rttEl = document.getElementById('p2p-kpi-rtt');
    if (rttEl) {
      rttEl.textContent = stats.isP2PConnected ? formatRtt(stats.avgRttMs) : '-- ms';
    }

    const pktEl = document.getElementById('p2p-kpi-packets');
    if (pktEl) {
      pktEl.textContent = `${stats.totalPacketsSent} / ${stats.totalPacketsReceived}`;
    }

    const bytesEl = document.getElementById('p2p-kpi-bytes');
    if (bytesEl) {
      bytesEl.textContent = `${formatBytesCompact(stats.totalBytesSent)} TX · ${formatBytesCompact(stats.totalBytesReceived)} RX`;
    }

    const selfLabelEl = document.getElementById('p2p-self-id-label');
    if (selfLabelEl) {
      selfLabelEl.textContent = `Self ID: ${stats.selfId}`;
    }

    const tbody = document.getElementById('p2p-peer-tbody');
    if (tbody) {
      if (stats.peers.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding: 24px; color: #575b66; font-size: 11px;">
              No remote WebRTC peers connected. Click "Loopback Benchmark" above to test local DataChannel performance.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = stats.peers
          .map((p) => {
            const isConn = p.iceState === 'connected';
            return `
              <tr>
                <td>
                  <span>${escapeHtml(p.peerId)}</span>
                  <span class="p2p-peer-sub">${escapeHtml(p.name)}</span>
                </td>
                <td>
                  <span class="p2p-state-pill ${isConn ? 'connected' : ''}">
                    <span class="p2p-state-dot"></span>
                    <span>${escapeHtml(p.iceState)}</span>
                  </span>
                </td>
                <td>${escapeHtml(p.transport)}</td>
                <td class="p2p-tabular">${escapeHtml(isConn ? formatRtt(p.rttMs) : '-- ms')}</td>
                <td class="p2p-tabular">${p.packetsSent} / ${p.packetsReceived}</td>
              </tr>
            `;
          })
          .join('');
      }
    }
  }

  function openP2PInspector() {
    ensureInspectorModalDOM();
    isInspectorOpen = true;
    for (const entry of getActiveTelemetryEntries()) {
      sendPingToEntry(entry);
    }
    renderInspectorContents();
    const backdrop = document.getElementById(P2P_MODAL_BACKDROP_ID);
    if (backdrop) {
      backdrop.classList.add('is-open');
    }
  }

  function closeP2PInspector() {
    isInspectorOpen = false;
    const backdrop = document.getElementById(P2P_MODAL_BACKDROP_ID);
    if (backdrop) {
      backdrop.classList.remove('is-open');
    }
  }

  function toggleP2PInspector() {
    if (isInspectorOpen) closeP2PInspector();
    else openP2PInspector();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isInspectorOpen) {
        closeP2PInspector();
      }
    });
  }

  // Initialize status rail chip in Standby mode (loopback only runs on manual benchmark request)
  ensureStatusRailChip();
  updateStatusChipUI();

  const meshInterval = setInterval(() => {
    bindWsPassiveListener();
    syncPeers(safeGetPeers());
    for (const entry of getActiveTelemetryEntries()) {
      sendPingToEntry(entry);
    }
    refreshWebRTCStats();
    updateStatusChipUI();
    if (isInspectorOpen) {
      renderInspectorContents();
    }
  }, 900);

  const p2pMessageListeners = new Set();

  function addMessageListener(fn) {
    if (typeof fn === 'function') {
      p2pMessageListeners.add(fn);
      return () => p2pMessageListeners.delete(fn);
    }
    return () => {};
  }

  function removeMessageListener(fn) {
    p2pMessageListeners.delete(fn);
  }

  function dispatchP2PMessage(msg, meta = {}) {
    if (!msg || typeof msg !== 'object') return;

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('oneglass-p2p-message', { detail: msg }));
      } catch {}
    }

    try {
      callbacks.onP2PMessage?.(msg, meta);
    } catch {}

    for (const fn of p2pMessageListeners) {
      try {
        fn(msg, meta);
      } catch {}
    }
  }

  const api = {
    handleWebRTCSignal,
    sendP2P,
    isConnected,
    getP2PStats,
    openInspector: openP2PInspector,
    openP2PInspector,
    closeInspector: closeP2PInspector,
    closeP2PInspector,
    toggleInspector: toggleP2PInspector,
    toggleP2PInspector,
    syncPeers,
    initLocalLoopbackEngine,
    addMessageListener,
    removeMessageListener,
    onMessage: addMessageListener,
    destroy() {
      clearInterval(meshInterval);
      for (const entry of peerEntries.values()) {
        try {
          entry.pc?.close();
        } catch {}
      }
      peerEntries.clear();
      if (loopbackSession) {
        try {
          loopbackSession.pc?.close();
          loopbackSession.pcMirror?.close();
        } catch {}
        loopbackSession = null;
      }
    },
  };

  activeInstance = {
    api,
    updateCallbacks(next) {
      callbacks = { ...callbacks, ...next };
      bindWsPassiveListener();
      syncPeers(safeGetPeers());
    },
  };

  if (typeof window !== 'undefined') {
    window.oneGlassP2P = api;
    window.sendOneGlassP2P = (msgObj, channelName) => {
      if (isConnected()) {
        return sendP2P(msgObj, channelName) === true;
      }
      return false;
    };
    window.openP2PInspector = openP2PInspector;
  }

  return api;
}
export default {
  initWebRTCP2P,
};
