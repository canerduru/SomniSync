/**
 * Canvas-based Stylized Watermarked Image Card Generator
 * Produces ultra-high-resolution, screenshot-worthy social media cards
 * in pure monochrome brutalist aesthetic (Co-Star inspired).
 */

import { DreamRecord } from '../types/dream';

export type CardFormat = 'portrait' | 'story'; // portrait: 1080x1350 (4:5), story: 1080x1920 (9:16)

export interface RenderCardOptions {
  dream: DreamRecord;
  format?: CardFormat;
  language?: 'tr' | 'en';
}

export async function renderDreamArcheCard({
  dream,
  format = 'portrait',
  language = 'tr',
}: RenderCardOptions): Promise<{ dataUrl: string; blob: Blob }> {
  const width = 1080;
  const height = format === 'story' ? 1920 : 1350;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Base Dark Background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle procedural film grain
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 200;
  grainCanvas.height = 200;
  const grainCtx = grainCanvas.getContext('2d');
  if (grainCtx) {
    const grainImgData = grainCtx.createImageData(200, 200);
    for (let i = 0; i < grainImgData.data.length; i += 4) {
      const val = Math.random() * 255;
      grainImgData.data[i] = val;
      grainImgData.data[i + 1] = val;
      grainImgData.data[i + 2] = val;
      grainImgData.data[i + 3] = Math.random() < 0.25 ? 16 : 0; // faint noise
    }
    grainCtx.putImageData(grainImgData, 0, 0);
    const pattern = ctx.createPattern(grainCanvas, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 3. Brutalist Perimeter Frames & Crosshairs
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 2;
  const margin = 50;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Corner Crosshairs
  const drawCrosshair = (x: number, y: number) => {
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 12);
    ctx.stroke();
  };
  drawCrosshair(margin, margin);
  drawCrosshair(width - margin, margin);
  drawCrosshair(margin, height - margin);
  drawCrosshair(width - margin, height - margin);

  // 4. Header Bar
  ctx.fillStyle = '#f5f5f5';
  ctx.font = "600 28px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText('SOMNISYNC', margin + 30, margin + 55);

  ctx.fillStyle = '#777777';
  ctx.font = "400 18px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText('// ARCHE-RECORD // ENCRYPTED', margin + 225, margin + 55);

  const formattedDate = new Date(dream.recordedAt)
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '.');
  ctx.textAlign = 'right';
  ctx.fillText(`${formattedDate} // REM_THETA`, width - margin - 30, margin + 55);

  // Header separator line
  ctx.strokeStyle = '#1e1e1e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin + 20, margin + 85);
  ctx.lineTo(width - margin - 20, margin + 85);
  ctx.stroke();

  // 5. Dream Visual Hero Image
  const imgY = margin + 115;
  const imgHeight = format === 'story' ? 820 : 540;
  const imgWidth = width - margin * 2 - 40;
  const imgX = margin + 20;

  if (dream.imageUrl) {
    try {
      const img = await loadImage(dream.imageUrl);
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgX, imgY, imgWidth, imgHeight);
      ctx.clip();

      // Draw image cover
      const hRatio = imgWidth / img.width;
      const vRatio = imgHeight / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (imgWidth - img.width * ratio) / 2;
      const centerShiftY = (imgHeight - img.height * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        imgX + centerShiftX,
        imgY + centerShiftY,
        img.width * ratio,
        img.height * ratio
      );

      // Grayscale & Chiaroscuro overlay on image
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(imgX, imgY, imgWidth, imgHeight);

      // Subtle bottom gradient fade
      const grad = ctx.createLinearGradient(0, imgY + imgHeight - 200, 0, imgY + imgHeight);
      grad.addColorStop(0, 'rgba(5, 5, 5, 0)');
      grad.addColorStop(1, 'rgba(5, 5, 5, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(imgX, imgY, imgWidth, imgHeight);

      ctx.restore();

      // Border around image
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(imgX, imgY, imgWidth, imgHeight);
    } catch {
      // Fallback placeholder rectangle
      drawFallbackImagePlaceholder(ctx, imgX, imgY, imgWidth, imgHeight);
    }
  } else {
    drawFallbackImagePlaceholder(ctx, imgX, imgY, imgWidth, imgHeight);
  }

  // Stamp inside image top-left
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(imgX + 20, imgY + 20, 260, 36);
  ctx.strokeStyle = '#444444';
  ctx.strokeRect(imgX + 20, imgY + 20, 260, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = "500 13px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.fillText('PEER-REVIEWED // REM_THETA', imgX + 150, imgY + 44);

  // 6. Typographic Excerpt Section (Dream Transcript)
  const contentY = imgY + imgHeight + 45;
  ctx.fillStyle = '#888888';
  ctx.font = "500 16px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText(
    language === 'en' ? 'CONSCIOUSNESS STREAM // TRANSCRIPT' : 'BİLİNÇ AKIŞI // HAM TRANSKRİPT',
    margin + 30,
    contentY
  );

  // Quotation in Cormorant Garamond
  ctx.fillStyle = '#f0f0f0';
  ctx.font = "italic 32px 'Cormorant Garamond', Georgia, serif";
  const transcriptSnippet = `"${dream.rawTranscript.slice(0, 150)}${
    dream.rawTranscript.length > 150 ? '...' : ''
  }"`;
  wrapText(ctx, transcriptSnippet, margin + 30, contentY + 45, width - margin * 2 - 60, 42);

  // 7. Triadic Lens Insight Cards (Monochrome brutalist boxes)
  const boxY = contentY + 160;
  const boxWidth = (width - margin * 2 - 80) / 2;
  const boxHeight = format === 'story' ? 240 : 180;

  // Box 1: Jungian Shadow Archetype
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(margin + 30, boxY, boxWidth, boxHeight);
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(margin + 30, boxY, boxWidth, boxHeight);

  // Top white accent line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(margin + 30, boxY);
  ctx.lineTo(margin + 120, boxY);
  ctx.stroke();

  ctx.fillStyle = '#888888';
  ctx.font = "600 14px 'JetBrains Mono', monospace";
  ctx.fillText(
    language === 'en' ? 'JUNGIAN // SHADOW' : 'JUNG // GÖLGE ARKETİPİ',
    margin + 45,
    boxY + 30
  );

  ctx.fillStyle = '#cccccc';
  ctx.font = "400 16px 'Plus Jakarta Sans', sans-serif";
  const jungSnippet = dream.interpretations.jungian.slice(0, format === 'story' ? 140 : 100) + '...';
  wrapText(ctx, jungSnippet, margin + 45, boxY + 62, boxWidth - 30, 24);

  // Box 2: Neuroscience Memory Replay
  const box2X = margin + 30 + boxWidth + 20;
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(box2X, boxY, boxWidth, boxHeight);
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(box2X, boxY, boxWidth, boxHeight);

  // Top gray accent line
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(box2X, boxY);
  ctx.lineTo(box2X + 120, boxY);
  ctx.stroke();

  ctx.fillStyle = '#888888';
  ctx.font = "600 14px 'JetBrains Mono', monospace";
  ctx.fillText(
    language === 'en' ? 'NEURO // CONSOLIDATION' : 'NÖRO // BELLEK TETA FAZI',
    box2X + 15,
    boxY + 30
  );

  ctx.fillStyle = '#aaaaaa';
  ctx.font = "400 16px 'Plus Jakarta Sans', sans-serif";
  const neuroSnippet = dream.interpretations.neuroscience.slice(0, format === 'story' ? 140 : 100) + '...';
  wrapText(ctx, neuroSnippet, box2X + 15, boxY + 62, boxWidth - 30, 24);

  // 8. Normalized Theme Tag Pills
  const tagsY = boxY + boxHeight + 35;
  let currentTagX = margin + 30;
  ctx.font = "500 15px 'JetBrains Mono', monospace";

  dream.tags.slice(0, 4).forEach((tag) => {
    const tagText = `#${tag.label.toUpperCase()}`;
    const tagWidth = ctx.measureText(tagText).width + 24;

    if (currentTagX + tagWidth < width - margin - 30) {
      ctx.fillStyle = '#111111';
      ctx.fillRect(currentTagX, tagsY, tagWidth, 32);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(currentTagX, tagsY, tagWidth, 32);

      ctx.fillStyle = '#dddddd';
      ctx.fillText(tagText, currentTagX + 12, tagsY + 22);
      currentTagX += tagWidth + 12;
    }
  });

  // 9. Watermark, Coordinates & Barcode Footer
  const footerY = height - margin - 35;

  // Separator line
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin + 20, footerY - 35);
  ctx.lineTo(width - margin - 20, footerY - 35);
  ctx.stroke();

  // Simulated Brutalist Barcode
  let barcodeX = margin + 30;
  const barcodeY = footerY - 20;
  for (let b = 0; b < 28; b++) {
    const bWidth = (b % 3 === 0 ? 4 : b % 2 === 0 ? 2 : 1);
    ctx.fillStyle = b % 4 === 0 ? '#555555' : '#ffffff';
    ctx.fillRect(barcodeX, barcodeY, bWidth, 24);
    barcodeX += bWidth + 3;
  }

  // Official Watermark Text
  ctx.fillStyle = '#ffffff';
  ctx.font = "700 18px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText('SOMNISYNC // NEURO-SOCIAL DREAM NETWORK', barcodeX + 25, footerY);

  // Archetype Identifier & Hash
  ctx.fillStyle = '#666666';
  ctx.font = "400 15px 'JetBrains Mono', monospace";
  ctx.textAlign = 'right';
  ctx.fillText(`ARCHE-ID #${dream.id.slice(-6).toUpperCase()}`, width - margin - 30, footerY);

  // Return base64 and Blob
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Canvas blob generation failed'));
    }, 'image/png');
  });

  return { dataUrl, blob };
}

function drawFallbackImagePlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#444444';
  ctx.font = "500 16px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.fillText('[ MONOCHROME DREAM MATRIX ]', x + w / 2, y + h / 2);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}
