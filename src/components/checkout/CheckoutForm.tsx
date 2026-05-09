'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, calculateOrderTotal, SHIPPING_BY_EMIRATE, SHIPPING_FREE_THRESHOLD } from '@/lib/pricing';
import { Loader2 } from 'lucide-react';
import type { CartItem } from '@/store/cartStore';

const UAE_EMIRATES = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
  'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah',
];

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  address: z.string().min(5),
  city: z.string().min(2),
  emirate: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

interface CheckoutFormProps {
  items: CartItem[];
  subtotal: number;
  finalTotal?: number;
  discount?: number;
  onEmirateChange?: (emirate: string) => void;
}

const inputCls =
  'h-11 w-full rounded-xl border border-fur-border bg-white px-4 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20';
const errorCls = 'mt-1 text-xs text-red-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-text-dark';

export default function CheckoutForm({ items, subtotal, finalTotal, discount, onEmirateChange }: CheckoutFormProps) {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const clearCart = useCartStore((s) => s.clearCart);
  const [processing, setProcessing] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  const { total: baseTotal } = calculateOrderTotal(subtotal);
  const total = finalTotal ?? baseTotal;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedEmirate = watch('emirate');
  useEffect(() => {
    if (selectedEmirate) onEmirateChange?.(selectedEmirate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmirate]);

  async function onSubmit(data: FormValues) {
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const returnUrl = `${window.location.origin}/${locale}/checkout/success`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message ?? 'Payment failed. Please try again.');
        return;
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        toast.error('Payment could not be confirmed. Please try again.');
        return;
      }

      // Create order in Supabase
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          shippingAddress: data,
          items,
          customerEmail: data.email,
          customerName: data.full_name,
          discount,
        }),
      });

      if (!orderRes.ok) throw new Error('Order creation failed');
      const { orderId } = await orderRes.json() as { orderId: string };

      clearCart();
      router.push(`/checkout/success?orderId=${orderId}&email=${encodeURIComponent(data.email)}`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── Shipping ── */}
      <section className="rounded-2xl border border-fur-border bg-white p-6">
        <h2 className="mb-5 font-bold text-text-dark">{t('shipping_info')}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Full name */}
          <div className="sm:col-span-2">
            <label className={labelCls}>{t('full_name')}</label>
            <input {...register('full_name')} placeholder="Mohammed Al Rashid" className={inputCls} />
            {errors.full_name && <p className={errorCls}>{errors.full_name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>{t('email')}</label>
            <input {...register('email')} type="email" placeholder="email@example.com" className={inputCls} />
            {errors.email && <p className={errorCls}>{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>{t('phone')}</label>
            <input {...register('phone')} type="tel" placeholder="+971 55 188 5039" className={inputCls} />
            {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className={labelCls}>{t('address')}</label>
            <input {...register('address')} placeholder="Villa 12, Al Nahda Street" className={inputCls} />
            {errors.address && <p className={errorCls}>{errors.address.message}</p>}
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>{t('city')}</label>
            <input {...register('city')} placeholder="Sharjah" className={inputCls} />
            {errors.city && <p className={errorCls}>{errors.city.message}</p>}
          </div>

          {/* Emirate */}
          <div>
            <label className={labelCls}>{t('emirate')}</label>
            <select {...register('emirate')} className={inputCls}>
              <option value="">{locale === 'ar' ? 'اختر الإمارة' : 'Select emirate'}</option>
              {UAE_EMIRATES.map((e) => {
                const rate = SHIPPING_BY_EMIRATE[e];
                const isFree = subtotal >= SHIPPING_FREE_THRESHOLD;
                const label = isFree ? `${e} — Free` : `${e} — ${rate} AED`;
                return <option key={e} value={e}>{label}</option>;
              })}
            </select>
            {errors.emirate && <p className={errorCls}>{errors.emirate.message}</p>}
          </div>
        </div>
      </section>

      {/* ── Payment ── */}
      <section className="rounded-2xl border border-fur-border bg-white p-6">
        <h2 className="mb-5 font-bold text-text-dark">{t('payment_info')}</h2>
        <PaymentElement onReady={() => setPaymentReady(true)} />
      </section>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={!stripe || !paymentReady || processing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary py-4 text-base font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('processing')}
          </>
        ) : (
          <>
            {t('place_order')} — {formatPrice(total, locale)}
          </>
        )}
      </button>
    </form>
  );
}
