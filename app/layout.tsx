import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataPipelineInitializer } from '../components/DataPipelineInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Qaudquan - Financial Trading & Analysis',
  description: 'Real-time market data, technical analysis, and trading tools',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.lineicons.com/4.0/lineicons.css" />
      </head>
      <body className={inter.className}>
        <DataPipelineInitializer />
        {children}
      </body>
    </html>
  );
}
