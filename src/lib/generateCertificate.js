'use client';

/* ─── Canvas constants ─────────────────────────────────────────── */
const W = 1122; // A4 landscape ~297mm @96dpi
const H = 794;

const BLUE = '#1a3c6e';
const GOLD = '#c9a84c';
const DARK = '#1a1a1a';

/* ─── Canvas helpers ───────────────────────────────────────────── */
function drawBorders(ctx) {
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 38, W - 76, H - 76);

  // Corner gold squares
  [[30, 30], [W - 42, 30], [30, H - 42], [W - 42, H - 42]].forEach(([cx, cy]) => {
    ctx.fillStyle = GOLD;
    ctx.fillRect(cx - 6, cy - 6, 12, 12);
  });
}

function drawHeader(ctx, issuedBy) {
  const lines = issuedBy.split('\n');

  // Blue band
  ctx.fillStyle = BLUE;
  ctx.fillRect(39, 39, W - 78, 88);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';

  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(lines[0].toUpperCase(), W / 2, 78);

  if (lines[1]) {
    ctx.font = '13px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(lines[1], W / 2, 100);
  }

  // Gold divider under header
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(42, 127);
  ctx.lineTo(W - 42, 127);
  ctx.stroke();
}

function drawTitle(ctx) {
  ctx.fillStyle = BLUE;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('C E R T I F I C A T E   O F   P A R T I C I P A T I O N', W / 2, 168);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 230, 180);
  ctx.lineTo(W / 2 + 230, 180);
  ctx.stroke();
}

function drawBody(ctx, name, cert) {
  const cx = W / 2;

  // "This is to certify that"
  ctx.fillStyle = '#666666';
  ctx.font = 'italic 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('This is to certify that', cx, 225);

  // Name — hero element
  ctx.fillStyle = BLUE;
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText(name, cx, 308);

  // Gold double underline for name
  const nw = Math.min(ctx.measureText(name).width + 60, W - 120);
  const nx = cx - nw / 2;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(nx, 322); ctx.lineTo(nx + nw, 322); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(nx + 6, 328); ctx.lineTo(nx + nw - 6, 328); ctx.stroke();

  // Body sentence
  ctx.fillStyle = DARK;
  ctx.font = '16px Georgia, serif';
  ctx.fillText('has successfully participated in the one-day workshop on', cx, 368);

  // Event name
  ctx.fillStyle = BLUE;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(cert.eventName, cx, 410);

  // Date + venue
  ctx.fillStyle = '#555555';
  ctx.font = '14px Georgia, serif';
  ctx.fillText(`held on ${cert.eventDate}`, cx, 445);
  ctx.fillText(cert.venue, cx, 466);

  // Organised by
  ctx.fillStyle = '#888888';
  ctx.font = 'italic 12px Georgia, serif';
  const org = cert.issuedBy.split('\n')[0];
  ctx.fillText(`Organised by: ${org}`, cx, 496);
}

function drawSignatories(ctx, signatories) {
  const total = signatories.length;
  const slotW = (W - 200) / (total + 1);

  signatories.forEach((sig, i) => {
    const x = 100 + slotW * (i + 1);

    ctx.strokeStyle = DARK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 80, 590);
    ctx.lineTo(x + 80, 590);
    ctx.stroke();

    ctx.fillStyle = DARK;
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(sig.name, x, 607);

    ctx.fillStyle = '#555555';
    ctx.font = '11px Georgia, serif';
    ctx.fillText(sig.title, x, 623);
  });
}

function drawFooter(ctx, certNumber, eventDate) {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(42, 658);
  ctx.lineTo(W - 42, 658);
  ctx.stroke();

  ctx.font = '11px Arial, sans-serif';
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'left';
  ctx.fillText(`Certificate No: ${certNumber}`, 55, 678);
  ctx.textAlign = 'right';
  ctx.fillText(`Date: ${eventDate}`, W - 55, 678);

  // Watermark
  ctx.save();
  ctx.fillStyle = 'rgba(26,60,110,0.035)';
  ctx.font = 'bold 100px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.translate(W / 2, H / 2 + 20);
  ctx.rotate(-Math.PI / 10);
  ctx.fillText('SLCR IIT BHU', 0, 0);
  ctx.restore();
}

/* ─── Public API ───────────────────────────────────────────────── */

/**
 * Generates the certificate on a canvas and returns a PNG data URL.
 * Only the participant's name is printed (no designation / org).
 */
export function generateCertificatePNG({ participant, cert, certNumber }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Cream gradient background
  const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 700);
  bg.addColorStop(0, '#fffef9');
  bg.addColorStop(1, '#f5eed8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawBorders(ctx);
  drawHeader(ctx, cert.issuedBy);
  drawTitle(ctx);
  drawBody(ctx, participant.name, cert);
  drawSignatories(ctx, cert.signatories);
  drawFooter(ctx, certNumber, cert.eventDate);

  return canvas.toDataURL('image/png');
}

/** Download the certificate as a PNG file. */
export function downloadCertificatePNG(dataUrl, name) {
  const a = document.createElement('a');
  a.download = `Certificate_${name.replace(/\s+/g, '_')}.png`;
  a.href = dataUrl;
  a.click();
}

/** Download the certificate as a PDF using jsPDF. */
export async function downloadCertificatePDF(dataUrl, name) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [W, H] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, W, H);
  pdf.save(`Certificate_${name.replace(/\s+/g, '_')}.pdf`);
}

