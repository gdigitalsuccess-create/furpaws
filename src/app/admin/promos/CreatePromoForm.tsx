'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Coupon { id: string; name: string; discount: string; }

export default function CreatePromoForm({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!code.trim() || !discountValue) { setError('Code and discount are required'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json() as { error?: string; code?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to create promo code'); return; }
      setSuccess(`Code "${data.code}" created!`);
      setCode(''); setDiscountValue(''); setMaxUses(''); setExpiresAt('');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20';
  const labelCls = 'mb-1.5 block text-xs font-medium text-gray-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div>
        <label className={labelCls}>Promo Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SUMMER20"
          className={inputCls}
          required
        />
      </div>

      <div>
        <label className={labelCls}>Discount Type</label>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          {(['percent', 'fixed'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDiscountType(type)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${discountType === type ? 'bg-pink-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {type === 'percent' ? '% Percentage' : 'AED Fixed'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>{discountType === 'percent' ? 'Percentage (%)' : 'Amount (AED)'}</label>
        <input
          type="number"
          min="1"
          max={discountType === 'percent' ? 100 : undefined}
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder={discountType === 'percent' ? '20' : '50'}
          className={inputCls}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Max Uses (optional)</label>
          <input
            type="number"
            min="1"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="100"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Expires (optional)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-600 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Create Code
      </button>

      {coupons.length > 0 && (
        <p className="text-xs text-gray-400">
          Existing coupons: {coupons.map((c) => `${c.name} (${c.discount})`).join(', ')}
        </p>
      )}
    </form>
  );
}
