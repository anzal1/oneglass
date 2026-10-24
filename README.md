# OneGlass

**Flick a file off the edge of your laptop screen and it lands on your phone, and back. Runs in a browser tab on the same Wi-Fi: no app to install on the phone.**

```bash
git clone https://github.com/anzal1/oneglass.git && cd oneglass && npm install && npm start
```

---

## Highlights

- **Physical Bezel-Tap `NameDrop` (macOS Opt-In `--native`):** Tap your phone against an Apple Silicon MacBook bezel to trigger an instant seismic pairing wave powered by the internal 200Hz `AppleSPU` accelerometer.
- **System-Wide Finder Bezel Strip (macOS Opt-In `--native`):** Drag files directly from macOS Finder onto your calibrated physical screen edge even when the browser is minimized.
- **Zero-Install Mobile Web Continuity (All OSes):** Cards, files, and canvases peek across display bezels in physical millimeters at 60–120fps with momentum projection in any mobile Safari/Chrome browser.
- **WebRTC DataChannels for live input:** When two screens can reach each other directly, trackpad, laser and drag telemetry move to an unordered `fast-telemetry` datachannel. Files and clipboard travel over the LAN WebSocket relay.
- **Extended Spatial Display Modes:** Wireless Screen Portal monitor, Continuity Camera & Whiteboard Scanner, Top-Notch Teleprompter, Panoramic Wall, and 120Hz Glass Trackpad.
- **Linear-Grade UI:** High-density command bar (`⌘K`), dynamic island status rail, glassmorphic floating cards, and tactile audio-haptic feedback.
- **Phone-to-Cursor Paste (`⌘V` / `Ctrl+V` on macOS, Windows, Linux):** Auto-saves received files into `~/Downloads/OneGlass/` and injects directly into host OS System Clipboard (macOS `NSPasteboard`, Windows PowerShell `SetImage`/`SetFileDropList`, Linux `wl-copy`/`xclip`) with 1-click Finder/Explorer reveal.
- **Universal Mobile Share Sheet:** Native Android PWA `share_target` (no app install needed) and iOS 1-tap `POST /api/beam` Shortcut support.

---

## 1-Command Quickstart

```bash
git clone https://github.com/anzal1/oneglass.git
cd oneglass
npm install
npm start
```

### CLI Options

```bash
# Specify custom HTTP/WebSocket port (default: 8484)
node bin/oneglass.mjs --port 9000

# Run in headless mode without automatically launching a browser tab
node bin/oneglass.mjs --no-open

# Query status and diagnostics of a running OneGlass server instance
node bin/oneglass.mjs --status
```

- **Laptop Surface:** Open `http://127.0.0.1:8484` in any modern desktop browser (Press **`⌘K`** for the Command Palette).
- **Phone / Tablet Surface:** Scan the QR code printed in your terminal or on screen (`http://<LAN_IP>:8484/?role=phone`). No app store download or extension required.

---
## Pairing, privacy and HTTPS

- **Only paired devices can use it.** The QR code carries a one-time session token. Devices on the network without it get nothing: no files, no clipboard, no shared list. Browser pages from other websites on the laptop cannot talk to OneGlass either.
- **Everything stays on your network.** Files go from device to device through the server on your laptop and land in `~/Downloads/OneGlass/`.
- **Phone features that need HTTPS:** browsers only allow the camera, clipboard access and installing as an app on secure pages. Over a plain `http://` LAN address those features are switched off on the phone (the app shows a banner saying so). Sending files and flicking cards work either way.

## From phone to cursor

### 1. Cross-Platform Host OS System Clipboard Injection

Whenever an image, photo, screenshot, or file is flicked from a phone or received via the network, OneGlass automatically injects it directly into the host operating system's system clipboard without requiring any browser focus or tab switching:

