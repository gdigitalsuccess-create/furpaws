'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Tag, Loader2, CheckCircle, X } from 'lucide-react';

export interface PromoDiscount {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off: number | null;
  name: string;
}

interface Props {
  onApply: (discount: PromoDiscount) => void;
  onRemove: () => void;
  applied: PromoDiscount | null;
}

export default function PromoCodeInput({ onApply, onRemove, applied }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleApply() {
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json() as PromoDiscount & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Invalid code'); return; }
      onApply(data);
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    const label = applied.percent_off
      ? `${applied.percent_off}% off`
      : `${applied.amount_off?.toFixed(2)} AED off`;
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-emerald-700">{applied.code}</span>
          <span className="text-emerald-600">— {label}</span>
        </div>
        <button onClick={onRemove} className="text-emerald-500 hover:text-emerald-700 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder={isAr ? 'كود الخصم' : 'Promo code'}
            className="h-11 w-full rounded-xl border border-fur-border bg-white ps-10 pe-4 text-sm text-text-dark placeholder:text-text-muted transition-colors focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="flex items-center gap-1.5 rounded-xl border border-pink-primary px-4 py-2 text-sm font-semibold text-pink-primary transition-colors hover:bg-pink-light disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isAr ? 'تطبيق' : 'Apply'}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
