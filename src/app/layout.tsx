import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
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
  metadataBase: new URL('https://furpaws.ae'),
  openGraph: {
    siteName: 'FURPAWS',
    locale: 'en_AE',
    type: 'website',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'FURPAWS' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@furpaws_ae',
    images: ['/logo.png'],
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
      </body>
    </html>
  );
}
