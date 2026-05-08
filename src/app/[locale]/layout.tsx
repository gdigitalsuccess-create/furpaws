import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import HtmlAttributes from './HtmlAttributes';
import CookieBanner from '@/components/layout/CookieBanner';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  // Import direct des messages par locale — fiable sans dépendre de requestLocale
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <>
      <HtmlAttributes locale={locale} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
        <CookieBanner />
        <Toaster />
      </NextIntlClientProvider>
    </>
  );
}
