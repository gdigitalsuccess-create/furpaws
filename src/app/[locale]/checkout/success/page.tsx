import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Order Confirmed' };

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string; email?: string; payment_intent?: string }>;
}

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'checkout' });

  const orderId = sp.orderId ?? sp.payment_intent?.slice(0, 8).toUpperCase();
  const email = sp.email ? decodeURIComponent(sp.email) : null;

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      {/* Success icon */}
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle className="h-14 w-14 text-emerald-500" />
      </div>

      <h1 className="mb-3 text-3xl font-extrabold text-text-dark">{t('success_title')}</h1>

      {email && (
        <p className="mb-2 text-text-muted">
          {t('success_message', { email })}
        </p>
      )}

      {orderId && (
        <p className="mb-8 inline-block rounded-full bg-pink-light px-4 py-1.5 text-sm font-semibold text-pink-primary">
          {t('order_number', { id: orderId })}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-pink-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent"
        >
          <ShoppingBag className="h-4 w-4" />
          {locale === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
        </Link>

        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-pink-primary px-8 py-3.5 font-semibold text-pink-primary transition-colors hover:bg-pink-light"
        >
          {locale === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
