import './globals.css';

export const metadata = {
  title: 'SLCR Workshop Management | IIT (BHU) Varanasi',
  description:
    'Smart Laboratory on Clean Rivers – workshop registrations, feedback, and certificates.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-slcr-blue text-white shadow-lg no-print">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            <div>
              <p className="text-xs text-blue-200 font-medium tracking-wide uppercase">
                Department of Civil Engineering · IIT (BHU) Varanasi
              </p>
              <h1 className="text-lg font-bold leading-tight">
                Smart Laboratory on Clean Rivers (SLCR)
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen">{children}</main>

        <footer className="bg-slcr-blue text-blue-200 text-sm py-6 mt-12 no-print">
          <div className="max-w-6xl mx-auto px-4 text-center space-y-1">
            <p className="font-semibold text-white">Smart Laboratory on Clean Rivers (SLCR)</p>
            <p>Department of Civil Engineering, IIT (BHU), Varanasi</p>
            <p className="mt-2 text-xs text-blue-300">
              © {new Date().getFullYear()} SLCR IIT (BHU) · All rights reserved
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
