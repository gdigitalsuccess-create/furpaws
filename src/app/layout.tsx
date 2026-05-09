import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'FURPAWS — Pet Accessories UAE',
    template: '%s | FURPAWS',
  },
  description: 'Premium pet accessories distributor in Sharjah, UAE. Shop for dogs, cats and small animals.',
  keywords: ['pet accessories UAE', 'pet shop Sharjah', 'dog food UAE', 'cat accessories', 'pet supplies Dubai', 'furpaws'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://furpaws-uae.com'),
  openGraph: {
    siteName: 'FURPAWS',
    locale: 'en_AE',
    type: 'website',
    images: [{ url: '/hero.jpg', width: 1200, height: 630, alt: 'FURPAWS — Pet Accessories UAE' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@furpaws_ae',
    images: ['/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
