/**
 * Fetches the certificate PDF template, stamps the participant's name onto it
 * using pdf-lib, and returns a Blob ready for preview or download.
 *
 * @param {string} templateUrl  - e.g. '/certificate/scalgo-live-2026.pdf'
 * @param {string} name         - participant name from the verify API
 */
export async function generateCertificateBlob(templateUrl, name) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const existingBytes = await fetch(templateUrl).then((r) => {
    if (!r.ok) throw new Error('Could not load certificate template');
    return r.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(existingBytes);
  const page = pdfDoc.getPages()[0];
  const { width } = page.getSize(); // 780 pt wide, 540 pt tall

  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Auto-shrink font if the name is very long
  let fontSize = 34;
  const maxWidth = width * 0.68; // ~530 pt usable
  while (font.widthOfTextAtSize(name, fontSize) > maxWidth && fontSize > 16) {
    fontSize -= 1;
  }

  const textWidth = font.widthOfTextAtSize(name, fontSize);

  // Center horizontally; Y=340 places text in the blank space
  // between "presented to" and the dotted line (adjust if needed)
  page.drawText(name, {
    x: (width - textWidth) / 2,
    y: 340,
    size: fontSize,
    font,
    color: rgb(0.08, 0.14, 0.42),
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