/** Download the certificate as a PowerPoint (.pptx) file using pptxgenjs. */
export async function downloadCertificatePPTX({ participant, cert, certNumber }) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();

  pptx.defineLayout({ name: 'CERT', width: 10, height: 7.08 }); // A4 landscape inches
  pptx.layout = 'CERT';

  const slide = pptx.addSlide();
  slide.background = { color: 'FFFEF9' };

  // ── Borders ──────────────────────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.15, y: 0.15, w: 9.7, h: 6.78,
    line: { color: '1a3c6e', width: 3 }, fill: { type: 'none' },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.28, y: 0.28, w: 9.44, h: 6.52,
    line: { color: 'c9a84c', width: 1 }, fill: { type: 'none' },
  });

  // ── Blue header band ──────────────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.29, y: 0.29, w: 9.42, h: 0.78,
    fill: { color: '1a3c6e' }, line: { type: 'none' },
  });

  const orgLines = cert.issuedBy.split('\n');
  slide.addText(
    [
      { text: orgLines[0].toUpperCase(), options: { bold: true, fontSize: 13 } },
      ...(orgLines[1] ? [{ text: `\n${orgLines[1]}`, options: { fontSize: 10 } }] : []),
    ],
    {
      x: 0.3, y: 0.3, w: 9.4, h: 0.76,
      color: 'FFFFFF', align: 'center', fontFace: 'Georgia', valign: 'middle',
    }
  );

  // ── Gold divider ──────────────────────────────────────────────
  slide.addShape(pptx.ShapeType.line, {
    x: 0.4, y: 1.12, w: 9.2, h: 0,
    line: { color: 'c9a84c', width: 2 },
  });

  // ── Title ─────────────────────────────────────────────────────
  slide.addText('CERTIFICATE OF PARTICIPATION', {
    x: 0.5, y: 1.2, w: 9, h: 0.55,
    fontSize: 20, color: '1a3c6e', bold: true, align: 'center',
    fontFace: 'Georgia', charSpacing: 3,
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 2.5, y: 1.78, w: 5, h: 0,
    line: { color: 'c9a84c', width: 1.5 },
  });

  // ── "This is to certify that" ─────────────────────────────────
  slide.addText('This is to certify that', {
    x: 0.5, y: 1.88, w: 9, h: 0.38,
    fontSize: 13, color: '777777', italic: true, align: 'center', fontFace: 'Georgia',
  });

  // ── NAME — hero ───────────────────────────────────────────────
  slide.addText(participant.name, {
    x: 0.5, y: 2.24, w: 9, h: 1.0,
    fontSize: 42, color: '1a3c6e', bold: true, align: 'center', fontFace: 'Georgia',
  });

  // Gold double underline
  slide.addShape(pptx.ShapeType.line, {
    x: 1.5, y: 3.27, w: 7, h: 0, line: { color: 'c9a84c', width: 2.5 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 1.7, y: 3.35, w: 6.6, h: 0, line: { color: 'c9a84c', width: 1 },
  });

  // ── Body text ─────────────────────────────────────────────────
  slide.addText('has successfully participated in the one-day workshop on', {
    x: 0.5, y: 3.45, w: 9, h: 0.38,
    fontSize: 13, color: '333333', align: 'center', fontFace: 'Georgia',
  });

  slide.addText(cert.eventName, {
    x: 0.5, y: 3.82, w: 9, h: 0.55,
    fontSize: 22, color: '1a3c6e', bold: true, align: 'center', fontFace: 'Georgia',
  });

  slide.addText(`held on ${cert.eventDate}`, {
    x: 0.5, y: 4.36, w: 9, h: 0.3,
    fontSize: 12, color: '555555', align: 'center', fontFace: 'Georgia',
  });
  slide.addText(cert.venue, {
    x: 0.5, y: 4.63, w: 9, h: 0.3,
    fontSize: 11, color: '666666', align: 'center', fontFace: 'Georgia',
  });

  // ── Signatories ───────────────────────────────────────────────
  const sigCount = cert.signatories.length;
  const slotW = 9 / (sigCount + 1);
  cert.signatories.forEach((sig, i) => {
    const x = 0.5 + slotW * (i + 1) - 1.2;
    slide.addShape(pptx.ShapeType.line, {
      x, y: 5.35, w: 2.4, h: 0, line: { color: '333333', width: 1 },
    });
    slide.addText(sig.name, {
      x, y: 5.4, w: 2.4, h: 0.28,
      fontSize: 11, color: '222222', bold: true, align: 'center', fontFace: 'Georgia',
    });
    slide.addText(sig.title, {
      x, y: 5.68, w: 2.4, h: 0.24,
      fontSize: 9, color: '555555', align: 'center', fontFace: 'Georgia',
    });
  });

  // ── Gold footer line ──────────────────────────────────────────
  slide.addShape(pptx.ShapeType.line, {
    x: 0.3, y: 6.12, w: 9.4, h: 0, line: { color: 'c9a84c', width: 1 },
  });
  slide.addText(`Certificate No: ${certNumber}`, {
    x: 0.5, y: 6.2, w: 4.5, h: 0.28,
    fontSize: 9, color: '888888', align: 'left', fontFace: 'Arial',
  });
  slide.addText(`Date: ${cert.eventDate}`, {
    x: 5, y: 6.2, w: 4.5, h: 0.28,
    fontSize: 9, color: '888888', align: 'right', fontFace: 'Arial',
  });

  await pptx.writeFile({
    fileName: `Certificate_${participant.name.replace(/\s+/g, '_')}.pptx`,
  });
}
