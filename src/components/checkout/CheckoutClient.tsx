'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCartStore } from '@/store/cartStore';
import { calculateOrderTotal } from '@/lib/pricing';
import { Skeleton } from '@/components/ui/skeleton';
import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutClient() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    if (items.length === 0) {
      router.replace('/cart');
      return;
    }

    const { total } = calculateOrderTotal(subtotal);

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total }),
    })
      .then((r) => r.json())
      .then((d: { clientSecret?: string; error?: string }) => {
        if (d.error || !d.clientSecret) {
          setError(d.error ?? 'Failed to initialize payment');
        } else {
          setClientSecret(d.clientSecret);
        }
      })
      .catch(() => setError('Network error. Please refresh and try again.'));
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || (!clientSecret && !error)) {
    return <CheckoutSkeleton />;
  }

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

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, ...appearance }}
        >
          <CheckoutForm items={items} subtotal={subtotal} />
        </Elements>

        <OrderSummary items={items} subtotal={subtotal} />
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-9 w-40" />
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
