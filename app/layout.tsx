import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Peptide Provider Finder',
    template: '%s | Peptide Provider Finder',
  },
  description:
    'Find verified, licensed medical providers and clinics offering peptide therapy consultations. Education-first directory — not medical advice.',
  keywords: ['peptide therapy', 'peptide providers', 'licensed clinics', 'telehealth', 'wellness'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
