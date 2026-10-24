/**
 * OneGlass — Continuity Camera Document, Whiteboard & Desk-View Scanner
 * Standalone browser ES module with zero external dependencies.
 *
 * Design Engineering (Linear `linear.app` + Emil Kowalski Standards):
 *  - Zero emojis anywhere; all icons are crisp 14x14 (`stroke="currentColor" stroke-width="1.5" fill="none"`) SVGs
 *  - Obsidian chrome (`#0b0c0e`), `1px solid rgba(255,255,255,0.08)` borders, tabular numerals
 *  - No `transition: all`; explicit property transitions with `cubic-bezier(0.23, 1, 0.32, 1)`
 *  - Tactile press physics `:active { transform: scale(0.97) }`
 */

const SCANNER_STYLE_ID = 'oneglass-camera-scanner-styles';
const SCANNER_MODAL_ID = 'oneglass-camera-scanner-modal';

const ICONS = {
  camera: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.75 4.25h2l1-1.5h4.5l1 1.5h2a1 1 0 0 1 1 1v5.75a1 1 0 0 1-1 1H1.75a1 1 0 0 1-1-1V5.25a1 1 0 0 1 1-1Z"/><circle cx="7" cy="7.75" r="2.1"/></svg>`,
  upload: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9.5V2.25M4.25 4.75 7 2l2.75 2.75"/><path d="M2 9.75v1.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1.5"/></svg>`,
  quad: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="2.75" cy="3" r="1.25"/><circle cx="11.25" cy="2.5" r="1.25"/><circle cx="11.5" cy="11.25" r="1.25"/><circle cx="2.5" cy="11" r="1.25"/><path d="M4 2.9 10 2.6M11.3 3.75l.15 6.25M10.25 11.2l-6.5-.15M2.6 9.75 2.7 4.25"/></svg>`,
  docBw: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.25" y="1.75" width="9.5" height="10.5" rx="1.25"/><path d="M4.5 4.75h5M4.5 7.25h5M4.5 9.75h3.25"/></svg>`,
  whiteboard: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="2.25" width="11" height="8.5" rx="1.25"/><path d="M3.75 7.75 5.75 5l2 2 2.5-3"/><path d="M4.5 12.25h5"/></svg>`,
  trueColor: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.5" cy="5.75" r="2.75"/><circle cx="8.5" cy="5.75" r="2.75"/><circle cx="7" cy="8.5" r="2.75"/></svg>`,
  beam: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11.75V2.5M3.5 6 7 2.25 10.5 6"/><path d="M2.25 1.75h9.5"/></svg>`,
  close: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 3.5 7 7M10.5 3.5l-7 7"/></svg>`,
  reset: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 7a4.75 4.75 0 1 1 1.2 3.15"/><path d="M2.25 3.25V7h3.75"/></svg>`,
  shutter: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="5.25"/><circle cx="7" cy="7" r="2.5"/></svg>`,
  flip: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 4.25H3.75L5.75 2.25M3.5 9.75h6.75l-2 2"/></svg>`,
  sample: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.75" y="2" width="10.5" height="10" rx="1.5"/><path d="M4.25 5h5.5M4.25 7.5h3.5M4.25 9.75h4.5"/></svg>`,
  download: `<svg class="cs-svg-icon" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2.25v6.5M4.5 6.5 7 9l2.5-2.5M2.5 11.5h9"/></svg>`,
};

const FILTER_MODES = [
  {
    id: 'doc_bw',
    label: 'Document B&W',
    shortDesc: 'Adaptive local threshold',
    icon: ICONS.docBw,
  },
  {
    id: 'whiteboard_glow',
    label: 'Whiteboard Glow',
    shortDesc: 'Dark-mode neon ink boost',
    icon: ICONS.whiteboard,
  },
  {
    id: 'true_color',
    label: 'True Color Deskew',
    shortDesc: 'Homography bilinear warp',
    icon: ICONS.trueColor,
  },
];

let activeScannerController = null;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Solves an 8x8 linear system A * h = b via Gaussian elimination with partial pivoting
 * to compute the 3x3 projective homography matrix H mapping destination (u, v) in
 * [0, dstW] x [0, dstH] to source quad corners [(x0,y0), (x1,y1), (x2,y2), (x3,y3)].
 */
