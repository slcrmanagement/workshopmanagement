import './globals.css';

export const metadata = {
  title: 'SLCR Workshop Portal | IIT (BHU) Varanasi',
  description:
    'Smart Laboratory on Clean Rivers – workshop registrations, feedback, and certificates.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
<body>
        <header className="bg-slcr-blue text-white shadow-lg no-print">
          <div className="max-w-4xl mx-auto px-3 py-3">
            <p className="text-xs text-blue-300 leading-tight">
              Dept. of Civil Engineering · IIT (BHU) Varanasi
            </p>
            <h1 className="text-sm sm:text-base font-bold leading-snug mt-0.5">
              Smart Laboratory on Clean Rivers (SLCR)
            </h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 min-h-screen">
          {children}
        </main>

        <footer className="bg-slcr-blue text-blue-200 py-5 mt-10 no-print">
          <div className="max-w-4xl mx-auto px-3 text-center">
            <p className="text-xs font-semibold text-white">
              Smart Laboratory on Clean Rivers (SLCR)
            </p>
            <p className="text-xs mt-0.5">Dept. of Civil Engineering, IIT (BHU), Varanasi</p>
            <p className="text-xs text-blue-400 mt-1.5">
              © {new Date().getFullYear()} SLCR IIT (BHU)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
