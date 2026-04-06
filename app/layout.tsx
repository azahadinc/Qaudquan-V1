import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataPipelineInitializer } from '../components/DataPipelineInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Qaudquan - Financial Trading & Analysis',
  description: 'Real-time market data, technical analysis, and trading tools',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DataPipelineInitializer />
        {children}
      </body>
    </html>
  );
}