- **macOS (`darwin`):** Invokes `osascript -l JavaScript` with Apple's `ObjC.import('AppKit')` to write **both** `NSImage.alloc.initWithContentsOfFile` and `NSURL.fileURLWithPath` to `NSPasteboard.generalPasteboard`. You can immediately press **`⌘V`** inside **Figma, Cursor, Claude, Slack, Word, Notion, Notes, or Finder** and paste the raw image or file instantly.
- **Windows (`win32`):** Spawns a background PowerShell session calling `[System.Windows.Forms.Clipboard]::SetImage()` for visual media and `SetFileDropList()` for files. Pressing **`Ctrl+V`** pastes directly into Word, PowerPoint, Discord, Cursor, or Explorer.
- **Linux (`linux`):** Automatically detects Wayland (`wl-copy`) vs X11 (`xclip` / `xsel`) and streams the image byte buffer with the appropriate MIME type (e.g. `image/png` or `text/uri-list`), enabling seamless **`Ctrl+V`** across GNOME, KDE, or window managers.

---

### 2. Auto-Save to `~/Downloads/OneGlass/` & 1-Click Reveal

- **Organized Auto-Save:** Every beamed or flicked asset is automatically persisted to `~/Downloads/OneGlass/<original_filename>`. Filename collision detection automatically suffixes duplicates (`-1`, `-2`) while preserving original human filenames and extensions.
- **"Ready to Paste" Emerald HUD:** As soon as an asset arrives, an emerald banner pill slides into view confirming clipboard injection and offering a 1-click **"Show in Finder / Explorer"** button.
- **Native OS Reveal (`POST /api/reveal`):** Every card on the canvas includes a **"Reveal in Folder"** button that talks to `POST /api/reveal` to highlight the exact file in the native file manager:
  - macOS: `open -R <path>`
  - Windows: `explorer.exe /select,<path>`
  - Linux: `xdg-open <dir>`

---

### 3. Android PWA Native Share Target (W3C Web Share Target Level-2)

No Android app download is required. Simply scan the pairing QR code and tap **"Add to Home Screen"**:
- OneGlass registers a W3C Web Share Target Level-2 manifest in `public/manifest.json` (`POST /api/share-target`).
- OneGlass now appears natively inside your Android system **Share** menu in **Google Photos, Samsung Gallery, Files by Google**, and any camera app.
- Selecting OneGlass immediately beams the photo or file to your computer's clipboard and `~/Downloads/OneGlass/` in less than a second.

---

### 4. iOS 1-Tap `POST /api/beam` (Apple Shortcuts & Action Button)

On iPhone and iPad:
- **Direct HTTP Beam Endpoint:** `POST http://<LAN_IP>:8484/api/beam` accepts raw binary streams, multipart form data, or JSON payloads.
- **Apple Shortcut / Action Button:** Create a 1-tap Apple Shortcut that takes the input photo from the iOS Share Sheet and posts it to `/api/beam`.
- Tap your iPhone 15/16 Pro **Action Button** while snapping a whiteboard or document: the photo lands directly in your Mac/PC clipboard ready for **`⌘V`** in Cursor or Figma!
- Non-developers can tap **"1-Tap OS Share Sheet"** in the QR Pairing Modal or Mobile Tools Sheet to view a 2-sentence guide and copy their pre-authenticated Beam Endpoint URL with 1 click.

---

### 5. 1-Tap Mobile Save / Share (`navigator.share({ files })`)

When cards land on a connected phone or tablet (or when tapping the **"Save / Share"** button on any card), OneGlass invokes the native mobile OS Share Sheet via `navigator.share({ files: [file], title: card.title })`.
- iPhone users can tap **"Save Image"** directly to add received photos straight to **Apple Photos**.
- Android users can tap **"Save to device"** or share directly into WhatsApp, Slack, or Google Drive in 1 tap, with an automatic browser download fallback.

---


## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          OneGlass Ecosystem                            │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │   Laptop Display Surface  │      │     Phone / Tablet Glass    │   │
│   │   - WebGL2 Liquid Canvas  │◄────►│   - 120Hz Touch Surface     │   │
│   │   - Calibrated Bezel Rail │ Web- │   - Continuity Camera Scan  │   │
│   │   - Screen Portal Host    │  RTC │   - Glass Trackpad & Laser  │   │
│   │   - Teleprompter Streamer │  UDP │   - Top-Notch Notch Dock    │   │
│   └─────────────┬─────────────┘      └──────────────┬──────────────┘   │
│                 │                                   │                  │
│                 ▼                                   ▼                  │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │               Node.js Local Continuity Server               │      │
│   │    - WebSocket Signaling Relay & Peer State Coordinator     │      │
│   │    - REST Media & Chunk Streaming Server (/api/upload)      │      │
│   │    - Real-Time JSON Stdin/Stdout Native Daemon Controller   │      │
│   └─────────────┬───────────────────────────────────┬───────────┘      │
│                 │                                   │                  │
│                 ▼                                   ▼                  │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │   AppleSPU Accelerometer  │      │  macOS OS Continuity Bridge │   │
│   │   (native/spu_bump.m)     │      │  (native/oneglass_os.m)     │   │
│   │   - 200Hz IOKit Stream    │      │  - NSStatusWindowLevel Strip│   │
│   │   - Seismic Jerk Filter   │      │  - Finder Drop Destination  │   │
│   │   - CGEvent Key Dampening │      │  - CGEvent Cursor Injection │   │
│   └───────────────────────────┘      └─────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Core Technologies & Deep Dive

### 1. 200Hz AppleSPU Accelerometer Bump Detection (`native/spu_bump.m`)

On Apple Silicon and Intel MacBooks, an internal `AppleSPU` Sensor Processing Unit samples the accelerometer at **200Hz**. While standard OS APIs hide this telemetry, OneGlass accesses the raw `IOKit` driver (`IOServiceGetMatchingServices` matching `AppleSPUHIDDevice`).

- **Seismic Jerk Computation:** Analyzes high-frequency jerk ($\vec{J} = \frac{d\vec{a}}{dt}$) over a sliding window. An exponential moving average (EMA) dynamic threshold isolates sharp physical taps from ambient table wobble.
- **Typing Suppression:** To prevent false positives while typing, the daemon monitors macOS keyboard input via `CoreGraphics` (`CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateCombinedSessionState, kCGEventKeyDown)`). If a key was pressed within 120ms, bump detection is dampened.
- **Harmonic Shockwave:** When a tap is detected, the server dispatches a `namedrop_wave` event. Both devices trigger a synchronized WebGL2 liquid-glass chromatic aberration shockwave and a 42Hz sub-bass resonant sine chime.

### 2. Native macOS System-Wide Continuity Bridge (`native/oneglass_os.m`)

OneGlass breaks out of the browser tab across the entire macOS operating system via a native Objective-C daemon:

- **Finder Screen-Edge Drop Destination:** A borderless, transparent `NSWindow` floats at `NSStatusWindowLevel + 1` across all virtual spaces (`NSWindowCollectionBehaviorCanJoinAllSpaces`). Registered as an `NSDraggingDestination` for `NSPasteboardTypeFileURL`, users can drag files directly from Finder, Desktop, or other apps onto the physical edge of their laptop screen to beam them to connected devices: even when the browser is minimized or hidden.
- **Dynamic Strip Reconfiguration (`set_strip`):** When the user calibrates their phone's position in the UI, `server.mjs` forwards `{"cmd":"set_strip","edge":edge,"centerRatio":centerRatio,"lengthMm":150}` to the daemon over stdin. The native strip window instantly repositions and resizes along the `top`, `right`, `bottom`, or `left` screen perimeter.
- **OS-Level Cursor & Click Injection:** The phone's Glass Trackpad transmits multi-touch delta telemetry. The daemon injects native hardware-level mouse events into the macOS window server using `CGWarpMouseCursorPosition` and `CGEventPost(kCGHIDEventTap, ...)` (`kCGEventMouseMoved`, `kCGEventLeftMouseDown`, `kCGEventLeftMouseUp`).
- **Full-Screen Keynote Laser & Edge Glow:** A secondary click-through window (`ignoresMouseEvents = YES`) at `NSStatusWindowLevel + 2` paints a presentation laser dot and edge glow pulses anywhere on macOS.
- **Bidirectional Clipboard Bridge:** Automatically mirrors `NSPasteboard.generalPasteboard` to connected phones and writes incoming text snippets back into the system clipboard.

