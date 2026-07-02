'use client';

import { useEffect, useState, useRef } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CertificatePreview({ participant, cert }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const urlRef = useRef(null);

  useEffect(() => {
    async function generate() {
      try {
        const { generateCertificateBlob } = await import('@/lib/generateCertificate');
        const blob = await generateCertificateBlob(cert.templatePdf, participant.name);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setBlobUrl(url);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    generate();
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); };
  }, [participant, cert]);

  async function handleDownload() {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `Certificate_${participant.name.replace(/\s+/g, '_')}.pdf`;
    a.click();

    // Record that certificate was downloaded (non-blocking)
    fetch('/api/certificate-downloaded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workshopId: cert.workshopId,
        participantId: participant.id,
        name: participant.name,
      }),
    }).catch(() => {});
  }

  return (
    <div>
      <div className="card overflow-hidden mb-3">
        <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 font-medium flex items-center gap-2 border-b border-gray-100">
          <CheckCircle2 size={12} className="text-green-500 shrink-0" />
          Certificate for <span className="text-gray-800 font-semibold">{participant.name}</span>
        </div>

        {loading && (
          <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 size={28} className="animate-spin text-slcr-blue" />
            <p className="text-xs">Preparing your certificate…</p>
          </div>
        )}

        {!loading && error && (
          <div className="h-32 flex flex-col items-center justify-center gap-2 text-red-400">
            <AlertCircle size={24} />
            <p className="text-xs">Could not load certificate. Please try again.</p>
          </div>
        )}

        {!loading && !error && blobUrl && (
          /* Desktop: inline PDF preview. Mobile: PDF in new tab via download button. */
          <object
            data={blobUrl}
            type="application/pdf"
            className="w-full hidden sm:block"
            style={{ height: '420px' }}
          >
            <p className="p-4 text-xs text-gray-400 text-center">
              Preview not available — use the download button below.
            </p>
          </object>
        )}

        {!loading && !error && (
          <p className="sm:hidden px-3 py-3 text-xs text-gray-500 text-center">
            Your certificate is ready. Tap below to download.
          </p>
        )}
      </div>

      <button
        onClick={handleDownload}
        disabled={loading || error || !blobUrl}
        className="btn-primary w-full flex justify-center items-center gap-2"
      >
        {loading
          ? <><Loader2 size={13} className="animate-spin" /> Preparing…</>
          : <><Download size={13} /> Download Certificate (PDF)</>}
      </button>
    </div>
  );
}