function computeHomographyDestToSrc(dstW, dstH, quad) {
  const srcPts = [
    [quad.TL.x, quad.TL.y],
    [quad.TR.x, quad.TR.y],
    [quad.BR.x, quad.BR.y],
    [quad.BL.x, quad.BL.y],
  ];
  const dstPts = [
    [0, 0],
    [dstW, 0],
    [dstW, dstH],
    [0, dstH],
  ];

  const A = new Array(8);
  const b = new Float64Array(8);

  for (let i = 0; i < 4; i++) {
    const u = dstPts[i][0];
    const v = dstPts[i][1];
    const x = srcPts[i][0];
    const y = srcPts[i][1];

    A[i * 2] = Float64Array.from([u, v, 1, 0, 0, 0, -u * x, -v * x]);
    b[i * 2] = x;

    A[i * 2 + 1] = Float64Array.from([0, 0, 0, u, v, 1, -u * y, -v * y]);
    b[i * 2 + 1] = y;
  }

  for (let col = 0; col < 8; col++) {
    let pivotRow = col;
    let maxVal = Math.abs(A[col][col]);
    for (let row = col + 1; row < 8; row++) {
      const val = Math.abs(A[row][col]);
      if (val > maxVal) {
        maxVal = val;
        pivotRow = row;
      }
    }

    if (maxVal < 1e-11) {
      return Float64Array.from([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    if (pivotRow !== col) {
      const tmpRow = A[col];
      A[col] = A[pivotRow];
      A[pivotRow] = tmpRow;
      const tmpB = b[col];
      b[col] = b[pivotRow];
      b[pivotRow] = tmpB;
    }

    const pivot = A[col][col];
    for (let j = col; j < 8; j++) {
      A[col][j] /= pivot;
    }
    b[col] /= pivot;

    for (let row = 0; row < 8; row++) {
      if (row === col) continue;
      const factor = A[row][col];
      if (Math.abs(factor) < 1e-12) continue;
      for (let j = col; j < 8; j++) {
        A[row][j] -= factor * A[col][j];
      }
      b[row] -= factor * b[col];
    }
  }

  return Float64Array.from([b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], 1.0]);
}

/**
 * Performs perspective-corrected homography warp with bilinear pixel interpolation
 * and applies one of the 3 scan filters:
 *  - `doc_bw`: Integral-image adaptive local threshold document cleaner
 *  - `whiteboard_glow`: Dark-mode inversion + background normalization + neon ink boost
 *  - `true_color`: Bilinear perspective-corrected true color with subtle micro-contrast
 */
function warpAndFilterCanvas(srcImageData, quadNorm, dstW, dstH, filterId) {
  const srcW = srcImageData.width;
  const srcH = srcImageData.height;
  const srcData = srcImageData.data;

  const quadPx = {
    TL: { x: quadNorm.TL.x * (srcW - 1), y: quadNorm.TL.y * (srcH - 1) },
    TR: { x: quadNorm.TR.x * (srcW - 1), y: quadNorm.TR.y * (srcH - 1) },
    BR: { x: quadNorm.BR.x * (srcW - 1), y: quadNorm.BR.y * (srcH - 1) },
    BL: { x: quadNorm.BL.x * (srcW - 1), y: quadNorm.BL.y * (srcH - 1) },
  };

  const H = computeHomographyDestToSrc(dstW, dstH, quadPx);
  const h00 = H[0], h01 = H[1], h02 = H[2];
  const h10 = H[3], h11 = H[4], h12 = H[5];
  const h20 = H[6], h21 = H[7];

  const pixelCount = dstW * dstH;
  const warpedRGB = new Uint8ClampedArray(pixelCount * 4);
  const lum = new Float32Array(pixelCount);

  const maxSrcX = srcW - 1;
  const maxSrcY = srcH - 1;

  for (let v = 0; v < dstH; v++) {
    const rowOffset = v * dstW;
    const numXBase = h01 * v + h02;
    const numYBase = h11 * v + h12;
    const denBase = h21 * v + 1.0;

    for (let u = 0; u < dstW; u++) {
      const w = h20 * u + denBase;
      const invW = Math.abs(w) > 1e-8 ? 1.0 / w : 1.0;
      const sx = clamp((h00 * u + numXBase) * invW, 0, maxSrcX);
      const sy = clamp((h10 * u + numYBase) * invW, 0, maxSrcY);

      const x0 = sx | 0;
      const y0 = sy | 0;
      const x1 = x0 < maxSrcX ? x0 + 1 : x0;
      const y1 = y0 < maxSrcY ? y0 + 1 : y0;
      const fx = sx - x0;
      const fy = sy - y0;
      const invFx = 1.0 - fx;
      const invFy = 1.0 - fy;

      const w00 = invFx * invFy;
      const w10 = fx * invFy;
      const w01 = invFx * fy;
      const w11 = fx * fy;

      const idx00 = (y0 * srcW + x0) * 4;
      const idx10 = (y0 * srcW + x1) * 4;
      const idx01 = (y1 * srcW + x0) * 4;
      const idx11 = (y1 * srcW + x1) * 4;

      const r = srcData[idx00] * w00 + srcData[idx10] * w10 + srcData[idx01] * w01 + srcData[idx11] * w11;
      const g = srcData[idx00 + 1] * w00 + srcData[idx10 + 1] * w10 + srcData[idx01 + 1] * w01 + srcData[idx11 + 1] * w11;
      const b = srcData[idx00 + 2] * w00 + srcData[idx10 + 2] * w10 + srcData[idx01 + 2] * w01 + srcData[idx11 + 2] * w11;

      const pIdx = rowOffset + u;
      const outIdx = pIdx * 4;
      warpedRGB[outIdx] = r;
      warpedRGB[outIdx + 1] = g;
      warpedRGB[outIdx + 2] = b;
      warpedRGB[outIdx + 3] = 255;

      lum[pIdx] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
  }

  if (filterId === 'true_color') {
    for (let i = 0; i < pixelCount * 4; i += 4) {
      warpedRGB[i] = clamp((warpedRGB[i] - 128) * 1.08 + 128, 0, 255);
      warpedRGB[i + 1] = clamp((warpedRGB[i + 1] - 128) * 1.08 + 128, 0, 255);
      warpedRGB[i + 2] = clamp((warpedRGB[i + 2] - 128) * 1.08 + 128, 0, 255);
    }
    return new ImageData(warpedRGB, dstW, dstH);
  }

  // Build 2D Integral Image over luminance for O(1) local window illumination estimation
  const stride = dstW + 1;
  const integral = new Float64Array((dstW + 1) * (dstH + 1));

  for (let y = 1; y <= dstH; y++) {
    let rowSum = 0;
    const srcRow = (y - 1) * dstW;
    const intRow = y * stride;
    const prevIntRow = (y - 1) * stride;
    for (let x = 1; x <= dstW; x++) {
      rowSum += lum[srcRow + (x - 1)];
      integral[intRow + x] = integral[prevIntRow + x] + rowSum;
    }
  }

  const winRadius = Math.max(10, Math.round(Math.min(dstW, dstH) / 26));

  if (filterId === 'doc_bw') {
    const out = new Uint8ClampedArray(pixelCount * 4);
    const bias = 8.5;

    for (let y = 0; y < dstH; y++) {
      const y0 = Math.max(0, y - winRadius);
      const y1 = Math.min(dstH - 1, y + winRadius);
      const r0 = y0 * stride;
      const r1 = (y1 + 1) * stride;
      const rowOffset = y * dstW;

      for (let x = 0; x < dstW; x++) {
        const x0 = Math.max(0, x - winRadius);
        const x1 = Math.min(dstW - 1, x + winRadius);
        const area = (x1 - x0 + 1) * (y1 - y0 + 1);
        const sum = integral[r1 + (x1 + 1)] - integral[r0 + (x1 + 1)] - integral[r1 + x0] + integral[r0 + x0];
        const localMean = sum / area;

        const pIdx = rowOffset + x;
        const val = lum[pIdx];
        const diff = val - (localMean - bias);

        let clean;
        if (diff >= 4) {
          clean = 252;
        } else if (diff <= -14) {
          clean = 12;
        } else {
          const t = (diff + 14) / 18;
          clean = Math.round(12 + t * t * (3 - 2 * t) * 240);
        }

        const oIdx = pIdx * 4;
        out[oIdx] = clean;
        out[oIdx + 1] = clean;
        out[oIdx + 2] = Math.min(255, clean + 2);
        out[oIdx + 3] = 255;
      }
    }
    return new ImageData(out, dstW, dstH);
  }

  // `whiteboard_glow`: Dark-mode inversion + uneven lighting removal + neon ink enhancement
  const out = new Uint8ClampedArray(pixelCount * 4);
  const inkMap = new Float32Array(pixelCount);

  for (let y = 0; y < dstH; y++) {
    const y0 = Math.max(0, y - winRadius);
    const y1 = Math.min(dstH - 1, y + winRadius);
    const r0 = y0 * stride;
    const r1 = (y1 + 1) * stride;
    const rowOffset = y * dstW;

    for (let x = 0; x < dstW; x++) {
      const x0 = Math.max(0, x - winRadius);
      const x1 = Math.min(dstW - 1, x + winRadius);
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      const sum = integral[r1 + (x1 + 1)] - integral[r0 + (x1 + 1)] - integral[r1 + x0] + integral[r0 + x0];
      const localBg = Math.max(35, sum / area);

      const pIdx = rowOffset + x;
      const oIdx = pIdx * 4;
      const r = warpedRGB[oIdx];
      const g = warpedRGB[oIdx + 1];
      const b = warpedRGB[oIdx + 2];
      const l = lum[pIdx];

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const chroma = maxC - minC;

      const darknessVsBg = Math.max(0, (localBg - l - 5) / Math.max(28, localBg * 0.42));
      const lightnessVsDarkBg = localBg < 90 ? Math.max(0, (l - localBg - 6) / 55) : 0;
      const chromaBoost = Math.max(0, (chroma - 14) / 70);

      const rawInk = clamp(Math.max(darknessVsBg, lightnessVsDarkBg) + chromaBoost * 0.65, 0, 1);
      const ink = rawInk < 0.08 ? 0 : Math.pow(rawInk, 0.82);
      inkMap[pIdx] = ink;

      // Base Linear obsidian dark canvas (#0b0c0e)
      const bgR = 11;
      const bgG = 12;
      const bgB = 15;

      if (ink <= 0.001) {
        out[oIdx] = bgR;
        out[oIdx + 1] = bgG;
        out[oIdx + 2] = bgB;
        out[oIdx + 3] = 255;
        continue;
      }

      let neonR = 226;
      let neonG = 238;
      let neonB = 255;

      if (chroma > 18 && maxC > 10) {
        const normR = (r - minC) / chroma;
        const normG = (g - minC) / chroma;
        const normB = (b - minC) / chroma;
        neonR = clamp(Math.round(70 + normR * 185), 56, 255);
        neonG = clamp(Math.round(78 + normG * 177), 64, 255);
        neonB = clamp(Math.round(92 + normB * 163), 80, 255);
      } else {
        neonR = 186;
        neonG = 224;
        neonB = 255;
      }

      const glow = Math.min(1, ink * 1.18);
      out[oIdx] = Math.round(bgR + (neonR - bgR) * glow);
      out[oIdx + 1] = Math.round(bgG + (neonG - bgG) * glow);
      out[oIdx + 2] = Math.round(bgB + (neonB - bgB) * glow);
      out[oIdx + 3] = 255;
    }
  }

  // Subtle 3x3 neon bloom around high-contrast strokes
  for (let y = 1; y < dstH - 1; y++) {
    const rowOffset = y * dstW;
    for (let x = 1; x < dstW - 1; x++) {
      const pIdx = rowOffset + x;
      if (inkMap[pIdx] > 0.45) continue;
      const neighborInk =
        Math.max(
          inkMap[pIdx - 1],
          inkMap[pIdx + 1],
          inkMap[pIdx - dstW],
          inkMap[pIdx + dstW],
        ) * 0.28;
      if (neighborInk > 0.08) {
        const oIdx = pIdx * 4;
        out[oIdx] = Math.min(255, out[oIdx] + Math.round(56 * neighborInk));
        out[oIdx + 1] = Math.min(255, out[oIdx + 1] + Math.round(145 * neighborInk));
        out[oIdx + 2] = Math.min(255, out[oIdx + 2] + Math.round(235 * neighborInk));
      }
    }
  }

  return new ImageData(out, dstW, dstH);
}

/**
 * Generates a realistic perspective-skewed whiteboard & architecture spec sheet
 * on a canvas so the 4-corner deskew quad and 3 scan filters can be inspected
 * immediately even before capturing from a camera or file input.
 */
function renderSampleDeskScene(canvas, mode = 'whiteboard') {
  const w = 960;
  const h = 680;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const deskGrad = ctx.createLinearGradient(0, 0, w, h);
  deskGrad.addColorStop(0, '#14161c');
  deskGrad.addColorStop(1, '#0c0d12');
  ctx.fillStyle = deskGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const docW = 720;
  const docH = 500;
  const docCanvas = document.createElement('canvas');
  docCanvas.width = docW;
  docCanvas.height = docH;
  const dctx = docCanvas.getContext('2d');

  const sheetGrad = dctx.createLinearGradient(0, 0, docW, docH);
  if (mode === 'document') {
    sheetGrad.addColorStop(0, '#f6f7f9');
    sheetGrad.addColorStop(0.55, '#eaedf3');
    sheetGrad.addColorStop(1, '#d5dae4');
  } else {
    sheetGrad.addColorStop(0, '#f4f6fa');
    sheetGrad.addColorStop(0.6, '#e6eaf2');
    sheetGrad.addColorStop(1, '#d2d8e4');
  }
  dctx.fillStyle = sheetGrad;
  dctx.fillRect(0, 0, docW, docH);

  dctx.strokeStyle = '#9aa3b2';
  dctx.lineWidth = 2;
  dctx.strokeRect(18, 18, docW - 36, docH - 36);

  dctx.fillStyle = '#14171f';
  dctx.font = '600 21px "Inter", -apple-system, sans-serif';
  dctx.fillText('ONEGLASS SAMPLE PAGE', 42, 62);

  dctx.fillStyle = '#4b5366';
  dctx.font = '500 13px "SF Mono", Menlo, monospace';
  dctx.fillText('DOC-ID: OG-SCAN-8484   |   HOMOGRAPHY 8-DOF   |   120HZ BEZEL BRIDGE', 42, 88);

  dctx.strokeStyle = '#c4cbd8';
  dctx.lineWidth = 1.5;
  dctx.beginPath();
  dctx.moveTo(42, 104);
  dctx.lineTo(docW - 42, 104);
  dctx.stroke();

  const nodes = [
    { x: 46, y: 132, w: 184, h: 92, stroke: '#1d4ed8', title: 'iOS Continuity Cam', sub: 'getUserMedia / Capture' },
    { x: 268, y: 132, w: 184, h: 92, stroke: '#0284c7', title: '4-Corner Homography', sub: 'Bilinear Warp + Integral' },
    { x: 490, y: 132, w: 184, h: 92, stroke: '#059669', title: 'MacBook Bezel Portal', sub: 'card_flick WS Stream' },
  ];

  nodes.forEach((n, idx) => {
    dctx.strokeStyle = n.stroke;
    dctx.lineWidth = 3;
    dctx.strokeRect(n.x, n.y, n.w, n.h);

    dctx.fillStyle = '#11141c';
    dctx.font = '600 15px "Inter", -apple-system, sans-serif';
    dctx.fillText(n.title, n.x + 14, n.y + 38);

    dctx.fillStyle = n.stroke;
    dctx.font = '500 12px "SF Mono", Menlo, monospace';
    dctx.fillText(n.sub, n.x + 14, n.y + 64);

    if (idx < nodes.length - 1) {
      const ax0 = n.x + n.w + 4;
      const ax1 = nodes[idx + 1].x - 6;
      const ay = n.y + n.h / 2;
      dctx.strokeStyle = '#dc2626';
      dctx.lineWidth = 2.8;
      dctx.beginPath();
      dctx.moveTo(ax0, ay);
      dctx.lineTo(ax1, ay);
      dctx.lineTo(ax1 - 8, ay - 6);
      dctx.moveTo(ax1, ay);
      dctx.lineTo(ax1 - 8, ay + 6);
      dctx.stroke();
    }
  });

  dctx.fillStyle = '#161922';
  dctx.font = '600 15px "Inter", -apple-system, sans-serif';
  dctx.fillText('Perspective Rectification & Adaptive Threshold Notes:', 46, 268);

  const lines = [
    '1. Projective transform H maps [0,W]x[0,H] -> Quad(TL, TR, BR, BL) via 8x8 Gaussian pivot.',
    '2. Document B&W computes 2D Integral Image I(x,y) for O(1) local mean thresholding.',
    '3. Whiteboard Glow normalizes ambient shadow and boosts marker chrominance on #0b0c0e.',
    '4. 1-Tap Beam encodes PNG Blob -> POST /api/upload -> spawns card + sends card_flick.',
  ];
  dctx.font = '500 13.5px "Inter", -apple-system, sans-serif';
  dctx.fillStyle = '#222734';
  lines.forEach((line, i) => {
    dctx.fillText(line, 52, 298 + i * 28);
  });

  dctx.strokeStyle = '#7c3aed';
  dctx.lineWidth = 3.2;
  dctx.beginPath();
  dctx.moveTo(48, 434);
  dctx.bezierCurveTo(150, 412, 240, 456, 360, 428);
  dctx.stroke();

  dctx.fillStyle = '#0f172a';
  dctx.font = '600 12.5px "SF Mono", Menlo, monospace';
  dctx.fillText('STATUS: CALIBRATED // LATENCY < 4.2MS', 410, 436);

  const quad = {
    TL: { x: 0.13, y: 0.14 },
    TR: { x: 0.86, y: 0.09 },
    BR: { x: 0.91, y: 0.87 },
    BL: { x: 0.08, y: 0.83 },
  };

  const dstImg = ctx.getImageData(0, 0, w, h);
  const srcImg = dctx.getImageData(0, 0, docW, docH);
  const qPx = {
    TL: { x: quad.TL.x * w, y: quad.TL.y * h },
    TR: { x: quad.TR.x * w, y: quad.TR.y * h },
    BR: { x: quad.BR.x * w, y: quad.BR.y * h },
    BL: { x: quad.BL.x * w, y: quad.BL.y * h },
  };

  const HSceneToDoc = computeHomographyDestToSrc(docW, docH, qPx);
  const m = HSceneToDoc;
  const det =
    m[0] * (m[4] * m[8] - m[5] * m[7]) -
    m[1] * (m[3] * m[8] - m[5] * m[6]) +
    m[2] * (m[3] * m[7] - m[4] * m[6]);

  if (Math.abs(det) > 1e-12) {
    const invDet = 1.0 / det;
    const i00 = (m[4] * m[8] - m[5] * m[7]) * invDet;
    const i01 = (m[2] * m[7] - m[1] * m[8]) * invDet;
    const i02 = (m[1] * m[5] - m[2] * m[4]) * invDet;
    const i10 = (m[5] * m[6] - m[3] * m[8]) * invDet;
    const i11 = (m[0] * m[8] - m[2] * m[6]) * invDet;
    const i12 = (m[2] * m[3] - m[0] * m[5]) * invDet;
    const i20 = (m[3] * m[7] - m[4] * m[6]) * invDet;
    const i21 = (m[1] * m[6] - m[0] * m[7]) * invDet;
    const i22 = (m[0] * m[4] - m[1] * m[3]) * invDet;

    const dData = dstImg.data;
    const sData = srcImg.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const denom = i20 * x + i21 * y + i22;
        if (Math.abs(denom) < 1e-8) continue;
        const u = (i00 * x + i01 * y + i02) / denom;
        const v = (i10 * x + i11 * y + i12) / denom;
        if (u >= 0 && u < docW - 1 && v >= 0 && v < docH - 1) {
          const u0 = u | 0;
          const v0 = v | 0;
          const sIdx = (v0 * docW + u0) * 4;
          const dIdx = (y * w + x) * 4;
          dData[dIdx] = sData[sIdx];
          dData[dIdx + 1] = sData[sIdx + 1];
          dData[dIdx + 2] = sData[sIdx + 2];
          dData[dIdx + 3] = 255;
        }
      }
    }
    ctx.putImageData(dstImg, 0, 0);
  }

  return quad;
}

function injectScannerStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SCANNER_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = SCANNER_STYLE_ID;
  style.textContent = `
    :root {
      --cs-ease: cubic-bezier(0.23, 1, 0.32, 1);
      --cs-bg: #0b0c0e;
      --cs-panel: rgba(14, 15, 19, 0.94);
      --cs-elevated: rgba(20, 22, 28, 0.96);
      --cs-border: rgba(255, 255, 255, 0.08);
      --cs-border-hi: rgba(255, 255, 255, 0.16);
      --cs-ink: #f2f3f5;
      --cs-muted: #8a8f98;
      --cs-indigo: #5e6ad2;
      --cs-cyan: #38bdf8;
      --cs-emerald: #2cc990;
    }

    .cs-svg-icon {
      width: 14px;
      height: 14px;
      stroke: currentColor;
      stroke-width: 1.5;
      fill: none;
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
    }

    #${SCANNER_MODAL_ID} {
      position: fixed;
      inset: 0;
      z-index: 80;
      background: rgba(6, 7, 9, 0.82);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding:
        max(12px, env(safe-area-inset-top, 12px))
        max(12px, env(safe-area-inset-right, 12px))
        max(12px, env(safe-area-inset-bottom, 12px))
        max(12px, env(safe-area-inset-left, 12px));
      opacity: 0;
      pointer-events: none;
      transition: opacity 220ms var(--cs-ease);
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      color: var(--cs-ink);
      letter-spacing: -0.011em;
      font-variant-numeric: tabular-nums;
    }

    #${SCANNER_MODAL_ID}.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    .cs-shell {
      width: min(1080px, 100%);
      height: min(760px, 100%);
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        0 32px 80px rgba(0, 0, 0, 0.82);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translate3d(0, 12px, 0) scale(0.98);
      transition: transform 240ms var(--cs-ease), opacity 220ms var(--cs-ease);
    }

    #${SCANNER_MODAL_ID}.is-open .cs-shell {
      transform: translate3d(0, 0, 0) scale(1);
    }

    .cs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 14px;
      background: #0b0c0e;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
    }

    .cs-brand {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
    }

    .cs-badge-icon {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      background: rgba(94, 106, 210, 0.16);
      border: 1px solid rgba(94, 106, 210, 0.42);
      color: #dfe2ff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cs-title-wrap {
      min-width: 0;
    }

    .cs-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--cs-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cs-subtitle {
      font-size: 11.5px;
      color: var(--cs-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cs-source-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .cs-btn {
      appearance: none;
      -webkit-appearance: none;
      background: #0b0c0e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
      color: var(--cs-ink);
      font: 500 12px/1.2 "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      letter-spacing: -0.01em;
      padding: 6.5px 10px;
      border-radius: 7px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
      transition:
        transform 150ms var(--cs-ease),
        border-color 150ms var(--cs-ease),
        background-color 150ms var(--cs-ease),
        opacity 150ms var(--cs-ease);
    }

    .cs-btn:hover {
      border-color: rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.04);
    }

    .cs-btn:active {
      transform: scale(0.97);
    }

    .cs-btn.is-active {
      background: rgba(94, 106, 210, 0.18);
      border-color: rgba(94, 106, 210, 0.55);
      color: #fff;
    }

    .cs-btn.primary {
      background: #5e6ad2;
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.22),
        0 6px 18px rgba(94, 106, 210, 0.38);
      color: #ffffff;
      font-weight: 600;
      padding: 8px 14px;
    }

    .cs-btn.primary:hover {
      background: #6875df;
    }

    .cs-btn.primary:active {
      transform: scale(0.97);
    }

    .cs-workspace {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 1px;
      background: rgba(255, 255, 255, 0.08);
    }

    @media (max-width: 820px) {
      .cs-workspace {
        grid-template-columns: 1fr;
        grid-template-rows: 1.1fr 0.9fr;
      }
      .cs-subtitle {
        display: none;
      }
    }

    .cs-pane {
      position: relative;
      background: #0b0c0e;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    .cs-pane-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(14, 15, 19, 0.9);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11.5px;
      color: var(--cs-muted);
    }

    .cs-pane-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      color: var(--cs-ink);
    }

    .cs-telemetry-chip {
      font: 500 10.5px/1 "SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace;
      color: var(--cs-muted);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 3px 7px;
      border-radius: 5px;
      font-variant-numeric: tabular-nums;
    }

    .cs-stage-wrap {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background:
        radial-gradient(circle at 50% 50%, rgba(94, 106, 210, 0.05), rgba(11, 12, 14, 0.98));
      overflow: hidden;
      touch-action: none;
    }

    .cs-canvas-box {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      max-height: 100%;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
      overflow: hidden;
      background: #08090b;
    }

    .cs-source-canvas,
    .cs-output-canvas {
      display: block;
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
    }

    .cs-live-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: none;
      background: #08090b;
    }

    .cs-live-video.is-streaming {
      display: block;
    }

    .cs-live-bar {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 6;
      display: none;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(11, 12, 14, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
    }

    .cs-live-bar.is-streaming {
      display: inline-flex;
    }

    .cs-quad-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      touch-action: none;
      z-index: 4;
    }

    .cs-quad-handle {
      cursor: grab;
      touch-action: none;
    }

    .cs-quad-handle:active {
      cursor: grabbing;
    }

    .cs-loupe {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      border: 1.5px solid #38bdf8;
      background: #0b0c0e;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.78);
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
      transform: scale(0.9);
      transition: opacity 140ms var(--cs-ease), transform 140ms var(--cs-ease);
      z-index: 8;
    }

    .cs-loupe.is-active {
      opacity: 1;
      transform: scale(1);
    }

    .cs-loupe canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .cs-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 14px;
      background: #0b0c0e;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
    }

    .cs-filter-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .cs-filter-pill {
      appearance: none;
      -webkit-appearance: none;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--cs-muted);
      padding: 6.5px 11px;
      border-radius: 7px;
      font: 500 12px/1.2 "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      letter-spacing: -0.01em;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition:
        transform 150ms var(--cs-ease),
        border-color 150ms var(--cs-ease),
        background-color 150ms var(--cs-ease),
        color 150ms var(--cs-ease);
    }

    .cs-filter-pill:hover {
      color: var(--cs-ink);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .cs-filter-pill:active {
      transform: scale(0.97);
    }

    .cs-filter-pill.is-selected {
      background: rgba(94, 106, 210, 0.18);
      border-color: rgba(94, 106, 210, 0.58);
      color: var(--cs-ink);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }

    .cs-action-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initializes the Continuity Camera Document, Whiteboard & Desk-View Scanner.
 *
 * @param {Object} options
 * @param {() => WebSocket|null} [options.getWs]
 * @param {() => string} [options.getRole]
 * @param {(files: FileList|File[]) => void} [options.onFilesPicked]
 * @param {(item: Object) => void} [options.onSpawnCard]
 * @param {(msg: string) => void} [options.showToast]
 * @returns {{ openCameraScanner: (opts?: Object) => void, handleScannerMessage: (msg: Object) => void }}
 */
export function initCameraScanner({
  getWs = () => window.ws,
  getRole = () => window.ROLE || 'laptop',
  onFilesPicked = (files) => window.handleFilesSelected?.(files),
  onSpawnCard = () => {},
  showToast = (text) => window.showToast?.(text),
} = {}) {
  injectScannerStyles();

  let modalEl = null;
  let srcCanvas = null;
  let outCanvas = null;
  let loupeCanvas = null;
  let loupeEl = null;
  let quadSvg = null;
  let videoEl = null;
  let liveBarEl = null;
  let srcTelemetryEl = null;
  let outTelemetryEl = null;
  let beamBtnEl = null;

  let mediaStream = null;
  let facingMode = 'environment';
  let activeFilter = 'whiteboard_glow';
  let sampleMode = 'whiteboard';
  let isBeaming = false;
  let rafPending = false;

  // Normalized 4-corner perspective quad coordinates in [0, 1] x [0, 1]
  let quad = {
    TL: { x: 0.13, y: 0.14 },
    TR: { x: 0.86, y: 0.09 },
    BR: { x: 0.91, y: 0.87 },
    BL: { x: 0.08, y: 0.83 },
  };

  let cachedSrcImageData = null;

  function notify(text) {
    if (typeof showToast === 'function') {
      showToast(text);
    }
  }

  function stopLiveCamera() {
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
      videoEl.classList.remove('is-streaming');
    }
    if (liveBarEl) {
      liveBarEl.classList.remove('is-streaming');
    }
    if (quadSvg) {
      quadSvg.style.display = '';
    }
  }

  function computeTargetOutputDimensions(srcW, srcH, previewOnly = false) {
    const topW = Math.hypot((quad.TR.x - quad.TL.x) * srcW, (quad.TR.y - quad.TL.y) * srcH);
    const botW = Math.hypot((quad.BR.x - quad.BL.x) * srcW, (quad.BR.y - quad.BL.y) * srcH);
    const leftH = Math.hypot((quad.BL.x - quad.TL.x) * srcW, (quad.BL.y - quad.TL.y) * srcH);
    const rightH = Math.hypot((quad.BR.x - quad.TR.x) * srcW, (quad.BR.y - quad.TR.y) * srcH);

    const rawW = Math.max(160, Math.round((topW + botW) * 0.5));
    const rawH = Math.max(120, Math.round((leftH + rightH) * 0.5));
    const maxDim = previewOnly ? 680 : 1120;
    const scale = Math.min(1, maxDim / Math.max(rawW, rawH));

    return {
      width: Math.max(120, Math.round(rawW * scale)),
      height: Math.max(90, Math.round(rawH * scale)),
    };
  }

  function renderQuadOverlay() {
    if (!quadSvg || !srcCanvas) return;
    const w = 1000;
    const h = 1000;
    quadSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    quadSvg.setAttribute('preserveAspectRatio', 'none');

    const pTL = { x: quad.TL.x * w, y: quad.TL.y * h };
    const pTR = { x: quad.TR.x * w, y: quad.TR.y * h };
    const pBR = { x: quad.BR.x * w, y: quad.BR.y * h };
    const pBL = { x: quad.BL.x * w, y: quad.BL.y * h };

    const lerpPt = (a, b, t) => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });

    const gridLines = [];
    for (const t of [1 / 3, 2 / 3]) {
      const topPt = lerpPt(pTL, pTR, t);
      const botPt = lerpPt(pBL, pBR, t);
      gridLines.push(
        `<line x1="${topPt.x.toFixed(1)}" y1="${topPt.y.toFixed(1)}" x2="${botPt.x.toFixed(1)}" y2="${botPt.y.toFixed(1)}" stroke="rgba(56, 189, 248, 0.32)" stroke-width="1.2" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>`,
      );
      const leftPt = lerpPt(pTL, pBL, t);
      const rightPt = lerpPt(pTR, pBR, t);
      gridLines.push(
        `<line x1="${leftPt.x.toFixed(1)}" y1="${leftPt.y.toFixed(1)}" x2="${rightPt.x.toFixed(1)}" y2="${rightPt.y.toFixed(1)}" stroke="rgba(56, 189, 248, 0.32)" stroke-width="1.2" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>`,
      );
    }

    const maskPath = `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${pTL.x.toFixed(1)} ${pTL.y.toFixed(1)} L ${pTR.x.toFixed(1)} ${pTR.y.toFixed(1)} L ${pBR.x.toFixed(1)} ${pBR.y.toFixed(1)} L ${pBL.x.toFixed(1)} ${pBL.y.toFixed(1)} Z`;
    const polyPts = `${pTL.x.toFixed(1)},${pTL.y.toFixed(1)} ${pTR.x.toFixed(1)},${pTR.y.toFixed(1)} ${pBR.x.toFixed(1)},${pBR.y.toFixed(1)} ${pBL.x.toFixed(1)},${pBL.y.toFixed(1)}`;

    const corners = [
      { key: 'TL', pt: pTL },
      { key: 'TR', pt: pTR },
      { key: 'BR', pt: pBR },
      { key: 'BL', pt: pBL },
    ];

    const handlesHtml = corners
      .map(
        ({ key, pt }) => `
        <g class="cs-quad-handle" data-corner="${key}" transform="translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})">
          <circle r="32" fill="transparent" />
          <circle r="13" fill="rgba(11, 12, 14, 0.88)" stroke="#38bdf8" stroke-width="2" vector-effect="non-scaling-stroke" />
          <circle r="4" fill="#f2f3f5" />
          <rect x="-15" y="-31" width="30" height="15" rx="4" fill="#0b0c0e" stroke="rgba(255,255,255,0.16)" stroke-width="1" />
          <text x="0" y="-21" text-anchor="middle" fill="#f2f3f5" font-size="9.5" font-weight="600" font-family="SF Mono, ui-monospace, Menlo, monospace">${key}</text>
        </g>`,
      )
      .join('');

    quadSvg.innerHTML = `
      <path d="${maskPath}" fill="rgba(5, 6, 9, 0.56)" fill-rule="evenodd" pointer-events="none" />
      ${gridLines.join('')}
      <polygon points="${polyPts}" fill="rgba(94, 106, 210, 0.06)" stroke="#5e6ad2" stroke-width="2" vector-effect="non-scaling-stroke" pointer-events="none" />
      ${handlesHtml}
    `;

    if (srcTelemetryEl) {
      const tlStr = `TL(${Math.round(quad.TL.x * 100)},${Math.round(quad.TL.y * 100)})`;
      const brStr = `BR(${Math.round(quad.BR.x * 100)},${Math.round(quad.BR.y * 100)})`;
      srcTelemetryEl.textContent = `${srcCanvas.width}x${srcCanvas.height} · ${tlStr} ${brStr}`;
    }
  }

  function runPerspectivePipeline(previewOnly = false) {
    if (!srcCanvas || !outCanvas) return;
    const ctx = srcCanvas.getContext('2d');
    if (!cachedSrcImageData || cachedSrcImageData.width !== srcCanvas.width || cachedSrcImageData.height !== srcCanvas.height) {
      cachedSrcImageData = ctx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    }

    const { width, height } = computeTargetOutputDimensions(srcCanvas.width, srcCanvas.height, previewOnly);
    outCanvas.width = width;
    outCanvas.height = height;

    const processed = warpAndFilterCanvas(cachedSrcImageData, quad, width, height, activeFilter);
    const outCtx = outCanvas.getContext('2d');
    outCtx.putImageData(processed, 0, 0);

    if (outTelemetryEl) {
      const modeObj = FILTER_MODES.find((m) => m.id === activeFilter);
      outTelemetryEl.textContent = `${width}x${height}px · ${modeObj ? modeObj.label : activeFilter}`;
    }
  }

  function schedulePipelineUpdate(previewOnly = true) {
    renderQuadOverlay();
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      runPerspectivePipeline(previewOnly);
    });
  }

  function updateLoupe(normX, normY, active) {
    if (!loupeEl || !loupeCanvas || !srcCanvas) return;
    if (!active) {
      loupeEl.classList.remove('is-active');
      return;
    }
    loupeEl.classList.add('is-active');
    if (normX < 0.32 && normY < 0.32) {
      loupeEl.style.left = 'auto';
      loupeEl.style.right = '12px';
    } else {
      loupeEl.style.right = 'auto';
      loupeEl.style.left = '12px';
    }

    const lctx = loupeCanvas.getContext('2d');
    const lw = loupeCanvas.width;
    const lh = loupeCanvas.height;
    lctx.fillStyle = '#0b0c0e';
    lctx.fillRect(0, 0, lw, lh);

    const sx = normX * srcCanvas.width;
    const sy = normY * srcCanvas.height;
    const cropR = 28;
    lctx.drawImage(srcCanvas, sx - cropR, sy - cropR, cropR * 2, cropR * 2, 0, 0, lw, lh);

    lctx.strokeStyle = '#38bdf8';
    lctx.lineWidth = 1.2;
    lctx.beginPath();
    lctx.moveTo(lw / 2, 0);
    lctx.lineTo(lw / 2, lh);
    lctx.moveTo(0, lh / 2);
    lctx.lineTo(lw, lh / 2);
    lctx.stroke();
  }

  function loadSourceImageElement(img) {
    stopLiveCamera();
    const maxDim = 1280;
    const natW = img.naturalWidth || img.width || 960;
    const natH = img.naturalHeight || img.height || 720;
    const scale = Math.min(1, maxDim / Math.max(natW, natH));
    const w = Math.max(240, Math.round(natW * scale));
    const h = Math.max(180, Math.round(natH * scale));

    srcCanvas.width = w;
    srcCanvas.height = h;
    const ctx = srcCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    cachedSrcImageData = ctx.getImageData(0, 0, w, h);

    quad = {
      TL: { x: 0.08, y: 0.08 },
      TR: { x: 0.92, y: 0.08 },
      BR: { x: 0.92, y: 0.92 },
      BL: { x: 0.08, y: 0.92 },
    };

    renderQuadOverlay();
    runPerspectivePipeline(false);
  }

  function loadFileIntoScanner(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        loadSourceImageElement(img);
        notify(`Loaded ${file.name}`);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  async function startLiveStream() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      notify('Live stream unavailable on this origin; opening Native Camera');
      const nativeInput = modalEl?.querySelector('#cs-native-camera-input');
      nativeInput?.click();
      return;
    }

    stopLiveCamera();
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      mediaStream = stream;
      videoEl.srcObject = stream;
      await videoEl.play();
      videoEl.classList.add('is-streaming');
      liveBarEl.classList.add('is-streaming');
      quadSvg.style.display = 'none';
      notify('Live Continuity Camera active');
    } catch {
      notify('Camera permission declined or requires HTTPS; use Native Camera');
      const nativeInput = modalEl?.querySelector('#cs-native-camera-input');
      nativeInput?.click();
    }
  }

  function captureLiveVideoFrame() {
    if (!videoEl || !mediaStream) return;
    const vw = videoEl.videoWidth || 1280;
    const vh = videoEl.videoHeight || 720;
    const maxDim = 1280;
    const scale = Math.min(1, maxDim / Math.max(vw, vh));
    const w = Math.max(320, Math.round(vw * scale));
    const h = Math.max(240, Math.round(vh * scale));

    srcCanvas.width = w;
    srcCanvas.height = h;
    const ctx = srcCanvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, w, h);
    cachedSrcImageData = ctx.getImageData(0, 0, w, h);

    stopLiveCamera();
    quad = {
      TL: { x: 0.1, y: 0.1 },
      TR: { x: 0.9, y: 0.1 },
      BR: { x: 0.9, y: 0.9 },
      BL: { x: 0.1, y: 0.9 },
    };
    renderQuadOverlay();
    runPerspectivePipeline(false);
    notify('Captured. Drag the corners to fit the page, or send it to the laptop.');
  }

  async function beamScanToLaptop() {
    if (isBeaming || !outCanvas) return;
    isBeaming = true;

    if (beamBtnEl) {
      beamBtnEl.disabled = true;
      beamBtnEl.querySelector('.cs-beam-label').textContent = 'Beaming Scan...';
    }

    try {
      if (mediaStream && videoEl && videoEl.classList.contains('is-streaming')) {
        captureLiveVideoFrame();
      } else {
        runPerspectivePipeline(false);
      }

      const timestamp = Date.now();
      const fileName = `scan_${timestamp}.png`;
      const role = (typeof getRole === 'function' ? getRole() : 'phone') || 'phone';

      const blob = await new Promise((resolve, reject) => {
        outCanvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas PNG encoding failed'));
        }, 'image/png', 1.0);
      });

      const file = new File([blob], fileName, {
        type: 'image/png',
        lastModified: timestamp,
      });

      const previewDataUrl = outCanvas.toDataURL('image/png');

      const query = new URLSearchParams({
        name: fileName,
        mime: 'image/png',
        from: role,
      });
      const response = await fetch(`/api/upload?${query.toString()}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const uploaded = await response.json();
      const modeObj = FILTER_MODES.find((m) => m.id === activeFilter);
      const cardItem = {
        ...uploaded,
        id: uploaded.id || `scan_${timestamp}`,
        name: uploaded.name || fileName,
        ext: 'PNG',
        category: 'image',
        url: uploaded.url,
        previewUrl: uploaded.url || previewDataUrl,
        size: uploaded.size || file.size,
        sub: `${formatBytes(uploaded.size || file.size)} · ${modeObj ? modeObj.label : 'Scan'}`,
      };

      if (Array.isArray(window.sharedItemsHistory)) {
        window.sharedItemsHistory.unshift(cardItem);
      }
      if (typeof window.oneGlassContinuity?.addHistoryItem === 'function') {
        try {
          window.oneGlassContinuity.addHistoryItem(cardItem);
        } catch {}
      }
      if (typeof onSpawnCard === 'function') {
        onSpawnCard(cardItem);
      } else if (typeof onFilesPicked === 'function') {
        onFilesPicked([file]);
      }

      const ws = typeof getWs === 'function' ? getWs() : window.ws;
      if (ws && ws.readyState === 1) {
        ws.send(
          JSON.stringify({
            type: 'card_flick',
            cardId: cardItem.id,
            edge: role === 'phone' ? 'top' : 'right',
            item: cardItem,
            contactRatio: 0.5,
            cardSpanRatio: 0.28,
          }),
        );
      }

      notify(`Beamed ${fileName} to Laptop`);
      closeCameraScanner();
    } catch (err) {
      notify(`Scan beam error: ${err?.message || 'Upload failed'}`);
    } finally {
      isBeaming = false;
      if (beamBtnEl) {
        beamBtnEl.disabled = false;
        beamBtnEl.querySelector('.cs-beam-label').textContent = 'Beam Scan to Laptop';
      }
    }
  }

  function ensureModalDOM() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.id = SCANNER_MODAL_ID;
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-label', 'Continuity Camera Document, Whiteboard and Desk-View Scanner');

    const filterButtonsHtml = FILTER_MODES.map(
      (f) => `
      <button type="button" class="cs-filter-pill ${f.id === activeFilter ? 'is-selected' : ''}" data-filter="${f.id}" title="${f.shortDesc}">
        ${f.icon}
        <span>${f.label}</span>
      </button>`,
    ).join('');

    modalEl.innerHTML = `
      <div class="cs-shell">
        <div class="cs-header">
          <div class="cs-brand">
            <span class="cs-badge-icon">${ICONS.camera}</span>
            <div class="cs-title-wrap">
              <div class="cs-title">Scan a document</div>
              <div class="cs-subtitle">4-Corner Homography Deskew · Document, Whiteboard &amp; Desk-View</div>
            </div>
          </div>

          <div class="cs-source-actions">
            <input id="cs-native-camera-input" type="file" accept="image/*" capture="environment" style="display:none" />
            <input id="cs-file-picker-input" type="file" accept="image/*" style="display:none" />

            <button type="button" class="cs-btn" id="cs-btn-live-cam">
              ${ICONS.camera}
              <span>Live Camera</span>
            </button>
            <button type="button" class="cs-btn" id="cs-btn-native-cam">
              ${ICONS.shutter}
              <span>Camera</span>
            </button>
            <button type="button" class="cs-btn" id="cs-btn-load-img">
              ${ICONS.upload}
              <span>Load Image</span>
            </button>
            <button type="button" class="cs-btn" id="cs-btn-sample">
              ${ICONS.sample}
              <span>Sample Board</span>
            </button>
            <button type="button" class="cs-btn" id="cs-btn-reset-quad" title="Reset 4-Corner Perspective Quad">
              ${ICONS.reset}
              <span>Reset Quad</span>
            </button>
            <button type="button" class="cs-btn" id="cs-btn-close" aria-label="Close Scanner">
              ${ICONS.close}
            </button>
          </div>
        </div>

        <div class="cs-workspace">
          <div class="cs-pane">
            <div class="cs-pane-bar">
              <span class="cs-pane-label">
                ${ICONS.quad}
                <span>Source Perspective Quad (Drag TL · TR · BR · BL)</span>
              </span>
              <span class="cs-telemetry-chip" id="cs-src-telemetry">960x680</span>
            </div>
            <div class="cs-stage-wrap">
              <div class="cs-canvas-box" id="cs-source-box">
                <canvas class="cs-source-canvas" id="cs-source-canvas" width="960" height="680"></canvas>
                <video class="cs-live-video" id="cs-live-video" playsinline muted></video>
                <svg class="cs-quad-svg" id="cs-quad-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none"></svg>
              </div>
              <div class="cs-loupe" id="cs-loupe">
                <canvas id="cs-loupe-canvas" width="96" height="96"></canvas>
              </div>
              <div class="cs-live-bar" id="cs-live-bar">
                <button type="button" class="cs-btn primary" id="cs-btn-shutter">
                  ${ICONS.shutter}
                  <span>Capture</span>
                </button>
                <button type="button" class="cs-btn" id="cs-btn-flip-cam">
                  ${ICONS.flip}
                  <span>Flip Lens</span>
                </button>
                <button type="button" class="cs-btn" id="cs-btn-stop-live">
                  ${ICONS.close}
                  <span>Cancel Live</span>
                </button>
              </div>
            </div>
          </div>

          <div class="cs-pane">
            <div class="cs-pane-bar">
              <span class="cs-pane-label">
                ${ICONS.whiteboard}
                <span>Preview</span>
              </span>
              <span class="cs-telemetry-chip" id="cs-out-telemetry">720x500px</span>
            </div>
            <div class="cs-stage-wrap">
              <div class="cs-canvas-box">
                <canvas class="cs-output-canvas" id="cs-output-canvas" width="720" height="500"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="cs-footer">
          <div class="cs-filter-group" role="radiogroup" aria-label="Scan Filter Mode">
            ${filterButtonsHtml}
          </div>

          <div class="cs-action-group">
            <button type="button" class="cs-btn" id="cs-btn-save-png" title="Download Processed PNG">
              ${ICONS.download}
              <span>Save PNG</span>
            </button>
            <button type="button" class="cs-btn primary" id="cs-btn-beam">
              ${ICONS.beam}
              <span class="cs-beam-label">Send to laptop</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    srcCanvas = modalEl.querySelector('#cs-source-canvas');
    outCanvas = modalEl.querySelector('#cs-output-canvas');
    loupeCanvas = modalEl.querySelector('#cs-loupe-canvas');
    loupeEl = modalEl.querySelector('#cs-loupe');
    quadSvg = modalEl.querySelector('#cs-quad-svg');
    videoEl = modalEl.querySelector('#cs-live-video');
    liveBarEl = modalEl.querySelector('#cs-live-bar');
    srcTelemetryEl = modalEl.querySelector('#cs-src-telemetry');
    outTelemetryEl = modalEl.querySelector('#cs-out-telemetry');
    beamBtnEl = modalEl.querySelector('#cs-btn-beam');

    const nativeCameraInput = modalEl.querySelector('#cs-native-camera-input');
    const filePickerInput = modalEl.querySelector('#cs-file-picker-input');

    nativeCameraInput.addEventListener('change', () => {
      const file = nativeCameraInput.files?.[0];
      if (file) loadFileIntoScanner(file);
      nativeCameraInput.value = '';
    });

    filePickerInput.addEventListener('change', () => {
      const file = filePickerInput.files?.[0];
      if (file) loadFileIntoScanner(file);
      filePickerInput.value = '';
    });

    modalEl.querySelector('#cs-btn-live-cam').addEventListener('click', () => {
      startLiveStream();
    });

    modalEl.querySelector('#cs-btn-native-cam').addEventListener('click', () => {
      nativeCameraInput.click();
    });

    modalEl.querySelector('#cs-btn-load-img').addEventListener('click', () => {
      filePickerInput.click();
    });

    modalEl.querySelector('#cs-btn-sample').addEventListener('click', () => {
      stopLiveCamera();
      sampleMode = sampleMode === 'whiteboard' ? 'document' : 'whiteboard';
      quad = renderSampleDeskScene(srcCanvas, sampleMode);
      cachedSrcImageData = srcCanvas.getContext('2d').getImageData(0, 0, srcCanvas.width, srcCanvas.height);
      renderQuadOverlay();
      runPerspectivePipeline(false);
    });

    modalEl.querySelector('#cs-btn-reset-quad').addEventListener('click', () => {
      const isFull =
        Math.abs(quad.TL.x - 0.06) < 0.02 &&
        Math.abs(quad.TR.x - 0.94) < 0.02 &&
        Math.abs(quad.BR.y - 0.94) < 0.02;
      if (isFull) {
        quad = {
          TL: { x: 0.13, y: 0.14 },
          TR: { x: 0.86, y: 0.09 },
          BR: { x: 0.91, y: 0.87 },
          BL: { x: 0.08, y: 0.83 },
        };
      } else {
        quad = {
          TL: { x: 0.06, y: 0.06 },
          TR: { x: 0.94, y: 0.06 },
          BR: { x: 0.94, y: 0.94 },
          BL: { x: 0.06, y: 0.94 },
        };
      }
      renderQuadOverlay();
      runPerspectivePipeline(false);
    });

    modalEl.querySelector('#cs-btn-close').addEventListener('click', () => {
      closeCameraScanner();
    });

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeCameraScanner();
    });

    modalEl.querySelector('#cs-btn-shutter').addEventListener('click', () => {
      captureLiveVideoFrame();
    });

    modalEl.querySelector('#cs-btn-flip-cam').addEventListener('click', () => {
      facingMode = facingMode === 'environment' ? 'user' : 'environment';
      startLiveStream();
    });

    modalEl.querySelector('#cs-btn-stop-live').addEventListener('click', () => {
      stopLiveCamera();
    });

    for (const btn of modalEl.querySelectorAll('.cs-filter-pill')) {
      btn.addEventListener('click', () => {
        const filterId = btn.getAttribute('data-filter');
        if (!filterId) return;
        activeFilter = filterId;
        for (const b of modalEl.querySelectorAll('.cs-filter-pill')) {
          b.classList.toggle('is-selected', b.getAttribute('data-filter') === activeFilter);
        }
        runPerspectivePipeline(false);
      });
    }

    modalEl.querySelector('#cs-btn-save-png').addEventListener('click', () => {
      runPerspectivePipeline(false);
      const a = document.createElement('a');
      a.href = outCanvas.toDataURL('image/png');
      a.download = `scan_${Date.now()}.png`;
      a.click();
    });

    beamBtnEl.addEventListener('click', () => {
      beamScanToLaptop();
    });

    let draggingCorner = null;
    let activePointerId = null;

    quadSvg.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest('[data-corner]');
      if (!handle) return;
      const cornerKey = handle.getAttribute('data-corner');
      if (!cornerKey || !quad[cornerKey]) return;

      e.preventDefault();
      e.stopPropagation();
      draggingCorner = cornerKey;
      activePointerId = e.pointerId;
      quadSvg.setPointerCapture(e.pointerId);

      const pt = quad[cornerKey];
      updateLoupe(pt.x, pt.y, true);
    });

    quadSvg.addEventListener('pointermove', (e) => {
      if (!draggingCorner || e.pointerId !== activePointerId) return;
      e.preventDefault();
      const rect = quadSvg.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const nx = clamp((e.clientX - rect.left) / rect.width, 0.02, 0.98);
      const ny = clamp((e.clientY - rect.top) / rect.height, 0.02, 0.98);

      quad[draggingCorner] = { x: nx, y: ny };
      updateLoupe(nx, ny, true);
      schedulePipelineUpdate(true);
    });

    const finishQuadDrag = (e) => {
      if (!draggingCorner || (e && e.pointerId !== activePointerId)) return;
      draggingCorner = null;
      activePointerId = null;
      updateLoupe(0, 0, false);
      runPerspectivePipeline(false);
    };

    quadSvg.addEventListener('pointerup', finishQuadDrag);
    quadSvg.addEventListener('pointercancel', finishQuadDrag);

    quad = renderSampleDeskScene(srcCanvas, sampleMode);
    cachedSrcImageData = srcCanvas.getContext('2d').getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    renderQuadOverlay();
    runPerspectivePipeline(false);

    return modalEl;
  }

  function openCameraScanner(options = {}) {
    ensureModalDOM();

    if (options.filter && FILTER_MODES.some((m) => m.id === options.filter)) {
      activeFilter = options.filter;
      for (const b of modalEl.querySelectorAll('.cs-filter-pill')) {
        b.classList.toggle('is-selected', b.getAttribute('data-filter') === activeFilter);
      }
    }

    modalEl.classList.add('is-open');
    renderQuadOverlay();
    runPerspectivePipeline(false);

    if (options.autoLiveCamera) {
      startLiveStream();
    } else if (options.autoNativeCamera) {
      const nativeInput = modalEl.querySelector('#cs-native-camera-input');
      nativeInput?.click();
    }
  }

  function closeCameraScanner() {
    stopLiveCamera();
    if (modalEl) {
      modalEl.classList.remove('is-open');
    }
  }

  function handleScannerMessage(msg) {
    if (!msg || typeof msg !== 'object') return false;
    if (msg.type === 'scanner_sync') {
      if (msg.action === 'open_remote_scanner') {
        openCameraScanner({ filter: msg.filter });
        notify(`Continuity Camera requested by ${msg.fromName || 'Peer'}`);
        return true;
      }
      if (msg.action === 'beam_scan' && msg.item) {
        if (Array.isArray(window.sharedItemsHistory)) {
          if (!window.sharedItemsHistory.some((it) => it.id === msg.item.id)) {
            window.sharedItemsHistory.unshift(msg.item);
          }
        }
        if (typeof window.oneGlassContinuity?.addHistoryItem === 'function') {
          try {
            window.oneGlassContinuity.addHistoryItem(msg.item);
          } catch {}
        }
        if (typeof onSpawnCard === 'function') {
          onSpawnCard(msg.item);
        }
        notify(`Received Continuity Scan from ${msg.fromName || 'Peer'}`);
        return true;
      }
    }
    return false;
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl && modalEl.classList.contains('is-open')) {
      closeCameraScanner();
    }
  });

  const controller = {
    openCameraScanner,
    closeCameraScanner,
    handleScannerMessage,
  };

  activeScannerController = controller;
  if (typeof window !== 'undefined') {
    window.oneGlassCameraScanner = controller;
    window.openCameraScanner = openCameraScanner;
    window.closeCameraScanner = closeCameraScanner;
  }

  return controller;
}

export function openCameraScanner(options) {
  if (!activeScannerController) {
    activeScannerController = initCameraScanner();
  }
  return activeScannerController.openCameraScanner(options);
}

export function closeCameraScanner() {
  if (activeScannerController) {
    return activeScannerController.closeCameraScanner();
  }
}

export function handleScannerMessage(msg) {
  if (!activeScannerController) {
    activeScannerController = initCameraScanner();
  }
  return activeScannerController.handleScannerMessage(msg);
}

export default {
  initCameraScanner,
  openCameraScanner,
  closeCameraScanner,
  handleScannerMessage,
};
