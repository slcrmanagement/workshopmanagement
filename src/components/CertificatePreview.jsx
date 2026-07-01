'use client';

import { useEffect, useState } from 'react';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import {
  generateCertificatePNG,
  downloadCertificatePNG,
  downloadCertificatePDF,
  downloadCertificatePPTX,
} from '@/lib/generateCertificate';

export default function CertificatePreview({ participant, cert, certNumber }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pptLoading, setPptLoading] = useState(false);

  useEffect(() => {
    setDataUrl(generateCertificatePNG({ participant, cert, certNumber }));
  }, [participant, cert, certNumber]);

  async function handlePDF() {
    if (!dataUrl) return;
    setPdfLoading(true);
    try { await downloadCertificatePDF(dataUrl, participant.name); }
    finally { setPdfLoading(false); }
  }

  async function handlePPT() {
    setPptLoading(true);
    try { await downloadCertificatePPTX({ participant, cert, certNumber }); }
    finally { setPptLoading(false); }
  }

  return (
    <div>
      {/* Certificate image — horizontally scrollable on very small screens */}
      <div className="card overflow-hidden mb-3">
        <div className="bg-gray-100 px-3 py-1.5 text-xs text-gray-500 font-medium no-print flex justify-between">
          <span>Certificate Preview</span>
          <span className="font-mono text-gray-400">{certNumber}</span>
        </div>

        {dataUrl ? (
          <div className="overflow-x-auto">
            <img
              src={dataUrl}
              alt="Certificate of Participation"
              className="block w-full min-w-[300px]"
            />
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Generating…</p>
            </div>
          </div>
        )}
      </div>

      {/* Download buttons — stacked on mobile, inline on sm+ */}
      {dataUrl && (
        <div className="flex flex-col sm:flex-row gap-2 no-print">
          <button
            onClick={() => downloadCertificatePNG(dataUrl, participant.name)}
            className="btn-primary flex justify-center items-center gap-2"
          >
            <Download size={13} /> Download PNG
          </button>

          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            className="btn-gold flex justify-center items-center gap-2"
          >
            {pdfLoading
              ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
              : <><Download size={13} /> Download PDF</>}
          </button>

          <button
            onClick={handlePPT}
            disabled={pptLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {pptLoading
              ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
              : <><Download size={13} /> Download PPT</>}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2 no-print">
        No. <span className="font-mono">{certNumber}</span>
      </p>
    </div>
  );
}
