import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const QRCode = require('qrcode');
const { WebSocketServer } = require('ws');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const SHARED_DIR = path.join(__dirname, 'shared');
const SPU_BIN = path.join(__dirname, 'native', 'spu_bump');
const PORT = +(process.env.PORT || 8484);

fs.mkdirSync(SHARED_DIR, { recursive: true });
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads', 'OneGlass');
fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
const DOWNLOADS_DROP_DIR = DOWNLOADS_DIR;

function discoverNetworkEndpoints(port, token) {
  const nets = os.networkInterfaces();
  const lanCandidates = [];
  let tailscaleIp = null;
  let wireguardIp = null;

  for (const [name, list] of Object.entries(nets)) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) {
        const addr = net.address;
        const lowerName = name.toLowerCase();
        const isTailscale = addr.startsWith('100.') || lowerName.includes('tailscale') || lowerName.startsWith('ts');
        const isWireguard = lowerName.startsWith('wg') || lowerName.includes('wireguard');
        if (isTailscale && !tailscaleIp) {
          tailscaleIp = addr;
        } else if (isWireguard && !wireguardIp) {
          wireguardIp = addr;
        } else {
          const priority = name === 'en0' || name.startsWith('wlan') || name.startsWith('wl') ? 0 : 1;
          lanCandidates.push({ name, address: addr, priority });
        }
      }
    }
  }

  lanCandidates.sort((a, b) => a.priority - b.priority);
  const lanIp = lanCandidates[0]?.address || '127.0.0.1';

  // Zero-config mDNS Bonjour hostname (.local)
  const rawHostname = os.hostname() || 'localhost';
  const cleanHost = rawHostname.replace(/\.local$/i, '');
  const mdnsHost = cleanHost ? `${cleanHost}.local` : 'localhost';

  // Optional public tunnel URL (--tunnel flag or ONEGLASS_TUNNEL_URL / TUNNEL_URL)
  let tunnelUrl = process.env.ONEGLASS_TUNNEL_URL || process.env.TUNNEL_URL || null;
  const tunnelIdx = process.argv.indexOf('--tunnel');
  if (tunnelIdx !== -1 && process.argv[tunnelIdx + 1] && !process.argv[tunnelIdx + 1].startsWith('-')) {
    tunnelUrl = process.argv[tunnelIdx + 1];
  } else {
    const tunnelEq = process.argv.find((a) => a.startsWith('--tunnel='));
    if (tunnelEq) tunnelUrl = tunnelEq.split('=')[1];
  }

  const tokenParam = token ? `&token=${token}` : '';
  const makeUrl = (host, p = port) => `http://${host}${p ? `:${p}` : ''}/?role=phone${tokenParam}`;

  const endpoints = [
    {
      id: 'lan',
      label: 'Wi-Fi LAN',
      ip: lanIp,
      url: makeUrl(lanIp),
      recommended: true,
      description: 'Fast direct local Wi-Fi connection',
    },
    {
      id: 'mdns',
      label: 'mDNS (.local)',
      host: mdnsHost,
      url: makeUrl(mdnsHost),
      recommended: false,
      description: 'Zero-config Bonjour hostname (auto-resolves on Apple & Android)',
    },
  ];

  if (tailscaleIp) {
    endpoints.push({
      id: 'tailscale',
      label: 'Tailscale Mesh (Bypass AP Isolation)',
      ip: tailscaleIp,
      url: makeUrl(tailscaleIp),
      recommended: false,
      description: 'Encrypted mesh IP — completely bypasses hotel/corporate AP isolation',
    });
  }

  if (wireguardIp && wireguardIp !== tailscaleIp) {
    endpoints.push({
      id: 'wireguard',
      label: 'WireGuard Mesh',
      ip: wireguardIp,
      url: makeUrl(wireguardIp),
      recommended: false,
      description: 'Encrypted VPN / WireGuard mesh IP',
    });
  }

  if (tunnelUrl) {
    const cleanTunnel = tunnelUrl.replace(/\/+$/, '');
    const fullTunnel = cleanTunnel.includes('?') ? `${cleanTunnel}&role=phone${tokenParam}` : `${cleanTunnel}/?role=phone${tokenParam}`;
    endpoints.push({
      id: 'tunnel',
      label: 'Public Tunnel',
      url: fullTunnel,
      recommended: false,
      description: 'Secure public tunnel relay',
    });
  }

  return {
    lanIp,
    mdnsHost,
    tailscaleIp,
    tunnelUrl,
    endpoints,
  };
}

// 16 bytes (128 bits) of entropy. The previous 4-byte (32-bit) token guarded
// file transfer and host clipboard injection and was brute-forceable on a LAN.
const sessionToken = crypto.randomBytes(16).toString('hex');
const networkInfo = discoverNetworkEndpoints(PORT, sessionToken);
const LAN_IP = networkInfo.lanIp;
const PAIR_URL = `http://${LAN_IP}:${PORT}/?role=phone&token=${sessionToken}`;
const PHONE_URL = PAIR_URL;

// The token lives inside PAIR_URL, PHONE_URL, the QR, and every networkInfo.endpoints[].url.
// Anything sent to a caller that has not proven it holds the token must use the stripped forms.
function stripToken(u) {
  if (typeof u !== 'string') return u;
  return u.replace(/([?&])token=[^&#]*(&)?/, (_m, sep, amp) => (amp ? sep : ''));
}

function publicEndpoints() {
  return (networkInfo.endpoints || []).map((e) => ({ ...e, url: stripToken(e.url) }));
}

function isLoopbackAddress(rawIp) {
  const ip = String(rawIp || '').replace(/^::ffff:/, '');
  return ip === '127.0.0.1' || ip === '::1';
}

const SESSION_COOKIE = 'og_session';

function cookieToken(req) {
  const header = (req.headers && req.headers.cookie) || '';
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function tokenMatches(candidate) {
  if (!candidate || typeof candidate !== 'string') return false;
  const given = Buffer.from(candidate);
  const expected = Buffer.from(sessionToken);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

function presentsValidToken(req, url) {
  const candidates = [
    url && url.searchParams.get('token'),
    req.headers && req.headers['x-oneglass-token'],
    cookieToken(req),
  ];
  return candidates.some(tokenMatches);
}

// Every name and address this machine can be reached at (the Host header must be one of them).
function ownHostnames() {
  const names = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const iface of list || []) {
      names.add(iface.address);
      if (iface.family === 'IPv6' || iface.family === 6) names.add(`[${iface.address}]`);
    }
  }
  for (const value of [LAN_IP, networkInfo.mdnsHost, networkInfo.tailscaleIp]) if (value) names.add(value);
  for (const raw of [networkInfo.tunnelUrl, ...(networkInfo.endpoints || []).map((e) => e.url)]) {
    try {
      if (raw) names.add(new URL(raw).hostname);
    } catch {}
  }
  return names;
}

// Requests must come from OneGlass's own pages. The Host must be one of this machine's names, so a
// look-alike domain pointed at this machine is refused, and any Origin header must match that Host,
// so other websites open in a browser on this computer cannot use the trust given to local callers.
// Requests without an Origin (curl, iOS Shortcuts, same-page navigation) only need a valid Host.
function isFromOwnPage(req) {
  const hostHeader = req.headers.host || '';
  let hostname = '';
  try {
    hostname = new URL(`http://${hostHeader}`).hostname;
  } catch {
    return false;
  }
  if (!ownHostnames().has(hostname)) return false;
  const origin = req.headers.origin;
  if (origin === undefined) return true;
  try {
    return new URL(origin).host === hostHeader;
  } catch {
    return false;
  }
}

// HTTP twin of the WebSocket `authenticated` check: local caller, open-LAN opt-in, or valid token
// (query param, X-OneGlass-Token header, or the HttpOnly cookie set when a tokenized page loads).
function requestMaySeeToken(req, url) {
  if (isLoopbackAddress(req.socket && req.socket.remoteAddress)) return true;
  if (process.env.ONEGLASS_OPEN_LAN === '1') return true;
  return presentsValidToken(req, url);
}

function rejectUnpaired(res) {
  res.writeHead(401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ error: 'Pairing token required. Scan the QR code on the host to pair.' }));
}

