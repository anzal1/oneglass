#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
  } else if (arg === '--sync-clipboard') {
    // read by server.mjs from process.argv
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
  --sync-clipboard    Send everything you copy on this computer to paired devices (off by default)
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

const laptopUrl = `http://127.0.0.1:${port}`;

// Import and start the main server. Its phone URL carries the pairing token, so the QR
// printed here is the one a phone can actually pair with.
const { PHONE_URL: phoneUrl } = await import(pathToFileURL(path.join(__dirname, '..', 'server.mjs')).href);

QRCode.toString(phoneUrl, { type: 'terminal', small: true }, (err, qrAscii) => {
  console.log('\n  ┌──────────────────────────────────────────────────────────┐');
  console.log('  │  OneGlass: cross-device continuity & Spatial Display    │');
  console.log('  └──────────────────────────────────────────────────────────┘');
  console.log(`  Laptop Surface : \x1b[36m${laptopUrl}\x1b[0m`);
  console.log(`  Phone Surface  : scan this code with your phone camera (same Wi-Fi)`);
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

if (!noOpen) {
  // On Windows `start` is a cmd built-in, not a program, so it has to go through cmd.
  const [openCmd, openArgs] =
    process.platform === 'darwin' ? ['open', [laptopUrl]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', laptopUrl]]
    : ['xdg-open', [laptopUrl]];
  try {
    spawn(openCmd, openArgs, { stdio: 'ignore', detached: true }).unref();
  } catch {}
}
