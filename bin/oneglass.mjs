#!/usr/bin/env node
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const QRCode = require('qrcode');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
let port = +(process.env.PORT || 8484);
let noOpen = false;
let checkStatus = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--port' || arg === '-p') {
    const next = args[i + 1];
    if (next && !next.startsWith('-')) {
      const parsed = parseInt(next, 10);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed < 65536) {
        port = parsed;
      }
      i++;
    }
  } else if (arg.startsWith('--port=')) {
    const parsed = parseInt(arg.slice('--port='.length), 10);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed < 65536) {
      port = parsed;
    }
  } else if (arg === '--no-open') {
    noOpen = true;
  } else if (arg === '--status') {
    checkStatus = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
OneGlass: cross-device continuity & Spatial Display

Usage:
  oneglass [options]

Options:
  --port <n>, -p <n>   HTTP/WebSocket server port (default: 8484)
  --no-open           Do not automatically open laptop browser tab
  --status            Inspect status of running OneGlass server and exit
  --help, -h          Show this help message
`);
    process.exit(0);
  }
}

process.env.PORT = String(port);

if (checkStatus) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/status`);
    if (!res.ok) {
      console.error(`OneGlass server responded with HTTP ${res.status}`);
      process.exit(1);
    }
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(`No running OneGlass server found on port ${port} (${err.message})`);
    process.exit(1);
  }
}

function getLanIp() {
  const nets = os.networkInterfaces();
  const candidates = [];
  for (const [name, list] of Object.entries(nets)) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) {
        const priority = name === 'en0' || name.startsWith('wlan') || name.startsWith('wl') ? 0 : 1;
        candidates.push({ address: net.address, priority });
      }
    }
  }
  candidates.sort((a, b) => a.priority - b.priority);
  return candidates[0]?.address || '127.0.0.1';
}

const lanIp = getLanIp();
const phoneUrl = `http://${lanIp}:${port}/?role=phone`;
const laptopUrl = `http://127.0.0.1:${port}`;

QRCode.toString(phoneUrl, { type: 'terminal', small: true }, (err, qrAscii) => {
  console.log('\n  ┌──────────────────────────────────────────────────────────┐');
  console.log('  │  OneGlass: cross-device continuity & Spatial Display    │');
  console.log('  └──────────────────────────────────────────────────────────┘');
  console.log(`  Laptop Surface : \x1b[36m${laptopUrl}\x1b[0m`);
  console.log(`  Phone Surface  : \x1b[32m${phoneUrl}\x1b[0m`);
  console.log('  Command Bar    : Press \x1b[1m⌘K\x1b[0m inside the app\n');
  if (!err && qrAscii) {
    console.log(
      qrAscii
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n'),
    );
  }
});

// Import and start the main server
await import(path.join(__dirname, '..', 'server.mjs'));

if (!noOpen) {
  const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    spawn(openCmd, [laptopUrl], { stdio: 'ignore', detached: true }).unref();
  } catch {}
}