// Cross-Platform Host OS Clipboard Bridge (macOS / Linux / Windows)
let lastHostClipboard = '';

function writeHostClipboard(text) {
  if (typeof text !== 'string' || !text) return;
  const platform = process.platform;
  try {
    if (platform === 'darwin') {
      const p = spawn('pbcopy', [], { stdio: ['pipe', 'ignore', 'ignore'] });
      p.on('error', () => {});
      p.stdin.write(text);
      p.stdin.end();
    } else if (platform === 'win32') {
      const p = spawn('clip', [], { stdio: ['pipe', 'ignore', 'ignore'] });
      p.on('error', () => {
        try {
          const ps = spawn('powershell.exe', ['-NoProfile', '-Command', 'Set-Clipboard -Value ([Console]::In.ReadToEnd())'], { stdio: ['pipe', 'ignore', 'ignore'] });
          ps.on('error', () => {});
          ps.stdin.write(text);
          ps.stdin.end();
        } catch {}
      });
      p.stdin.write(text);
      p.stdin.end();
    } else {
      // Linux: Wayland wl-copy, fallback to xclip, then xsel
      const p = spawn('wl-copy', [], { stdio: ['pipe', 'ignore', 'ignore'] });
      p.on('error', () => {
        try {
          const xc = spawn('xclip', ['-selection', 'clipboard'], { stdio: ['pipe', 'ignore', 'ignore'] });
          xc.on('error', () => {
            try {
              const xs = spawn('xsel', ['--clipboard', '--input'], { stdio: ['pipe', 'ignore', 'ignore'] });
              xs.on('error', () => {});
              xs.stdin.write(text);
              xs.stdin.end();
            } catch {}
          });
          xc.stdin.write(text);
          xc.stdin.end();
        } catch {}
      });
      p.stdin.write(text);
      p.stdin.end();
    }
  } catch {}
}

function readHostClipboardAsync(cb) {
  const platform = process.platform;
  try {
    if (platform === 'darwin') {
      execFile('pbpaste', { timeout: 1000, maxBuffer: 1024 * 1024 }, (err, stdout) => {
        if (!err && typeof stdout === 'string') cb(stdout);
      });
    } else if (platform === 'win32') {
      execFile('powershell.exe', ['-NoProfile', '-Command', 'Get-Clipboard'], { timeout: 1500, maxBuffer: 1024 * 1024 }, (err, stdout) => {
        if (!err && typeof stdout === 'string') cb(stdout.replace(/\r\n$/, ''));
      });
    } else {
      // Linux
      execFile('wl-paste', ['--no-newline'], { timeout: 1000, maxBuffer: 1024 * 1024 }, (err, stdout) => {
        if (!err && typeof stdout === 'string') return cb(stdout);
        execFile('xclip', ['-selection', 'clipboard', '-o'], { timeout: 1000, maxBuffer: 1024 * 1024 }, (err2, stdout2) => {
          if (!err2 && typeof stdout2 === 'string') cb(stdout2);
        });
      });
    }
  } catch {}
}

// Watch host clipboard and broadcast changes to paired devices when peers are active and osProc is not running
setInterval(() => {
  if (peers.size === 0 || osProc) return;
  readHostClipboardAsync((text) => {
    if (text && text !== lastHostClipboard && text.trim().length > 0) {
      lastHostClipboard = text;
      broadcastAuthenticated({
        type: 'clipboard_sync',
        text,
        fromName: `${process.platform === 'darwin' ? 'macOS' : process.platform === 'win32' ? 'Windows' : 'Linux'} Clipboard`,
        ts: Date.now(),
      });
    }
  });
}, 1500);
let qrSvgCache = '';
QRCode.toString(
  PHONE_URL,
  {
    type: 'svg',
    margin: 1,
    color: { dark: '#f8fafc', light: '#00000000' },
  },
  (err, svg) => {
    if (!err) qrSvgCache = svg;
  },
);

const STRIP_COLORS = ['#38bdf8', '#fbbf24', '#c084fc', '#34d399', '#fb7185', '#60a5fa'];
let colorCursor = 0;

// Real connected peers (ws -> peer descriptor with physical Bezel Strip alignment)
const peers = new Map();
const sharedItems = [];
let spuActive = false;
let lastGlobalBumpTs = 0;

function sendTo(ws, obj) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(obj));
  }
}

function broadcast(msgObj, excludeWs = null) {
  const raw = JSON.stringify(msgObj);
  for (const [client] of peers.entries()) {
    if (client !== excludeWs && client.readyState === 1) {
      client.send(raw);
    }
  }
}

// Clipboard text (passwords, 2FA codes) must only reach peers that proved the token
// or are local; any LAN socket can join `peers` without it.
function broadcastAuthenticated(msgObj, excludeWs = null) {
  const raw = JSON.stringify(msgObj);
  for (const [client, info] of peers.entries()) {
    if (client !== excludeWs && client.readyState === 1 && info && info.authenticated) {
      client.send(raw);
    }
  }
}

function assignInitialStripPosition() {
  const phonePeers = [...peers.values()].filter((p) => p.role === 'phone');
  const count = phonePeers.length;
  // Space multiple connected phones cleanly along the right bezel by default (0.32, 0.68, etc.)
  const slots = [0.5, 0.30, 0.70, 0.20, 0.80];
  return slots[count % slots.length] || 0.5;
}

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/plain; charset=utf-8',
  '.zip': 'application/zip',
};

function broadcastPeerList() {
  const list = [];
  for (const info of peers.values()) {
    list.push({
      id: info.id,
      role: info.role,
      name: info.name,
      color: info.color,
      widthPx: info.widthPx,
      heightPx: info.heightPx,
      dpr: info.dpr,
      edge: info.edge,
      centerRatio: info.centerRatio,
      spanRatio: info.spanRatio,
      authenticated: Boolean(info.authenticated),
    });
  }
  broadcast({ type: 'peers', peers: list, spuActive, nativeBridgeActive: Boolean(osProc) });
}

function classifyFile(filename, mime) {
  const ext = path.extname(filename).toLowerCase();
  if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.heic', '.avif'].includes(ext)) return 'image';
  if (mime.startsWith('video/') || ['.mp4', '.mov', '.webm', '.m4v', '.mkv'].includes(ext)) return 'video';
  if (mime.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac'].includes(ext)) return 'audio';
  if (mime === 'application/pdf' || ext === '.pdf') return 'pdf';
  if (
    mime.startsWith('text/') ||
    ['.js', '.mjs', '.ts', '.tsx', '.jsx', '.py', '.rs', '.go', '.c', '.cpp', '.h', '.m', '.swift', '.kt', '.java', '.json', '.md', '.txt', '.csv', '.yml', '.yaml', '.toml', '.html', '.css', '.sh', '.sql'].includes(ext)
  ) {
    return 'code';
  }
  if (['.zip', '.tar', '.gz', '.tgz', '.7z', '.rar', '.dmg', '.pkg', '.apk', '.ipa', '.iso'].includes(ext)) return 'archive';
  return 'file';
}

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/heic': '.heic',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/html': '.html',
  'application/json': '.json',
  'video/mp4': '.mp4',
  'audio/mpeg': '.mp3',
};