### 3. WebGL2 Liquid-Glass Fluid Dynamics & Bezel-Crossing Physics

- **Physical Millimeter Coordinate Mapping:** OneGlass normalizes screen space using device pixel ratios (`dpr`) and physical millimeter dimensions rather than arbitrary CSS pixels. A 100mm card on a laptop appears as a 100mm card on an adjacent phone.
- **Live Bezel Crossing:** As an item is dragged toward the calibrated edge, its geometry is partitioned in real time. The trailing slice stays on the source device while the leading slice emerges from the corresponding edge of the target device at 60–120fps.
- **Momentum Projection (`appleProject`):** Card flick release velocities are projected using Apple's exponential decay curve ($v \times e^{-k \cdot t}$, $k \approx 0.992$). Flicking a card across the bezel shoots it onto the target screen with realistic inertia and bounce.
- **Targeted vs. Broadcast Routing:** Each connected device mounts its own independent bezel strip along the screen perimeter. Dragging a card across `iPhone #1`'s strip delivers solely to `iPhone #1`. Selecting **`Overlap All`** merges strips so a single flick broadcasts to all connected displays simultaneously.

### 4. WebRTC DataChannels (`webrtc-p2p.js`)

Connected screens try to negotiate a direct WebRTC connection over the local network (signalled through `server.mjs`) and open two `RTCDataChannel`s:

- **`fast-telemetry` (Unordered, `maxRetransmits: 0`):** Ultra-low latency channel for 120Hz trackpad multi-touch gestures, keynote laser coordinates, and motion telemetry. Late packets are dropped rather than stalled by head-of-line blocking.
- **`reliable-continuity` (Ordered, Reliable):** Ordered channel for app messages that need delivery. File transfer and clipboard sync do not use it yet; they go through the WebSocket relay.
- **WebSocket relay fallback:** If no direct link forms (strict NAT, firewall, AP isolation), every message goes through the WebSocket relay in `server.mjs`.
- **Honest telemetry:** The P2P inspector shows ICE state, RTT and the candidate protocol (UDP or TCP) as measured by `getStats()`, and `--` when nothing has been measured. The optional loopback benchmark is labelled as this device only and never counts as a peer.

---

## Spatial Display Modes

| Mode | Shortcut | Description |
| :--- | :---: | :--- |
| **Standard Canvas** | `1` | Floating interactive cards, live bezel strips, and liquid-glass physics playground. |
| **Top-Notch Teleprompter** | `2` | Docks phone above laptop webcam; streams synced eye-line teleprompter script. |
| **Panoramic Multi-Screen Wall** | `3` | Multi-screen procedural shader wall and bezel-spanning sketch canvas. |
| **Continuum Synth** | `4` | Dual-screen touch audio synthesizer with polyphonic spatial filter controls. |
| **Screen Portal** | `P` | Wireless second display: crops and streams any window/region of your desktop to phone. |
| **Camera Scanner** | `S` | Perspective document and whiteboard scanner with 1-tap beam to laptop. |
| **Glass Trackpad** | `T` | Multi-touch wireless trackpad and keynote laser pointer for macOS. |

---

## Keyboard Shortcuts

Press **`⌘K`** (macOS) or **`Ctrl+K`** (Windows/Linux) anywhere in the desktop app to open the Linear-style command palette.

