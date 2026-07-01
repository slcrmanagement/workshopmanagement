'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import { generateCertificatePNG, downloadCertificatePNG, downloadCertificatePDF } from '@/lib/generateCertificate';

export default function CertificatePreview({ participant, cert, certNumber }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    // Generate certificate image client-side after mount
    const url = generateCertificatePNG({ participant, cert, certNumber });
    setDataUrl(url);
  }, [participant, cert, certNumber]);

  async function handlePDF() {
    if (!dataUrl) return;
    setPdfLoading(true);
    try {
      await downloadCertificatePDF(dataUrl, participant.name);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div>
      {/* Certificate preview */}
      <div className="card overflow-hidden mb-4">
        <div className="bg-gray-100 px-4 py-2 text-xs text-gray-500 font-medium no-print">
          Certificate Preview — {certNumber}
        </div>
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Certificate of Participation"
            className="w-full"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ImageIcon size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Generating certificate…</p>
            </div>
          </div>
        )}
      </div>

      {/* Download buttons */}
      {dataUrl && (
        <div className="flex flex-wrap gap-3 no-print">
          <button
            onClick={() => downloadCertificatePNG(dataUrl, participant.name)}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Download size={15} /> Download as PNG
          </button>

          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            className="btn-gold inline-flex items-center gap-2 text-sm"
          >
            <Download size={15} /> {pdfLoading ? 'Generating PDF…' : 'Download as PDF'}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 no-print">
        Certificate No: <span className="font-mono">{certNumber}</span>
      </p>
    </div>
  );
}
