import type { Metadata } from 'next';
import { Manrope, Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-heading',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'HD Muscle CMS',
  description: 'Admin dashboard for managing synced storefront content, catalog, and commerce operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