| Shortcut | Action |
| :--- | :--- |
| **`⌘K`** / **`Ctrl+K`** | Open / close Command Palette |
| **`⌘V`** / **`Ctrl+V`** | Paste clipboard text or image into a new floating card |
| **`1`** | Switch to Standard Canvas mode |
| **`2`** | Switch to Top-Notch Teleprompter mode |
| **`3`** | Switch to Panoramic Video Wall mode |
| **`4`** | Switch to Continuum Spatial Synth mode |
| **`Space`** | Play / pause teleprompter scrolling |
| **`Esc`** | Close open modal, history drawer, or command bar |


---

## Multi-Network Discovery & AP-Isolation Bypass

OneGlass eliminates corporate and hotel Wi-Fi restrictions with automatic multi-network topology discovery:

1. **Primary LAN Wi-Fi:** Direct connection via local subnet IP (e.g. `192.168.x.x` or `10.x.x.x`).
2. **Zero-Config mDNS Bonjour (`.local`):** Auto-resolves using your machine's hostname (e.g. `http://MacBook-Pro.local:8484`) across Apple and Android devices without typing raw IP addresses.
3. **Tailscale & WireGuard Mesh (Bypass AP Isolation):** If Tailscale is active (any `100.x.y.z` interface), OneGlass detects the encrypted mesh route. When hotel or enterprise Wi-Fi has strict AP client isolation enabled, scanning the Tailscale QR pill connects instantly through the private mesh.
4. **Public Tunnel Relay (`--tunnel`):** Pass `--tunnel <url>` or set `ONEGLASS_TUNNEL_URL` to route over secure tunnels for remote pairing.
5. **Interactive QR Switcher:** The desktop pairing modal features sleek endpoint switcher pills (`Wi-Fi LAN` · `mDNS .local` · `Tailscale Mesh` · `Tunnel`) that update the QR code and pairing URL on click.

---

## Cross-Platform Host OS Clipboard Bridge

Bidirectional host OS clipboard synchronization works out-of-the-box across **macOS, Linux, and Windows** with zero external npm dependencies:

- **macOS:** Native `pbcopy` and `pbpaste` integration (or `oneglass_os` NSStatusWindow pasteboard observer when `--native` is active).
- **Linux:** Automatic Wayland (`wl-copy` / `wl-paste`) detection with graceful fallback to X11 (`xclip` / `xsel`).
- **Windows:** High-speed `clip.exe` stdin pipe with `powershell Get-Clipboard / Set-Clipboard` integration.
- **Bidirectional Sync:** Copy text on your phone and it appears immediately in your desktop OS clipboard; copy text on your laptop and paired phones update in real time.

---

## iOS & Android Background Lifecycle Resilience & Instant Auto-Resume

Mobile web browsers typically throttle background timers, WebSockets, and WebRTC after screen dimming or tab switching. OneGlass overcomes mobile browser sleep restrictions through a four-part resilience engine:

1. **Inaudible WebAudio Keep-Alive:** On first interaction, OneGlass launches an inaudible sub-bass oscillator (`gain = 0.00001`, 32Hz sine). On iOS Safari and Android Chrome, an active audio graph prevents the operating system from suspending WebRTC ICE threads, WebSocket heartbeats, and high-frequency JS execution.
2. **Screen WakeLock:** Requests `navigator.wakeLock.request('screen')` to keep phone screens illuminated while docked at the laptop bezel.
3. **Session State Persistence (`oneglass_session_state`):** Active session cards, calibrated screen edge (`currentEdge`, `centerRatio`), and pending transfer queues are persisted to `localStorage` / `IndexedDB`.
4. **Instant `<50ms` Auto-Resume:** Listens for `visibilitychange`, `pageshow`, and `focus`. The instant the mobile browser returns to the foreground, OneGlass immediately re-establishes the WebSocket connection within `<50ms`, re-syncs calibrated bezel strips, restores active cards without reloading the page, and flushes any queued outgoing clips.
5. **Offline PWA Shell Cache (`sw.js`):** Service worker pre-caches core application assets for instant startup even on flaky or offline Wi-Fi.

