import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CheckCircle, ShoppingBag, ArrowRight, Banknote, Building2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Order Confirmed' };

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string; email?: string; payment_intent?: string; method?: string }>;
}

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'checkout' });

  const orderId = sp.orderId ?? sp.payment_intent?.slice(0, 8).toUpperCase();
  const orderRef = orderId ? orderId.slice(0, 8).toUpperCase() : null;
  const email = sp.email ? decodeURIComponent(sp.email) : null;
  const method = sp.method; // 'cod' | 'bank_transfer' | undefined (card)

  // Bank details (for bank transfer)
  const bankName    = process.env.BANK_NAME         ?? 'Emirates NBD';
  const accountName = process.env.BANK_ACCOUNT_NAME ?? 'FURPAWS LLC';
  const iban        = process.env.BANK_IBAN         ?? '—';
  const swift       = process.env.BANK_SWIFT        ?? '';

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
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

      {orderRef && (
        <p className="mb-6 inline-block rounded-full bg-pink-light px-4 py-1.5 text-sm font-semibold text-pink-primary">
          {t('order_number', { id: orderRef })}
        </p>
      )}

      {/* COD notice */}
      {method === 'cod' && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="h-5 w-5 text-amber-600" />
            <p className="font-semibold text-amber-800">
              {locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
            </p>
          </div>
          <p className="text-sm text-amber-700">
            {locale === 'ar'
              ? 'طلبك مؤكد. يرجى تحضير المبلغ كاملاً نقداً عند استلام الطلب من المندوب.'
              : 'Your order is confirmed. Please have the full amount ready in cash when the delivery arrives.'}
          </p>
        </div>
      )}

      {/* Bank Transfer notice */}
      {method === 'bank_transfer' && (
        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <p className="font-semibold text-blue-800">
              {locale === 'ar' ? 'تفاصيل التحويل البنكي' : 'Bank Transfer Details'}
            </p>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            {locale === 'ar'
              ? 'يرجى تحويل المبلغ الكامل إلى الحساب التالي خلال 48 ساعة مع ذكر رقم طلبك كمرجع.'
              : 'Please transfer the full amount to the account below within 48 hours. Use your order reference as the payment description.'}
          </p>
          <div className="rounded-xl bg-white border border-blue-200 p-4 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-text-muted">Bank</span><span className="font-semibold">{bankName}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Account Name</span><span className="font-semibold">{accountName}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">IBAN</span><span className="font-bold text-blue-700">{iban}</span></div>
            {swift && <div className="flex justify-between"><span className="text-text-muted">SWIFT / BIC</span><span className="font-semibold">{swift}</span></div>}
            {orderRef && <div className="flex justify-between border-t border-blue-100 pt-2 mt-1"><span className="text-text-muted">Reference</span><span className="font-bold text-pink-primary">#{orderRef}</span></div>}
          </div>
          <p className="mt-3 text-xs text-blue-600">
            {locale === 'ar' ? '✉️ تم إرسال تفاصيل التحويل أيضاً عبر البريد الإلكتروني.' : '✉️ Transfer details have also been sent to your email.'}
          </p>
        </div>
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