function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from(`--${boundary}`);
  let start = 0;

  while (start < buffer.length) {
    const idx = buffer.indexOf(boundaryBuf, start);
    if (idx === -1) break;
    start = idx + boundaryBuf.length;

    if (buffer[start] === 45 && buffer[start + 1] === 45) {
      break;
    }
    if (buffer[start] === 13 && buffer[start + 1] === 10) start += 2;
    else if (buffer[start] === 10) start += 1;

    let headerEnd = buffer.indexOf('\r\n\r\n', start);
    let headerSepLen = 4;
    if (headerEnd === -1) {
      headerEnd = buffer.indexOf('\n\n', start);
      headerSepLen = 2;
    }
    if (headerEnd === -1) break;

    const headerStr = buffer.slice(start, headerEnd).toString('utf8');
    const bodyStart = headerEnd + headerSepLen;

    const nextBoundary = buffer.indexOf(boundaryBuf, bodyStart);
    if (nextBoundary === -1) break;

    let bodyEnd = nextBoundary;
    if (bodyEnd >= bodyStart + 2 && buffer[bodyEnd - 2] === 13 && buffer[bodyEnd - 1] === 10) {
      bodyEnd -= 2;
    } else if (bodyEnd >= bodyStart + 1 && buffer[bodyEnd - 1] === 10) {
      bodyEnd -= 1;
    }

    const partData = buffer.slice(bodyStart, bodyEnd);

    let name = null;
    let filename = null;
    let contentType = 'application/octet-stream';

    const dispMatch = headerStr.match(/content-disposition:\s*form-data;?([^\r\n]+)/i);
    if (dispMatch) {
      const nameMatch = dispMatch[1].match(/name="([^"]+)"/i) || dispMatch[1].match(/name=([^\s;]+)/i);
      if (nameMatch) name = nameMatch[1];
      const fnMatch = dispMatch[1].match(/filename="([^"]+)"/i) || dispMatch[1].match(/filename=([^\s;]+)/i);
      if (fnMatch) filename = path.basename(fnMatch[1]);
    }
    const typeMatch = headerStr.match(/content-type:\s*([^\r\n;]+)/i);
    if (typeMatch) contentType = typeMatch[1].trim();

    parts.push({
      name,
      filename,
      contentType,
      data: partData,
    });
  }

  return parts;
}

