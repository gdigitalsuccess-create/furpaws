import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SITE_CONFIG } from '@/config/site.config';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.domain),
  openGraph: {
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.ogLocale,
    type: 'website',
    images: [{ url: SITE_CONFIG.heroBgPath, width: 1200, height: 630, alt: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}` }],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE_CONFIG.twitter,
    images: [SITE_CONFIG.heroBgPath],
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
