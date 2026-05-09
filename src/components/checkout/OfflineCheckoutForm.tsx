'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, SHIPPING_BY_EMIRATE, SHIPPING_FREE_THRESHOLD } from '@/lib/pricing';
import { Loader2, Banknote, Building2 } from 'lucide-react';
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

interface OfflineCheckoutFormProps {
  items: CartItem[];
  subtotal: number;
  finalTotal: number;
  discount?: number;
  paymentMethod: 'cod' | 'bank_transfer';
  onEmirateChange?: (emirate: string) => void;
}

const inputCls =
  'h-11 w-full rounded-xl border border-fur-border bg-white px-4 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20';
const errorCls = 'mt-1 text-xs text-red-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-text-dark';

export default function OfflineCheckoutForm({
  items, subtotal, finalTotal, discount, paymentMethod, onEmirateChange,
}: OfflineCheckoutFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [processing, setProcessing] = useState(false);
  const isCod = paymentMethod === 'cod';

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const selectedEmirate = watch('emirate');
  useEffect(() => {
    if (selectedEmirate) onEmirateChange?.(selectedEmirate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmirate]);

  async function onSubmit(data: FormValues) {
    setProcessing(true);
    try {
      const res = await fetch('/api/orders/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: data,
          items: items.map((i) => ({ id: i.id, name_en: i.name_en, quantity: i.quantity, image: i.image })),
          customerEmail: data.email,
          customerName: data.full_name,
          paymentMethod,
        }),
      });

      if (!res.ok) throw new Error('Order creation failed');
      const { orderId } = await res.json() as { orderId: string };

      clearCart();
      router.push(`/checkout/success?orderId=${orderId}&email=${encodeURIComponent(data.email)}&method=${paymentMethod}`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Shipping */}
      <section className="rounded-2xl border border-fur-border bg-white p-6">
        <h2 className="mb-5 font-bold text-text-dark">
          {locale === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>{locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
            <input {...register('full_name')} placeholder="Mohammed Al Rashid" className={inputCls} />
            {errors.full_name && <p className={errorCls}>{errors.full_name.message}</p>}
          </div>

          <div>
            <label className={labelCls}>{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
            <input {...register('email')} type="email" placeholder="email@example.com" className={inputCls} />
            {errors.email && <p className={errorCls}>{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelCls}>{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
            <input {...register('phone')} type="tel" placeholder="+971 55 188 5039" className={inputCls} />
            {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>{locale === 'ar' ? 'العنوان' : 'Address'}</label>
            <input {...register('address')} placeholder="Villa 12, Al Nahda Street" className={inputCls} />
            {errors.address && <p className={errorCls}>{errors.address.message}</p>}
          </div>

          <div>
            <label className={labelCls}>{locale === 'ar' ? 'المدينة' : 'City'}</label>
            <input {...register('city')} placeholder="Sharjah" className={inputCls} />
            {errors.city && <p className={errorCls}>{errors.city.message}</p>}
          </div>

          <div>
            <label className={labelCls}>{locale === 'ar' ? 'الإمارة' : 'Emirate'}</label>
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

      {/* Payment notice */}
      <section className="rounded-2xl border border-fur-border bg-white p-6">
        <h2 className="mb-4 font-bold text-text-dark flex items-center gap-2">
          {isCod
            ? <><Banknote className="h-5 w-5 text-amber-500" />{locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</>
            : <><Building2 className="h-5 w-5 text-blue-500" />{locale === 'ar' ? 'التحويل البنكي' : 'Bank Transfer'}</>
          }
        </h2>

        {isCod ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 space-y-1">
            <p className="font-semibold">{locale === 'ar' ? '💵 كيف يعمل؟' : '💵 How it works'}</p>
            <p>{locale === 'ar'
              ? 'ستتلقى تأكيداً بالبريد الإلكتروني. يجب دفع المبلغ كاملاً نقداً عند استلام الطلب.'
              : "You'll receive an order confirmation by email. Full payment in cash is required upon delivery."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800 space-y-1">
            <p className="font-semibold">{locale === 'ar' ? '🏦 كيف يعمل؟' : '🏦 How it works'}</p>
            <p>{locale === 'ar'
              ? 'بعد تأكيد طلبك، ستتلقى بريداً إلكترونياً يتضمن بيانات حسابنا البنكي. يُرجى تحويل المبلغ خلال 48 ساعة.'
              : "After confirming your order, you'll receive an email with our bank account details. Please transfer within 48 hours to avoid cancellation."}
            </p>
          </div>
        )}
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={processing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary py-4 text-base font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {processing ? (
          <><Loader2 className="h-5 w-5 animate-spin" />{locale === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</>
        ) : (
          locale === 'ar'
            ? `تأكيد الطلب — ${formatPrice(finalTotal, locale)}`
            : `Place Order — ${formatPrice(finalTotal, locale)}`
        )}
      </button>
    </form>
  );
}
