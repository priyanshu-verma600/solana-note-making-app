import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Use local fallback for Inter font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'Solana Notes - Decentralized Note Taking',
  description: 'A decentralized note-taking application built on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}