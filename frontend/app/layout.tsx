import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PO Insight System',
  description: 'Purchase Order Data Extraction and Analytics Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
