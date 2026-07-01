'use client';

const W = 1122; // A4 landscape ~297mm @96dpi
const H = 794;

const BLUE = '#1a3c6e';
const GOLD = '#c9a84c';
const DARK = '#1a1a1a';
const LIGHT_GOLD = '#e8d5a3';

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

function drawBorders(ctx) {
  // Outer thick blue border
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // Gold inner border
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Thin blue line inside gold
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 38, W - 76, H - 76);

  // Corner ornament squares
  const corners = [
    [30, 30], [W - 60, 30], [30, H - 60], [W - 60, H - 60],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = GOLD;
    ctx.fillRect(cx - 6, cy - 6, 12, 12);
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 6, cy - 6, 12, 12);
  });
}

function drawHeader(ctx, orgName) {
  // Blue header band
  ctx.fillStyle = BLUE;
  ctx.fillRect(39, 39, W - 78, 90);

  // Organisation name in header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.fillText(orgName.toUpperCase(), W / 2, 80);

  // Gold divider
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(42, 129);
  ctx.lineTo(W - 42, 129);
  ctx.stroke();
}

function drawTitle(ctx) {
  ctx.fillStyle = BLUE;
  ctx.font = 'bold 13px "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('C E R T I F I C A T E   O F   P A R T I C I P A T I O N', W / 2, 168);

  // Underline
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  const titleWidth = 460;
  ctx.beginPath();
  ctx.moveTo(W / 2 - titleWidth / 2, 178);
  ctx.lineTo(W / 2 + titleWidth / 2, 178);
  ctx.stroke();
}

function drawBody(ctx, participant, cert) {
  const cx = W / 2;

  // "This is to certify that"
  ctx.fillStyle = '#555555';
  ctx.font = 'italic 17px "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.fillText('This is to certify that', cx, 220);

  // Participant name
  ctx.fillStyle = BLUE;
  ctx.font = 'bold 38px "Georgia", serif';
  ctx.fillText(participant.name, cx, 278);

  // Gold name underline
  const nameWidth = ctx.measureText(participant.name).width;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - nameWidth / 2 - 20, 290);
  ctx.lineTo(cx + nameWidth / 2 + 20, 290);
  ctx.stroke();

  // Designation + org
  if (participant.designation || participant.organization) {
    const meta = [participant.designation, participant.organization].filter(Boolean).join(', ');
    ctx.fillStyle = '#444444';
    ctx.font = 'italic 15px "Georgia", serif';
    ctx.fillText(meta, cx, 318);
  }

  // Body text
  ctx.fillStyle = DARK;
  ctx.font = '16px "Georgia", serif';
  ctx.fillText('has successfully participated in the one-day workshop on', cx, 360);

  // Event name
  ctx.fillStyle = BLUE;
  ctx.font = 'bold 24px "Georgia", serif';
  ctx.fillText(cert.eventName, cx, 400);

  ctx.fillStyle = DARK;
  ctx.font = '15px "Georgia", serif';
  ctx.fillText(`held on ${cert.eventDate}`, cx, 432);
  ctx.fillText(`at ${cert.venue}`, cx, 456);

  // "Organised by"
  ctx.fillStyle = '#555555';
  ctx.font = 'italic 14px "Georgia", serif';
  const issuedLines = cert.issuedBy.split('\n');
  ctx.fillText(`Organised by: ${issuedLines[0]}`, cx, 490);
  if (issuedLines[1]) ctx.fillText(issuedLines[1], cx, 508);
}

function drawSignatories(ctx, signatories) {
  const totalSigs = signatories.length;
  const spacing = (W - 160) / (totalSigs + 1);

  signatories.forEach((sig, i) => {
    const x = 80 + spacing * (i + 1);

    // Signature line
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 70, 590);
    ctx.lineTo(x + 70, 590);
    ctx.stroke();

    ctx.fillStyle = DARK;
    ctx.font = 'bold 13px "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText(sig.name, x, 608);
    ctx.font = '12px "Georgia", serif';
    ctx.fillStyle = '#444444';
    ctx.fillText(sig.title, x, 624);
  });
}

function drawFooter(ctx, certNumber, certDate) {
  // Gold footer line
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(42, 660);
  ctx.lineTo(W - 42, 660);
  ctx.stroke();

  ctx.fillStyle = '#666666';
  ctx.font = '11px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Certificate No: ${certNumber}`, 55, 680);

  ctx.textAlign = 'right';
  ctx.fillText(`Date: ${certDate}`, W - 55, 680);

  // Watermark text
  ctx.fillStyle = 'rgba(26, 60, 110, 0.04)';
  ctx.font = 'bold 90px "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 8);
  ctx.fillText('SLCR IIT BHU', 0, 0);
  ctx.restore();
}

/**
 * Generates a certificate on a canvas and returns a data URL (PNG).
 *
 * @param {Object} options
 * @param {{ name: string, designation?: string, organization?: string }} options.participant
 * @param {Object} options.cert  – certificate config from workshops.js
 * @param {string} options.certNumber – serial number string
 * @returns {string} PNG data URL
 */
export function generateCertificatePNG({ participant, cert, certNumber }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Cream background
  ctx.fillStyle = '#fffef9';
  ctx.fillRect(0, 0, W, H);

  // Subtle gold tint corners
  const gradient = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 700);
  gradient.addColorStop(0, 'rgba(255,255,249,1)');
  gradient.addColorStop(1, 'rgba(232,213,163,0.15)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  drawBorders(ctx);
  drawHeader(ctx, cert.issuedBy.split('\n')[0]);
  drawTitle(ctx);
  drawBody(ctx, participant, cert);
  drawSignatories(ctx, cert.signatories);
  drawFooter(ctx, certNumber, cert.eventDate);

  return canvas.toDataURL('image/png');
}

/** Download the certificate as a PNG file. */
export function downloadCertificatePNG(dataUrl, participantName) {
  const link = document.createElement('a');
  link.download = `Certificate_${participantName.replace(/\s+/g, '_')}.png`;
  link.href = dataUrl;
  link.click();
}

/** Download the certificate as a PDF (requires jsPDF loaded in browser). */
export async function downloadCertificatePDF(dataUrl, participantName) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [W, H] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, W, H);
  pdf.save(`Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);
}
