'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCartStore } from '@/store/cartStore';
import { calculateOrderTotal } from '@/lib/pricing';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Banknote, Building2 } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import OfflineCheckoutForm from './OfflineCheckoutForm';
import OrderSummary from './OrderSummary';
import type { PromoDiscount } from './PromoCodeInput';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentMethod = 'card' | 'cod' | 'bank_transfer';

const PAYMENT_OPTIONS: { id: PaymentMethod; icon: React.ReactNode; label: string; labelAr: string; desc: string; descAr: string }[] = [
  {
    id: 'card',
    icon: <CreditCard className="h-6 w-6" />,
    label: 'Credit / Debit Card',
    labelAr: 'بطاقة ائتمانية / مدينة',
    desc: 'Visa, Mastercard & more',
    descAr: 'فيزا، ماستركارد وغيرها',
  },
  {
    id: 'cod',
    icon: <Banknote className="h-6 w-6" />,
    label: 'Cash on Delivery',
    labelAr: 'الدفع عند الاستلام',
    desc: 'Pay when your order arrives',
    descAr: 'ادفع عند وصول طلبك',
  },
  {
    id: 'bank_transfer',
    icon: <Building2 className="h-6 w-6" />,
    label: 'Bank Transfer',
    labelAr: 'تحويل بنكي',
    desc: 'Wire transfer to our account',
    descAr: 'تحويل إلى حسابنا البنكي',
  },
];

export default function CheckoutClient() {
  const t = useTranslations('checkout');
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [error, setError] = useState('');
  const [promo, setPromo] = useState<PromoDiscount | null>(null);
  const [emirate, setEmirate] = useState('');

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const { shipping, total } = calculateOrderTotal(subtotal, emirate);

  const discount = promo
    ? promo.percent_off
      ? Math.round((total * promo.percent_off) / 100 * 100) / 100
      : (promo.amount_off ?? 0)
    : 0;
  const finalTotal = Math.max(0.5, total - discount);

  useEffect(() => { setMounted(true); }, []);

  const lineItems = items.map((i) => ({ id: i.id, quantity: i.quantity }));

  const patchBody = useCallback((overrideEmirate?: string) => ({
    paymentIntentId,
    items: lineItems,
    emirate: overrideEmirate ?? emirate,
    promoPercent: promo?.percent_off,
    promoAmount: promo?.amount_off,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [paymentIntentId, items, emirate, promo]);

  // Create Stripe PaymentIntent only when card is selected
  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) { router.replace('/cart'); return; }
    if (paymentMethod !== 'card') return;

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: lineItems, emirate }),
    })
      .then((r) => r.json())
      .then((d: { clientSecret?: string; error?: string }) => {
        if (d.error || !d.clientSecret) {
          setError(d.error ?? 'Failed to initialize payment');
        } else {
          setClientSecret(d.clientSecret);
          setPaymentIntentId(d.clientSecret.split('_secret_')[0]);
        }
      })
      .catch(() => setError('Network error. Please refresh and try again.'));
  }, [mounted, paymentMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePromoApply = useCallback(async (discount: PromoDiscount) => {
    setPromo(discount);
    if (!paymentIntentId || paymentMethod !== 'card') return;
    await fetch('/api/checkout', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...patchBody(),
        promoPercent: discount.percent_off,
        promoAmount: discount.amount_off,
      }),
    });
  }, [paymentIntentId, paymentMethod, patchBody]);

  const handlePromoRemove = useCallback(async () => {
    setPromo(null);
    if (!paymentIntentId || paymentMethod !== 'card') return;
    await fetch('/api/checkout', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...patchBody(), promoPercent: undefined, promoAmount: undefined }),
    });
  }, [paymentIntentId, paymentMethod, patchBody]);

  const handleEmirateChange = useCallback(async (newEmirate: string) => {
    setEmirate(newEmirate);
    if (!paymentIntentId || paymentMethod !== 'card') return;
    await fetch('/api/checkout', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody(newEmirate)),
    });
  }, [paymentIntentId, paymentMethod, patchBody]);

  const isCardLoading = paymentMethod === 'card' && !clientSecret && !error;
  if (!mounted || isCardLoading) return <CheckoutSkeleton />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  const appearance: Parameters<typeof Elements>[0]['options'] = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#E91E63',
        colorBackground: '#ffffff',
        colorText: '#2D3748',
        colorDanger: '#ef4444',
        borderRadius: '12px',
        fontFamily: 'inherit',
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-text-dark md:text-3xl">{t('title')}</h1>

      {/* Payment method selector */}
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold text-text-dark uppercase tracking-wide">
          Payment Method
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const selected = paymentMethod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setPaymentMethod(opt.id);
                  if (opt.id === 'card') { setClientSecret(''); setPaymentIntentId(''); }
                }}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                  selected
                    ? 'border-pink-primary bg-pink-light shadow-sm'
                    : 'border-fur-border bg-white hover:border-pink-primary/40'
                }`}
              >
                <span className={selected ? 'text-pink-primary' : 'text-text-muted'}>
                  {opt.icon}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${selected ? 'text-pink-primary' : 'text-text-dark'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-text-muted">{opt.desc}</p>
                </div>
                {selected && (
                  <span className="ms-auto h-4 w-4 shrink-0 rounded-full bg-pink-primary ring-2 ring-pink-primary ring-offset-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {paymentMethod === 'card' ? (
          <Elements stripe={stripePromise} options={{ clientSecret, ...appearance }}>
            <CheckoutForm
              items={items}
              subtotal={subtotal}
              finalTotal={finalTotal}
              discount={discount > 0 ? discount : undefined}
              onEmirateChange={handleEmirateChange}
            />
          </Elements>
        ) : (
          <OfflineCheckoutForm
            items={items}
            subtotal={subtotal}
            finalTotal={finalTotal}
            discount={discount > 0 ? discount : undefined}
            paymentMethod={paymentMethod}
            onEmirateChange={handleEmirateChange}
          />
        )}

        <OrderSummary
          items={items}
          subtotal={subtotal}
          shippingAmount={shipping}
          discount={discount}
          promo={promo}
          onPromoApply={handlePromoApply}
          onPromoRemove={handlePromoRemove}
        />
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-9 w-40" />
      <Skeleton className="mb-8 h-28 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
