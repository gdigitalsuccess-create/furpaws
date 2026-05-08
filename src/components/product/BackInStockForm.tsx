'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';

interface BackInStockFormProps {
  productId: string;
  locale: string;
}

export default function BackInStockForm({ productId, locale }: BackInStockFormProps) {
  const isAr = locale === 'ar';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    const res = await fetch('/api/stock-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, email }),
    });

    setStatus(res.ok ? 'done' : 'error');
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-700">
        <CheckCircle className="h-4 w-4 shrink-0" />
        {isAr ? 'سيتم إشعارك عند توفر المنتج!' : "We'll notify you when it's back in stock!"}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-fur-border bg-gray-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-pink-primary" />
        <p className="text-sm font-semibold text-text-dark">
          {isAr ? 'أشعرني عند التوفر' : 'Notify me when back in stock'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isAr ? 'بريدك الإلكتروني' : 'Your email address'}
          className="flex-1 rounded-xl border border-fur-border bg-white px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center gap-1.5 rounded-xl bg-pink-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-accent disabled:opacity-60"
        >
          {status === 'loading'
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Bell className="h-4 w-4" />}
          {isAr ? 'أشعرني' : 'Notify me'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-500">
          {isAr ? 'حدث خطأ، حاول مجدداً' : 'Something went wrong. Please try again.'}
        </p>
      )}
    </div>
  );
}