function getUniqueSavedPath(dir, originalName) {
  const safeFilename = path.basename(originalName || 'file').replace(/[\/\\]/g, '_').trim() || 'file';
  const ext = path.extname(safeFilename);
  const base = path.basename(safeFilename, ext) || 'file';
  let candidate = path.join(dir, `${base}${ext}`);
  let counter = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base}-${counter}${ext}`);
    counter++;
  }
  return candidate;
}

function saveToDownloads(bufferOrSrcPath, origName) {
  try {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  } catch {}
  const destPath = getUniqueSavedPath(DOWNLOADS_DIR, origName);
  if (typeof bufferOrSrcPath === 'string') {
    fs.copyFileSync(bufferOrSrcPath, destPath);
  } else {
    fs.writeFileSync(destPath, bufferOrSrcPath);
  }
  return destPath;
}

function isImageMimeOrExt(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();
  const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.bmp', '.svg', '.tiff', '.avif']);
  if (imageExts.has(ext)) return true;
  if (mimeType && mimeType.startsWith('image/')) return true;
  return false;
}

function copyFileOrImageToHostClipboard(filePath, mimeType) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) return false;
  const isImg = isImageMimeOrExt(resolved, mimeType);
  const ext = path.extname(resolved).toLowerCase();
  const actualMime = mimeType || MIME_MAP[ext] || (isImg ? 'image/png' : 'application/octet-stream');

  try {
    if (process.platform === 'darwin') {
      const escaped = JSON.stringify(resolved);
      let script = 'ObjC.import("AppKit");\nvar pb = $.NSPasteboard.generalPasteboard;\npb.clearContents;\nvar fileUrl = $.NSURL.fileURLWithPath(' + escaped + ');\n';
      if (isImg) {
        script += 'try {\n  var img = $.NSImage.alloc.initWithContentsOfFile(' + escaped + ');\n  if (img) {\n    pb.writeObjects($([img, fileUrl]));\n  } else {\n    pb.writeObjects($([fileUrl]));\n  }\n} catch (e) {\n  pb.writeObjects($([fileUrl]));\n}\n';
      } else {
        script += 'pb.writeObjects($([fileUrl]));\n';
      }
      const proc = spawn('osascript', ['-l', 'JavaScript', '-e', script], { stdio: 'ignore' });
      proc.on('error', () => {});
      return true;
    } else if (process.platform === 'win32') {
      const winPath = resolved.replace(/'/g, "''");
      let psCommand;
      if (isImg) {
        psCommand = 'Add-Type -AssemblyName System.Windows.Forms;\nAdd-Type -AssemblyName System.Drawing;\n$p = \'' + winPath + '\';\ntry {\n  $img = [System.Drawing.Image]::FromFile($p);\n  [System.Windows.Forms.Clipboard]::SetImage($img);\n} catch {\n  $col = New-Object System.Collections.Specialized.StringCollection;\n  $col.Add($p);\n  [System.Windows.Forms.Clipboard]::SetFileDropList($col);\n}\n';
      } else {
        psCommand = 'Add-Type -AssemblyName System.Windows.Forms;\n$p = \'' + winPath + '\';\n$col = New-Object System.Collections.Specialized.StringCollection;\n$col.Add($p);\n[System.Windows.Forms.Clipboard]::SetFileDropList($col);\n';
      }
      const proc = spawn('powershell.exe', ['-NoProfile', '-Command', psCommand], { stdio: 'ignore' });
      proc.on('error', () => {});
      return true;
    } else if (process.platform === 'linux') {
      const fileData = fs.readFileSync(resolved);
      const fileUri = 'file://' + resolved + '\r\n';
      const hasWayland = Boolean(process.env.WAYLAND_DISPLAY);

      if (isImg) {
        const targetType = actualMime || 'image/png';
        const tool = hasWayland ? 'wl-copy' : 'xclip';
        const args = hasWayland ? ['--type', targetType] : ['-selection', 'clipboard', '-t', targetType];
        const proc = spawn(tool, args, { stdio: ['pipe', 'ignore', 'ignore'] });
        proc.on('error', () => {
          const altTool = hasWayland ? 'xclip' : 'wl-copy';
          const altArgs = hasWayland ? ['-selection', 'clipboard', '-t', targetType] : ['--type', targetType];
          try {
            const altProc = spawn(altTool, altArgs, { stdio: ['pipe', 'ignore', 'ignore'] });
            altProc.on('error', () => {});
            altProc.stdin.on('error', () => {});
            altProc.stdin.end(fileData);
          } catch {}
        });
        proc.stdin.on('error', () => {});
        proc.stdin.end(fileData);
      } else {
        const tool = hasWayland ? 'wl-copy' : 'xclip';
        const args = hasWayland ? ['--type', 'text/uri-list'] : ['-selection', 'clipboard', '-t', 'text/uri-list'];
        const proc = spawn(tool, args, { stdio: ['pipe', 'ignore', 'ignore'] });
        proc.on('error', () => {
          const altTool = hasWayland ? 'xclip' : 'wl-copy';
          const altArgs = hasWayland ? ['-selection', 'clipboard', '-t', 'text/uri-list'] : ['--type', 'text/uri-list'];
          try {
            const altProc = spawn(altTool, altArgs, { stdio: ['pipe', 'ignore', 'ignore'] });
            altProc.on('error', () => {});
            altProc.stdin.on('error', () => {});
            altProc.stdin.end(fileUri);
          } catch {}
        });
        proc.stdin.on('error', () => {});
        proc.stdin.end(fileUri);
      }
      return true;
    }
  } catch {}
  return false;
}

function notifyClipboardReady(name, savedPath) {
  const payload = {
    type: 'os_clipboard_ready',
    name,
    savedPath,
    platform: process.platform,
    canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V',
  };
  broadcast(payload);
}

function createAndStoreCard({ name, buffer, senderRole = 'phone' }) {
  const now = Date.now();
  const origName = path.basename(name || ('file_' + now + '.bin'));
  const safeName = now + '_' + origName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(origName).toLowerCase();
  const mime = MIME_MAP[ext] || 'application/octet-stream';
  const destPath = path.join(SHARED_DIR, safeName);
  fs.writeFileSync(destPath, buffer);

  const savedPath = saveToDownloads(buffer, origName);
  copyFileOrImageToHostClipboard(savedPath, mime);
  notifyClipboardReady(origName, savedPath);

  const category = classifyFile(origName, mime);
  let textSnippet = null;
  if (category === 'code' && buffer.length > 0) {
    textSnippet = buffer.subarray(0, 600).toString('utf8');
  }

  const item = {
    id: 'item_' + now + '_' + Math.random().toString(36).slice(2, 7),
    name: origName,
    ext: ext.replace('.', '').toUpperCase() || 'FILE',
    category,
    url: '/shared/' + encodeURIComponent(safeName),
    diskPath: destPath,
    savedPath,
    size: buffer.length,
    mime,
    textSnippet,
    from: senderRole,
    ts: now,
  };

  sharedItems.unshift(item);
  if (sharedItems.length > 50) sharedItems.pop();

  sendOSCommand({ cmd: 'flash' });

  broadcast({
    type: 'card_land',
    cardId: item.id,
    item,
    savedPath,
    fromName: senderRole === 'phone' ? 'Phone' : 'Laptop',
    canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V',
    ts: now,
  });

  return item;
}

function createAndStoreTextCard({ text, url, name, senderRole = 'phone' }) {
  const now = Date.now();
  const content = text || url || '';
  const buffer = Buffer.from(content, 'utf8');
  const isUrl = Boolean(url && !text);
  const origName = path.basename(name || (isUrl ? 'link.txt' : 'snippet.txt'));
  const safeName = now + '_' + origName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destPath = path.join(SHARED_DIR, safeName);
  fs.writeFileSync(destPath, buffer);

  const savedPath = saveToDownloads(buffer, origName);
  writeHostClipboard(content);
  notifyClipboardReady(origName, savedPath);

  const item = {
    id: 'item_' + now + '_' + Math.random().toString(36).slice(2, 7),
    name: origName,
    ext: isUrl ? 'URL' : 'TXT',
    category: isUrl ? 'file' : 'code',
    url: '/shared/' + encodeURIComponent(safeName),
    diskPath: destPath,
    savedPath,
    size: buffer.length,
    mime: 'text/plain; charset=utf-8',
    textSnippet: content.slice(0, 600),
    from: senderRole,
    ts: now,
  };

  sharedItems.unshift(item);
  if (sharedItems.length > 50) sharedItems.pop();

  sendOSCommand({ cmd: 'flash' });

  broadcast({
    type: 'card_land',
    cardId: item.id,
    item,
    savedPath,
    fromName: senderRole === 'phone' ? 'Phone' : 'Laptop',
    canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V',
    ts: now,
  });

  return item;
}

// A client-supplied path may only point inside the directories this server owns.
// Without this check a paired peer could set item.savedPath / item.diskPath to any
// absolute host path (e.g. ~/.ssh/id_rsa) and have the server copy it to the host
// clipboard, i.e. arbitrary host file read. /api/reveal already enforces the same rule.
function isPathInAllowedDirs(p) {
  if (!p || typeof p !== 'string') return false;
  const resolved = path.resolve(p);
  const inDownloads = resolved === DOWNLOADS_DIR || resolved.startsWith(DOWNLOADS_DIR + path.sep);
  const inShared = resolved === SHARED_DIR || resolved.startsWith(SHARED_DIR + path.sep);
  return inDownloads || inShared;
}

function handleCardFlickLanding(msg, info) {
  if (!msg || !msg.item) return;
  const item = msg.item;
  let savedPath = item.savedPath;

  if (savedPath && isPathInAllowedDirs(savedPath) && fs.existsSync(savedPath)) {
    copyFileOrImageToHostClipboard(savedPath, item.mime);
    notifyClipboardReady(item.name || 'File', savedPath);
  } else {
    let sourcePath = null;
    if (item.diskPath && isPathInAllowedDirs(item.diskPath) && fs.existsSync(item.diskPath)) {
      sourcePath = item.diskPath;
    } else if (item.url && item.url.startsWith('/shared/')) {
      const cleanUrl = path.basename(decodeURIComponent(item.url));
      const candidate = path.join(SHARED_DIR, cleanUrl);
      if (fs.existsSync(candidate)) sourcePath = candidate;
    }

    if (sourcePath) {
      savedPath = saveToDownloads(sourcePath, item.name || path.basename(sourcePath));
      item.savedPath = savedPath;
      copyFileOrImageToHostClipboard(savedPath, item.mime);
      notifyClipboardReady(item.name || 'File', savedPath);
    } else if (item.dataUrl || item.base64) {
      const b64Data = (item.dataUrl || item.base64).replace(/^data:[^;]+;base64,/, '');
      const buf = Buffer.from(b64Data, 'base64');
      savedPath = saveToDownloads(buf, item.name || 'image.png');
      item.savedPath = savedPath;
      copyFileOrImageToHostClipboard(savedPath, item.mime);
      notifyClipboardReady(item.name || 'File', savedPath);
    } else if (item.text || item.textSnippet) {
      const text = item.text || item.textSnippet;
      savedPath = saveToDownloads(Buffer.from(text, 'utf8'), item.name || 'snippet.txt');
      item.savedPath = savedPath;
      writeHostClipboard(text);
      notifyClipboardReady(item.name || 'Text', savedPath);
    }
  }

  broadcast({
    type: 'card_land',
    cardId: msg.cardId || item.id,
    item,
    savedPath: item.savedPath || null,
    fromName: info.name || msg.fromName || 'Phone',
    canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V',
    ts: Date.now(),
  });
}

let spuProc = null;
function startSpu() {
  if (spuProc || !fs.existsSync(SPU_BIN)) return;
  try {
    spuProc = spawn(SPU_BIN, [], { stdio: ['ignore', 'pipe', 'ignore'] });
    let buf = '';
    spuProc.stdout.on('data', (chunk) => {
      buf += chunk.toString('utf8');
      let nl;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          const ev = JSON.parse(line);
          if (ev.type === 'spu_ready') {
            spuActive = true;
            broadcastPeerList();
          } else if (ev.type === 'imu_telemetry') {
            broadcast({
              type: 'imu_telemetry',
              jerk: ev.jerk,
              noise: ev.noise,
              thresh: ev.thresh,
              typing: ev.typing,
            });
          } else if (ev.type === 'hw_bump') {
            const now = Date.now();
            if (now - lastGlobalBumpTs > 600) {
              lastGlobalBumpTs = now;
              sendOSCommand({ cmd: 'flash' });
              broadcast({
                type: 'namedrop_wave',
                source: 'Bezel Tap (AppleSPU 200Hz)',
                jerk: ev.jerk,
                serverTs: now,
              });
            }
          }
        } catch {}
      }
    });
    spuProc.on('exit', () => {
      spuProc = null;
      spuActive = false;
      broadcastPeerList();
    });
    spuProc.on('error', () => {
      spuProc = null;
      spuActive = false;
      broadcastPeerList();
    });
  } catch {
    spuProc = null;
    spuActive = false;
  }
}

function stopSpu() {
  if (spuProc) {
    try {
      spuProc.kill();
    } catch {}
    spuProc = null;
  }
  spuActive = false;
  broadcastPeerList();
}

const OS_BIN = path.join(__dirname, 'native', 'oneglass_os');

let osProc = null;
function sendOSCommand(obj) {
  if (osProc && osProc.stdin && !osProc.stdin.destroyed) {
    try {
      osProc.stdin.write(JSON.stringify(obj) + '\n');
    } catch {}
  }
}

function startOSBridge() {
  if (osProc || !fs.existsSync(OS_BIN)) return;
  try {
    osProc = spawn(OS_BIN, [], { stdio: ['pipe', 'pipe', 'ignore'] });
    let osBuf = '';
    osProc.stdout.on('data', (chunk) => {
      osBuf += chunk.toString('utf8');
      let nl;
      while ((nl = osBuf.indexOf('\n')) !== -1) {
        const line = osBuf.slice(0, nl).trim();
        osBuf = osBuf.slice(nl + 1);
        if (!line) continue;
        try {
          const ev = JSON.parse(line);
          if (ev.type === 'os_clipboard' && ev.text) {
            broadcast({
              type: 'clipboard_sync',
              text: ev.text,
              fromName: 'macOS Clipboard',
              ts: Date.now(),
            });
          } else if (ev.type === 'os_file_drop' && Array.isArray(ev.paths)) {
            for (const srcPath of ev.paths) {
              try {
                if (!fs.existsSync(srcPath) || !fs.statSync(srcPath).isFile()) continue;
                const origName = path.basename(srcPath);
                const safeName = `${Date.now()}_${origName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                const ext = path.extname(origName).toLowerCase();
                const mime = MIME_MAP[ext] || 'application/octet-stream';
                const destPath = path.join(SHARED_DIR, safeName);
                fs.copyFileSync(srcPath, destPath);
                const savedPath = saveToDownloads(srcPath, origName);
                const stat = fs.statSync(destPath);
                const category = classifyFile(origName, mime);
                let textSnippet = null;
                if (category === 'code' && stat.size > 0) {
                  const fd = fs.openSync(destPath, 'r');
                  const b = Buffer.alloc(Math.min(600, stat.size));
                  fs.readSync(fd, b, 0, b.length, 0);
                  fs.closeSync(fd);
                  textSnippet = b.toString('utf8');
                }
                const item = {
                  id: `finder_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  name: origName,
                  ext: ext.replace('.', '').toUpperCase() || 'FILE',
                  category,
                  url: `/shared/${encodeURIComponent(safeName)}`,
                  diskPath: destPath,
                  savedPath,
                  size: stat.size,
                  mime,
                  textSnippet,
                  from: 'macOS Finder',
                  ts: Date.now(),
                };
                sharedItems.unshift(item);
                sendOSCommand({ cmd: 'flash' });
                broadcast({
                  type: 'card_flick',
                  cardId: item.id,
                  edge: 'right',
                  fromName: 'macOS Finder',
                  item,
                  contactRatio: 0.5,
                });
                broadcast({
                  type: 'card_land',
                  cardId: item.id,
                  item,
                  savedPath,
                  fromName: 'macOS Finder',
                  canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V',
                  ts: Date.now(),
                });
                broadcast({
                  type: 'namedrop_wave',
                  source: `Finder → ${origName}`,
                  edge: 'right',
                  contactRatio: 0.5,
                  jerk: 0.25,
                  serverTs: Date.now(),
                });
              } catch {}
            }
          }
        } catch {}
      }
    });
    osProc.on('exit', () => {
      osProc = null;
      broadcastPeerList();
    });
    osProc.on('error', () => {
      osProc = null;
      broadcastPeerList();
    });
    broadcastPeerList();
  } catch {
    osProc = null;
  }
}

function stopOSBridge() {
  if (osProc) {
    try {
      sendOSCommand({ cmd: 'exit' });
      osProc.kill();
    } catch {}
    osProc = null;
  }
  broadcastPeerList();
}

// STRICT OPT-IN: Do not auto-spawn native macOS overlay or SPU daemon by default!
const nativeOptIn = process.env.ONEGLASS_NATIVE === '1' || process.argv.includes('--native');
if (nativeOptIn) {
  startSpu();
  startOSBridge();
}

process.on('exit', () => {
  stopSpu();
  stopOSBridge();
});
const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (!isFromOwnPage(req)) {
    res.writeHead(403, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ error: 'Requests must come from a OneGlass page on this machine.' }));
    return;
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }


  if (req.method === 'GET' && url.pathname === '/api/status') {
    let phonesCount = 0;
    let laptopsCount = 0;
    for (const p of peers.values()) {
      if (p.role === 'phone') phonesCount++;
      else if (p.role === 'laptop') laptopsCount++;
    }
    // The pairing token is a secret: only a local or token-bearing caller gets it,
    // including inside the endpoint URLs.
    const maySeeToken = requestMaySeeToken(req, url);
    const body = JSON.stringify({
      ok: true,
      peersCount: peers.size,
      phonesCount,
      laptopsCount,
      spuActive,
      nativeBridgeActive: Boolean(osProc),
      lanIp: LAN_IP,
      mdnsHost: networkInfo.mdnsHost,
      tailscaleIp: networkInfo.tailscaleIp,
      tunnelUrl: networkInfo.tunnelUrl,
      endpoints: maySeeToken ? networkInfo.endpoints : publicEndpoints(),
      port: PORT,
      ...(maySeeToken
        ? { sessionToken, pairUrl: `http://${LAN_IP}:${PORT}/?role=phone&token=${sessionToken}` }
        : {}),
      sharedFilesCount: sharedItems.length,
    });
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    res.end(body);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/info') {
    // Same secret gate as /api/status: the token, the tokenized URLs, and the QR
    // (which encodes the tokenized URL) go only to a local or token-bearing caller.
    const maySeeToken = requestMaySeeToken(req, url);
    const body = JSON.stringify({
      lanIp: LAN_IP,
      mdnsHost: networkInfo.mdnsHost,
      tailscaleIp: networkInfo.tailscaleIp,
      tunnelUrl: networkInfo.tunnelUrl,
      endpoints: maySeeToken ? networkInfo.endpoints : publicEndpoints(),
      port: PORT,
      ...(maySeeToken
        ? {
            sessionToken,
            pairUrl: `http://${LAN_IP}:${PORT}/?role=phone&token=${sessionToken}`,
            phoneUrl: PHONE_URL,
            qrSvg: qrSvgCache,
          }
        : {}),
      spuActive,
      nativeBridgeActive: Boolean(osProc),
      sharedItems: maySeeToken ? sharedItems : [],
    });
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(body);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/qr') {
    // Default QR encodes the tokenized pair URL, so it is only served to an authorized caller.
    const textToEncode =
      url.searchParams.get('text') || (requestMaySeeToken(req, url) ? PHONE_URL : stripToken(PHONE_URL));
    QRCode.toString(
      textToEncode,
      {
        type: 'svg',
        margin: 1,
        color: { dark: '#f8fafc', light: '#00000000' },
      },
      (err, svg) => {
        if (err) {
          res.writeHead(500);
          res.end('QR generation error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' });
        res.end(svg);
      },
    );
    return;
  }

  if (req.method === 'POST' && (url.pathname === '/upload' || url.pathname === '/api/upload')) {
    if (!requestMaySeeToken(req, url)) return rejectUnpaired(res);
    const origName = path.basename(url.searchParams.get('name') || ('file_' + Date.now() + '.bin'));
    const senderRole = url.searchParams.get('from') || 'phone';
    const MAX_UPLOAD_BYTES = 250 * 1024 * 1024;

    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > MAX_UPLOAD_BYTES) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Payload Too Large', maxBytes: MAX_UPLOAD_BYTES }));
      req.destroy();
      return;
    }

    const chunks = [];
    let totalBytes = 0;
    let aborted = false;

    req.on('data', (chunk) => {
      if (aborted) return;
      totalBytes += chunk.length;
      if (totalBytes > MAX_UPLOAD_BYTES) {
        aborted = true;
        chunks.length = 0;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload Too Large', maxBytes: MAX_UPLOAD_BYTES }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (aborted) return;
      const buffer = Buffer.concat(chunks);
      const item = createAndStoreCard({ name: origName, buffer, senderRole });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(item));
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/reveal') {
    if (!requestMaySeeToken(req, url)) return rejectUnpaired(res);
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const rawTarget = parsed.path || DOWNLOADS_DIR;
        const targetPath = path.resolve(rawTarget);
        const inDownloads = targetPath === DOWNLOADS_DIR || targetPath.startsWith(DOWNLOADS_DIR + path.sep);
        const inShared = targetPath === SHARED_DIR || targetPath.startsWith(SHARED_DIR + path.sep);

        if (!inDownloads && !inShared) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Forbidden: Path outside allowed directories' }));
          return;
        }

        if (!fs.existsSync(targetPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
          return;
        }

        let proc;
        if (process.platform === 'darwin') {
          proc = spawn('open', ['-R', targetPath]);
        } else if (process.platform === 'win32') {
          proc = spawn('explorer.exe', ['/select,' + targetPath]);
        } else {
          proc = spawn('xdg-open', [path.dirname(targetPath)]);
        }
        if (proc) {
          proc.on('error', () => {});
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, path: targetPath, platform: process.platform }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/beam') {
    if (!requestMaySeeToken(req, url)) return rejectUnpaired(res);
    const contentType = req.headers['content-type'] || '';
    const queryName = url.searchParams.get('name');
    const headerName = req.headers['x-file-name'] || req.headers['x-filename'];
    const queryText = url.searchParams.get('text');
    const queryUrl = url.searchParams.get('url');

    const chunks = [];
    let totalBytes = 0;
    const MAX_UPLOAD_BYTES = 250 * 1024 * 1024;
    let aborted = false;

    req.on('data', (chunk) => {
      if (aborted) return;
      totalBytes += chunk.length;
      if (totalBytes > MAX_UPLOAD_BYTES) {
        aborted = true;
        chunks.length = 0;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload Too Large', maxBytes: MAX_UPLOAD_BYTES }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (aborted) return;
      const buffer = Buffer.concat(chunks);

      try {
        if (contentType.includes('multipart/form-data')) {
          const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
          const boundary = match ? (match[1] || match[2]).trim() : null;
          const parts = boundary ? parseMultipart(buffer, boundary) : [];

          const fileParts = parts.filter((p) => p.filename && p.data && p.data.length > 0);
          if (fileParts.length > 0) {
            let lastItem = null;
            for (const fp of fileParts) {
              lastItem = createAndStoreCard({ name: fp.filename, buffer: fp.data, senderRole: 'phone' });
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, item: lastItem, savedPath: lastItem.savedPath, canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V' }));
            return;
          }

          const textField = parts.find((p) => p.name === 'text')?.data.toString('utf8');
          const urlField = parts.find((p) => p.name === 'url')?.data.toString('utf8');
          const titleField = parts.find((p) => p.name === 'title' || p.name === 'name')?.data.toString('utf8');
          if (textField || urlField || titleField) {
            const item = createAndStoreTextCard({ text: textField, url: urlField, name: titleField, senderRole: 'phone' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, item, savedPath: item.savedPath, canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V' }));
            return;
          }
        }

        if (contentType.includes('application/json') || (buffer.length > 0 && buffer[0] === 123)) {
          let json = {};
          try {
            json = JSON.parse(buffer.toString('utf8'));
          } catch {}
          if (json.base64 || json.file) {
            const rawB64 = (json.base64 || json.file).replace(/^data:[^;]+;base64,/, '');
            const fileBuf = Buffer.from(rawB64, 'base64');
            const item = createAndStoreCard({ name: json.name || queryName || headerName || 'beamed_file.bin', buffer: fileBuf, senderRole: 'phone' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, item, savedPath: item.savedPath, canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V' }));
            return;
          }
          if (json.text || json.url) {
            const item = createAndStoreTextCard({ text: json.text, url: json.url, name: json.name || queryName, senderRole: 'phone' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, item, savedPath: item.savedPath, canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V' }));
            return;
          }
        }

        if (queryText || queryUrl) {
          const item = createAndStoreTextCard({ text: queryText, url: queryUrl, name: queryName, senderRole: 'phone' });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, item, savedPath: item.savedPath, canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V' }));
          return;
        }

        const mimeBase = contentType.split(';')[0].trim().toLowerCase();
        const fallbackExt = MIME_TO_EXT[mimeBase] || '.bin';
        const rawName = queryName || headerName || ('beamed_' + Date.now() + fallbackExt);
        const item = createAndStoreCard({ name: rawName, buffer, senderRole: 'phone' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, item, savedPath: item.savedPath, canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message || 'Failed to beam file' }));
      }
    });
    return;
  }

  if (url.pathname === '/api/share-target') {
    if (req.method === 'GET') {
      res.writeHead(302, { Location: '/?role=phone' });
      res.end();
      return;
    }
    if (req.method === 'POST') {
      if (!requestMaySeeToken(req, url)) {
        // Shared from the phone's share sheet without a pairing: show the pairing screen, not JSON.
        res.writeHead(303, { Location: '/?role=phone' });
        res.end();
        return;
      }
      const contentType = req.headers['content-type'] || '';
      const chunks = [];
      let totalBytes = 0;
      const MAX_UPLOAD_BYTES = 250 * 1024 * 1024;
      let aborted = false;

      req.on('data', (chunk) => {
        if (aborted) return;
        totalBytes += chunk.length;
        if (totalBytes > MAX_UPLOAD_BYTES) {
          aborted = true;
          chunks.length = 0;
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Payload Too Large' }));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });

      req.on('end', () => {
        if (aborted) return;
        const buffer = Buffer.concat(chunks);
        try {
          if (contentType.includes('multipart/form-data')) {
            const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
            const boundary = match ? (match[1] || match[2]).trim() : null;
            const parts = boundary ? parseMultipart(buffer, boundary) : [];

            const fileParts = parts.filter((p) => p.filename && p.data && p.data.length > 0);
            if (fileParts.length > 0) {
              for (const fp of fileParts) {
                createAndStoreCard({ name: fp.filename, buffer: fp.data, senderRole: 'phone' });
              }
            } else {
              const title = parts.find((p) => p.name === 'title')?.data.toString('utf8');
              const text = parts.find((p) => p.name === 'text')?.data.toString('utf8');
              const urlVal = parts.find((p) => p.name === 'url')?.data.toString('utf8');
              const combined = [text, urlVal].filter(Boolean).join('\n') || title || '';
              if (combined) {
                const safeTitle = title ? (title.replace(/[^a-zA-Z0-9._-]/g, '_') + '.txt') : 'android_share.txt';
                createAndStoreTextCard({
                  text: combined,
                  url: urlVal,
                  name: safeTitle,
                  senderRole: 'phone',
                });
              }
            }
          }
        } catch {}

        res.writeHead(303, { Location: '/?role=phone&shared=1' });
        res.end();
      });
      return;
    }
  }

  if (req.method === 'GET' && url.pathname.startsWith('/shared/')) {
    if (!requestMaySeeToken(req, url)) return rejectUnpaired(res);
    const fname = decodeURIComponent(url.pathname.slice('/shared/'.length));
    const safePath = path.join(SHARED_DIR, path.basename(fname));
    if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';
      const stat = fs.statSync(safePath);
      const forceDownload = url.searchParams.get('dl') === '1';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `${forceDownload ? 'attachment' : 'inline'}; filename="${path.basename(safePath)}"`,
      });
      fs.createReadStream(safePath).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    'Content-Type': MIME_MAP[ext] || 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  };
  if (url.searchParams.get('token') === sessionToken) {
    headers['Set-Cookie'] = `${SESSION_COOKIE}=${encodeURIComponent(sessionToken)}; HttpOnly; SameSite=Lax; Path=/`;
  }
  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
});

const wss = new WebSocketServer({ server });

let phoneCounter = 1;

wss.on('connection', (ws, req) => {
  if (!isFromOwnPage(req)) {
    ws.close(1008, 'Connections must come from a OneGlass page on this machine.');
    return;
  }
  const id = `peer_${Math.random().toString(36).slice(2, 9)}`;
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const clientToken = reqUrl.searchParams.get('token');
  const rawIp = req.socket?.remoteAddress || '';
  const clientIp = rawIp.replace(/^::ffff:/, '');
  const isLocal = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost';
  const isOpenLan = process.env.ONEGLASS_OPEN_LAN === '1';
  const tokenValid = presentsValidToken(req, reqUrl);
  const authenticated = isLocal || isOpenLan || tokenValid;

  const ua = req.headers['user-agent'] || '';
  const isMobileUA = /iPhone|iPad|iPod|Android/i.test(ua);
  const role = isMobileUA ? 'phone' : 'laptop';
  const baseName = /iPhone/i.test(ua)
    ? 'iPhone'
    : /iPad/i.test(ua)
      ? 'iPad'
      : /Android/i.test(ua)
        ? 'Android'
        : /Macintosh/i.test(ua)
          ? 'MacBook'
          : /Windows/i.test(ua)
            ? 'Windows'
            : 'Display';

  const centerRatio = assignInitialStripPosition();
  const info = {
    id,
    role,
    name: role === 'phone' ? `${baseName} #${phoneCounter++}` : baseName,
    color: STRIP_COLORS[colorCursor++ % STRIP_COLORS.length],
    ua,
    widthPx: 390,
    heightPx: 844,
    dpr: 2,
    edge: 'right',
    centerRatio,
    spanRatio: 0.28,
    token: clientToken || null,
    authenticated,
    isLocal,
    connectedAt: Date.now(),
  };
  // Unpaired sockets are not peers: they get no broadcasts (cards, clipboard, peer list) and every
  // message except a token-bearing `hello` is ignored, so they cannot drop files or text onto the host.
  if (authenticated) peers.set(ws, info);

  const sendWelcome = () => sendTo(ws, {
    type: 'welcome',
    selfId: id,
    selfInfo: info,
    serverTs: Date.now(),
    lanIp: LAN_IP,
    mdnsHost: networkInfo.mdnsHost,
    tailscaleIp: networkInfo.tailscaleIp,
    tunnelUrl: networkInfo.tunnelUrl,
    // Unauthenticated LAN sockets get no token, in any field.
    endpoints: info.authenticated ? networkInfo.endpoints : publicEndpoints(),
    ...(info.authenticated
      ? {
          phoneUrl: PHONE_URL,
          sessionToken,
          pairUrl: `http://${LAN_IP}:${PORT}/?role=phone&token=${sessionToken}`,
        }
      : { phoneUrl: stripToken(PHONE_URL) }),
    authenticated: info.authenticated,
    spuActive,
    nativeBridgeActive: Boolean(osProc),
    sharedItems: info.authenticated ? sharedItems : [],
  });
  sendWelcome();
  if (authenticated) broadcastPeerList();

  let warnedUnpaired = false;
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString('utf8'));
    } catch {
      return;
    }

    if (!info.authenticated) {
      if (msg.type === 'hello' && msg.token && msg.token === sessionToken) {
        info.authenticated = true;
        peers.set(ws, info);
        sendWelcome();
      } else {
        if (!warnedUnpaired) {
          warnedUnpaired = true;
          sendTo(ws, { type: 'error', error: 'Pairing token required. Scan the QR code on the host to pair.' });
        }
        return;
      }
    }

    if (msg.type === 'hello') {
      if (msg.token && msg.token === sessionToken) {
        info.authenticated = true;
      }
      if (msg.role) {
        if (info.role !== msg.role && msg.role === 'phone' && !info.name.includes('#')) {
          info.name = `${info.name} #${phoneCounter++}`;
        }
        info.role = msg.role;
      }
      if (msg.deviceName) info.name = msg.deviceName;
      info.widthPx = msg.widthPx || info.widthPx;
      info.heightPx = msg.heightPx || info.heightPx;
      info.dpr = msg.dpr || info.dpr;
      broadcastPeerList();
      return;
    }

    if (msg.type === 'toggle_native_os') {
      if (!info.authenticated) {
        sendTo(ws, { type: 'error', error: 'Unauthorized to toggle native OS daemon' });
        return;
      }
      const enable = Boolean(msg.enabled);
      if (enable) {
        startSpu();
        startOSBridge();
      } else {
        stopSpu();
        stopOSBridge();
      }
      broadcastPeerList();
      broadcast({
        type: 'native_os_status',
        spuActive,
        nativeBridgeActive: Boolean(osProc),
      });
      return;
    }

    // Update a specific peer's Bezel Strip alignment (`edge`, `centerRatio`, `spanRatio`)
    if (msg.type === 'update_strip') {
      let updatedEdge = msg.edge || null;
      let updatedCenter = typeof msg.centerRatio === 'number' ? msg.centerRatio : null;
      for (const p of peers.values()) {
        if (p.id === msg.peerId || (!msg.peerId && p.role === 'phone')) {
          if (msg.edge) p.edge = msg.edge;
          if (typeof msg.centerRatio === 'number') {
            p.centerRatio = Math.max(0.08, Math.min(0.92, msg.centerRatio));
          }
          if (typeof msg.spanRatio === 'number') {
            p.spanRatio = Math.max(0.12, Math.min(0.65, msg.spanRatio));
          }
          if (!updatedEdge) updatedEdge = p.edge;
          if (updatedCenter == null) updatedCenter = p.centerRatio;
        }
      }
      const edge = updatedEdge || 'right';
      const centerRatio = typeof updatedCenter === 'number' ? updatedCenter : 0.5;
      sendOSCommand({
        cmd: 'set_strip',
        edge,
        centerRatio,
        lengthMm: 150,
      });
      broadcastPeerList();
      return;
    }

    if (msg.type === 'bump_trigger') {
      const now = Date.now();
      if (now - lastGlobalBumpTs > 400) {
        lastGlobalBumpTs = now;
        broadcast({
          type: 'namedrop_wave',
          source: msg.source || info.name,
          edge: info.role === 'phone' ? info.edge : msg.edge || 'right',
          contactRatio: info.role === 'phone' ? info.centerRatio : msg.contactRatio ?? 0.5,
          jerk: msg.jerk || 0.18,
          serverTs: now,
        });
      }
      return;
    }

    // WebRTC P2P Signaling Relay (targeted to `msg.targetId` if specified)
    if (msg.type === 'webrtc_signal') {
      msg.fromId = info.id;
      msg.fromRole = info.role;
      msg.fromName = info.name;
      if (msg.targetId) {
        for (const [client, p] of peers.entries()) {
          if (p.id === msg.targetId) {
            sendTo(client, msg);
          }
        }
      } else {
        broadcast(msg, ws);
      }
      return;
    }

    // Live Spanning Display / Canvas Stroke / Screen Portal / Scanner / Clipboard / Trackpad Sync
    if (
      msg.type === 'canvas_stroke' ||
      msg.type === 'display_widget_sync' ||
      msg.type === 'display_mode_sync' ||
      msg.type === 'clipboard_sync' ||
      msg.type === 'remote_cursor' ||
      msg.type === 'screen_portal_frame' ||
      msg.type === 'screen_portal_tap' ||
      msg.type === 'screen_portal_stop' ||
      msg.type === 'scanner_sync'
    ) {
      // Reject unauthenticated remote LAN WebSocket remote_cursor / clipboard_sync commands
      if (msg.type === 'remote_cursor' || msg.type === 'clipboard_sync') {
        if (!info.authenticated) {
          sendTo(ws, {
            type: 'error',
            error: 'Unauthorized: valid pairing token required for remote_cursor & clipboard_sync on LAN',
          });
          return;
        }
      }
      msg.fromId = info.id;
      msg.fromRole = info.role;
      msg.fromName = info.name;
      msg.fromColor = info.color;
      // Forward phone Trackpad & Laser directly to the native macOS OS cursor/laser engine!
      if (msg.type === 'remote_cursor') {
        sendOSCommand({
          cmd: 'cursor',
          xRatio: msg.xRatio ?? 0.5,
          yRatio: msg.yRatio ?? 0.5,
          clicking: Boolean(msg.clicking),
          laser: Boolean(msg.laser),
        });
      } else if (msg.type === 'clipboard_sync' && msg.text) {
        lastHostClipboard = msg.text;
        if (osProc) {
          sendOSCommand({ cmd: 'clipboard', text: msg.text });
        } else {
          writeHostClipboard(msg.text);
        }
      }
      if (msg.type === 'clipboard_sync') broadcastAuthenticated(msg, ws);
      else broadcast(msg, ws);
      return;
    }

    // Strip-Aligned Routing for `drag_stream`, `drag_end`, and `card_flick`:
    //   Case A: Sent from a Phone (`info.role === 'phone'`) through its top bezel
    //           -> Maps onto that phone's exact `(info.edge, info.centerRatio, info.spanRatio)` strip on the Laptop!
    //   Case B: Sent from the Laptop (`info.role === 'laptop'`) toward `msg.edge` at `[rMin .. rMax]`
    //           -> Routes ONLY to the phone(s) whose strip on `msg.edge` overlaps `[rMin .. rMax]`!
    //              (If two phones' strips both overlap the dragged card, BOTH phones get their exact local slice!)
    if (msg.type === 'drag_stream' || msg.type === 'card_flick') {
      msg.fromId = info.id;
      msg.fromRole = info.role;
      msg.fromName = info.name;
      msg.fromColor = info.color;

      if (info.role === 'phone') {
        const localRatio = msg.contactRatio ?? 0.5;
        const stripStart = info.centerRatio - info.spanRatio / 2;
        const hostRatio = Math.max(0.04, Math.min(0.96, stripStart + localRatio * info.spanRatio));
        if (msg.type === 'card_flick') {
          handleCardFlickLanding(msg, info);
        }
        const payload = {
          ...msg,
          edge: info.edge,
          contactRatio: hostRatio,
          savedPath: msg.item?.savedPath,
          canPasteShortcut: process.platform === 'darwin' ? '⌘V' : 'Ctrl+V',
        };
        for (const [client, p] of peers.entries()) {
          if (client !== ws && p.role === 'laptop') {
            sendTo(client, payload);
          }
        }
        if (msg.type === 'card_flick') {
          broadcast({
            type: 'namedrop_wave',
            source: `${info.name} → ${msg.item?.name || 'Card'}`,
            edge: info.edge,
            contactRatio: hostRatio,
            jerk: 0.24,
            serverTs: Date.now(),
          });
        }
      } else {
        if (msg.type === 'card_flick') {
          handleCardFlickLanding(msg, info);
        }
        // From Laptop -> Find all Phone strips on `msg.edge` overlapping the card's span `[rStart .. rEnd]`
        const targetEdge = msg.edge || 'right';
        const cardCenter = msg.contactRatio ?? 0.5;
        const cardHalfSpan = (msg.cardSpanRatio || 0.14) / 2;
        const cMin = cardCenter - cardHalfSpan;
        const cMax = cardCenter + cardHalfSpan;

        let anyMatched = false;
        for (const [client, p] of peers.entries()) {
          if (client === ws || p.role !== 'phone') continue;
          const sMin = p.centerRatio - p.spanRatio / 2;
          const sMax = p.centerRatio + p.spanRatio / 2;
          const overlaps = p.edge === targetEdge && cMax >= sMin - 0.03 && cMin <= sMax + 0.03;

          if (overlaps) {
            anyMatched = true;
            const localRatio = Math.max(0.06, Math.min(0.94, (cardCenter - sMin) / Math.max(0.05, p.spanRatio)));
            sendTo(client, {
              ...msg,
              edge: 'top',
              contactRatio: localRatio,
            });
          } else if (msg.type === 'drag_stream') {
            // Ensure non-overlapping phones remove any stale phantom if the card slid off their strip!
            sendTo(client, { type: 'drag_end', cardId: msg.cardId });
          }
        }

        if (msg.type === 'card_flick' && anyMatched) {
          broadcast({
            type: 'namedrop_wave',
            source: `${info.name} → ${msg.item?.name || 'Card'}`,
            edge: targetEdge,
            contactRatio: cardCenter,
            jerk: 0.24,
            serverTs: Date.now(),
          });
        }
      }
      return;
    }

    if (msg.type === 'drag_end') {
      broadcast(msg, ws);
    }
  });

  ws.on('close', () => {
    peers.delete(ws);
    broadcastPeerList();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`OneGlass server live:`);
  console.log(`  Laptop View : http://127.0.0.1:${PORT}`);
  console.log(`  Phone (LAN) : ${PHONE_URL}`);
  if (networkInfo.mdnsHost) {
    console.log(`  Phone (mDNS): http://${networkInfo.mdnsHost}:${PORT}/?role=phone&token=${sessionToken}`);
  }
  if (networkInfo.tailscaleIp) {
    console.log(`  Phone (Tail): http://${networkInfo.tailscaleIp}:${PORT}/?role=phone&token=${sessionToken} (AP-Isolation Bypass)`);
  }
  if (networkInfo.tunnelUrl) {
    console.log(`  Phone Tunnel: ${networkInfo.tunnelUrl}`);
  }
});