---

## 120Hz Kinematic Kalman Filter & Auto-Edge Sonar

- **Zero-Jitter Kinematic Kalman Filter:** When receiving `drag_stream` packets from paired devices for `#incoming-ghost-card`, OneGlass feeds millimeter penetration and contact ratio measurements into a 1D/2D Kinematic Kalman filter (`kalmanPredictAndUpdate`). A critically-damped dead-reckoning loop steps every `requestAnimationFrame` at 120Hz, ensuring phantom cards slide across the bezel with buttery-smooth motion even under Wi-Fi packet jitter.
- **Acoustic Stereo Sonar & 1-Flick Auto-Edge Locator:** Tap **"Auto-Detect Edge (Stereo Sonar / Gyro)"** inside the Edge Alignment sheet to trigger a spatial WebAudio chirp (`StereoPannerNode` left/right pan) and orientation compass reading to auto-align the bezel strip. Alternatively, flicking any card off the edge of your phone automatically calibrates the laptop bezel strip to the corresponding opposite edge (`flick top of phone -> phone docked at bottom of laptop`, `flick left of phone -> phone docked at right of laptop`) with zero manual configuration.

---

## Platform Scope & Native Opt-In

- **Pure Zero-Dependency Web Engine:** The cross-bezel card flicking, LAN file/clipboard transfer, 4-corner Camera Document Scanner, Screen Portal, Teleprompter, and Cross-Platform OS Clipboard work out-of-the-box in any modern browser across **iOS, Android, macOS, Windows, and Linux**.
- **Strictly Opt-In Native Daemons (`--native`):** The 200Hz `AppleSPU` accelerometer tap (`native/spu_bump.m`) and system-wide Finder drop strip / OS cursor injection (`native/oneglass_os.m`) are strictly opt-in (`node bin/oneglass.mjs --native` or toggled in the UI) and macOS-only, ensuring background runs never touch your desktop uninvited.

---

## Network & REST API Reference

The OneGlass Node.js daemon exposes lightweight REST endpoints alongside its WebSocket coordinator:

- **`GET /api/status`:** Returns server diagnostic JSON for pairing and health inspection:
  ```json
  {
    "ok": true,
    "peersCount": 2,
    "phonesCount": 1,
    "laptopsCount": 1,
    "spuActive": true,
    "nativeBridgeActive": true,
    "lanIp": "192.168.1.105",
    "port": 8484,
    "sharedFilesCount": 6
  }
  ```
- **`GET /api/info`:** Detailed bootstrap payload including LAN IP, phone pairing URL, base64 QR SVG, and recent shared items.
- **`POST /api/upload` (or `POST /upload`):** Streams file binary into `shared/` (and automatically saves to `~/Downloads/OneGlass/` on macOS). Enforces a 250MB limit with immediate stream abort and `413 Payload Too Large` error handling.
- **`GET /shared/:filename`:** Serves uploaded files with byte-range streaming (`Accept-Ranges: bytes`) and inline preview headers.

---

## Zero-Native Fallback & Optional macOS Compilation

OneGlass works **100% out-of-the-box in pure Node.js and web browsers** on macOS, Windows, Linux, iOS, and Android without compiling any native binaries.

The optional macOS helpers in `native/` are built from source (they are not shipped as binaries):

```bash
# Compile AppleSPU 200Hz accelerometer helper:
clang -O3 -framework IOKit -framework CoreFoundation -framework ApplicationServices \
  native/spu_bump.m -o native/spu_bump

# Compile OS-wide Finder bezel strip & cursor injector:
clang -O3 -framework Cocoa -framework QuartzCore -framework ApplicationServices \
  native/oneglass_os.m -o native/oneglass_os
```

*(Grant Accessibility permissions in macOS System Settings > Privacy & Security > Accessibility if using the Glass Trackpad OS cursor injection).*

---

## License

MIT © 2026 Anzal Abidi. See [LICENSE](LICENSE).
